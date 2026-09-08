package de.railsuite.core.digital.protocol.z21;

import de.railsuite.core.digital.entity.DigitalInterfaceType;
import de.railsuite.core.digital.entity.DigitalSystem;
import de.railsuite.core.digital.entity.TurnoutState;
import de.railsuite.core.digital.repository.DigitalSystemRepository;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.net.SocketException;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class Z21TurnoutListener {

    private static final Logger log =
            LoggerFactory.getLogger(
                    Z21TurnoutListener.class
            );

    private static final int DEFAULT_Z21_PORT =
            21105;

    private static final int BROADCAST_TURNOUTS =
            0x00000001;

    private final DigitalSystemRepository repository;
    private final Z21TurnoutEventPublisher publisher;

    private final Map<UUID, Registration> registrations =
            new ConcurrentHashMap<>();

    public Z21TurnoutListener(
            DigitalSystemRepository repository,
            Z21TurnoutEventPublisher publisher
    ) {
        this.repository = repository;
        this.publisher = publisher;
    }

    @PostConstruct
    public void startExistingSystems() {

        repository.findAll()
                .stream()
                .filter(this::isSupportedZ21)
                .forEach(this::register);
    }

    public synchronized void register(
            DigitalSystem digitalSystem
    ) {
        if (!isSupportedZ21(digitalSystem)) {
            return;
        }

        UUID id =
                digitalSystem.getId();

        unregister(id);

        try {
            Registration registration =
                    new Registration(
                            digitalSystem
                    );

            registrations.put(
                    id,
                    registration
            );

            registration.start();

            log.info(
                    "[Z21] Listener registered for {} at {}:{} using local port {}",
                    digitalSystem.getName(),
                    digitalSystem.getHost(),
                    getZ21Port(digitalSystem),
                    registration.socket.getLocalPort()
            );

        } catch (IOException exception) {

            registrations.remove(id);

            log.error(
                    "[Z21] Could not start listener for {}",
                    digitalSystem.getName(),
                    exception
            );
        }
    }

    public synchronized void unregister(
            UUID digitalSystemId
    ) {
        Registration registration =
                registrations.remove(
                        digitalSystemId
                );

        if (registration != null) {
            registration.close();
        }
    }

    private boolean isSupportedZ21(
            DigitalSystem digitalSystem
    ) {
        return digitalSystem != null
                && digitalSystem.getId() != null
                && digitalSystem.getInterfaceType()
                == DigitalInterfaceType.NETWORK
                && "Roco/Fleischmann".equalsIgnoreCase(
                digitalSystem.getManufacturer()
        )
                && "Z21".equalsIgnoreCase(
                digitalSystem.getModel()
        )
                && digitalSystem.getHost() != null
                && !digitalSystem.getHost().isBlank();
    }

    private int getZ21Port(
            DigitalSystem digitalSystem
    ) {
        return digitalSystem.getPort() == null
                ? DEFAULT_Z21_PORT
                : digitalSystem.getPort();
    }

    @PreDestroy
    public void shutdown() {

        registrations.values()
                .forEach(
                        Registration::close
                );

        registrations.clear();
    }

    private final class Registration {

        private final DigitalSystem digitalSystem;
        private final DatagramSocket socket;

        private volatile boolean running;
        private Thread thread;

        private Registration(
                DigitalSystem digitalSystem
        ) throws SocketException {

            this.digitalSystem =
                    digitalSystem;

            /*
             * Ephemerer lokaler Port.
             *
             * Die Z21 registriert genau diesen
             * IP/Port-Endpunkt für Broadcasts.
             */
            this.socket =
                    new DatagramSocket();

            this.socket.setReuseAddress(
                    true
            );
        }

        private void start()
                throws IOException {

            sendBroadcastFlags();

            running = true;

            thread =
                    new Thread(
                            this::receiveLoop,
                            "z21-turnout-listener-"
                                    + digitalSystem.getId()
                    );

            thread.setDaemon(true);
            thread.start();
        }

        private void sendBroadcastFlags()
                throws IOException {

            byte[] packet =
                    Z21Protocol.setBroadcastFlags(
                            BROADCAST_TURNOUTS
                    );

            send(packet);

            log.debug(
                    "[Z21] Broadcast flags enabled for {}",
                    digitalSystem.getName()
            );
        }

        private void receiveLoop() {

            byte[] buffer =
                    new byte[2048];

            while (running) {

                DatagramPacket packet =
                        new DatagramPacket(
                                buffer,
                                buffer.length
                        );

                try {

                    socket.receive(
                            packet
                    );

                    handlePacket(
                            packet
                    );

                } catch (SocketException exception) {

                    if (running) {
                        log.error(
                                "[Z21] Listener socket error for {}",
                                digitalSystem.getName(),
                                exception
                        );
                    }

                    return;

                } catch (IOException exception) {

                    if (running) {
                        log.warn(
                                "[Z21] Error receiving Z21 packet for {}",
                                digitalSystem.getName(),
                                exception
                        );
                    }
                }
            }
        }

        private void handlePacket(
                DatagramPacket packet
        ) {
            int length =
                    packet.getLength();

            if (length < 9) {
                return;
            }

            byte[] data =
                    packet.getData();

            int offset =
                    packet.getOffset();

            /*
             * LAN header:
             *
             * [0] DataLen
             * [1] DataLen
             * [2] Header
             * [3] Header
             * [4] X-Header
             * [5] FAdr MSB
             * [6] FAdr LSB
             * [7] DB2
             * [8] XOR
             */

            int xHeader =
                    data[offset + 4]
                            & 0xFF;

            if (xHeader != 0x43) {
                return;
            }

            int functionAddress =
                    ((data[offset + 5] & 0xFF) << 8)
                            | (data[offset + 6] & 0xFF);

            int turnoutAddress =
                    functionAddress + 1;

            int turnoutBits =
                    data[offset + 7]
                            & 0x03;

            TurnoutState state;

            if (turnoutBits == 0x01) {

                state =
                        TurnoutState.LEFT;

            } else if (turnoutBits == 0x02) {

                state =
                        TurnoutState.RIGHT;

            } else {

                /*
                 * 00 = noch nicht geschaltet
                 * 03 = ungültig
                 *
                 * In beiden Fällen keinen
                 * gültigen Stellzustand melden.
                 */
                return;
            }

            /*
             * Optionaler XOR-Check.
             */
            int expectedXor =
                    0x43
                            ^ ((functionAddress >> 8)
                            & 0xFF)
                            ^ (functionAddress
                            & 0xFF)
                            ^ (data[offset + 7]
                            & 0xFF);

            int receivedXor =
                    data[offset + 8]
                            & 0xFF;

            if (expectedXor != receivedXor) {

                log.warn(
                        "[Z21] Ignoring turnout packet with invalid XOR"
                );

                return;
            }

            log.debug(
                    "[Z21] TURNOUT INFO: address={} FAdr={} state={}",
                    turnoutAddress,
                    functionAddress,
                    state
            );

            publisher.publish(
                    new Z21TurnoutEvent(
                            digitalSystem.getId(),
                            turnoutAddress,
                            state
                    )
            );
        }

        private void send(
                byte[] data
        ) throws IOException {

            InetAddress address =
                    InetAddress.getByName(
                            digitalSystem.getHost()
                    );

            DatagramPacket packet =
                    new DatagramPacket(
                            data,
                            data.length,
                            address,
                            getZ21Port(
                                    digitalSystem
                            )
                    );

            socket.send(packet);
        }

        private void close() {

            running = false;

            socket.close();

            if (thread != null) {
                thread.interrupt();
            }
        }
    }
}