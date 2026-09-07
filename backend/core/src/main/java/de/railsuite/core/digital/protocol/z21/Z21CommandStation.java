package de.railsuite.core.digital.protocol.z21;

import de.railsuite.core.digital.communication.DigitalCommandStation;
import de.railsuite.core.digital.communication.DigitalConnectionException;
import de.railsuite.core.digital.entity.DigitalInterfaceType;
import de.railsuite.core.digital.entity.DigitalSystem;
import de.railsuite.core.digital.entity.TurnoutState;

import jakarta.annotation.PreDestroy;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.net.SocketException;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Component
public class Z21CommandStation implements DigitalCommandStation {

    private static final Logger log =
            LoggerFactory.getLogger(
                    Z21CommandStation.class
            );

    private static final int DEFAULT_Z21_PORT = 21105;

    private final DatagramSocket socket;

    private final ScheduledExecutorService scheduler =
            Executors.newScheduledThreadPool(
                    2,
                    runnable -> {
                        Thread thread =
                                new Thread(
                                        runnable,
                                        "railsuite-z21"
                                );

                        thread.setDaemon(true);

                        return thread;
                    }
            );

    public Z21CommandStation() {
        try {
            this.socket =
                    new DatagramSocket();

        } catch (SocketException exception) {

            throw new IllegalStateException(
                    "Could not create Z21 UDP socket",
                    exception
            );
        }
    }

    @Override
    public void setTurnout(
            DigitalSystem digitalSystem,
            int digitalAddress,
            TurnoutState state
    ) {
        validate(
                digitalSystem,
                digitalAddress,
                state
        );

        /*
         * RailSuite-Adresse entspricht der sichtbaren
         * WLANMAUS-Adresse.
         *
         * Beispiel:
         *
         * RailSuite 5
         * -> Z21 FAdr 4
         */
        int functionAddress =
                Z21Protocol.functionAddress(
                        digitalAddress
                );

        boolean outputTwo =
                state == TurnoutState.RIGHT;

        int turnoutPause =
                Math.max(
                        0,
                        digitalSystem.getTurnoutPause()
                );

        /*
         * -------------------------------------------------
         * 1. ACTIVE SOFORT
         * -------------------------------------------------
         *
         * Q=1 -> Z21 FIFO
         */
        byte[] activatePacket =
                Z21Protocol.setTurnout(
                        functionAddress,
                        true,
                        outputTwo
                );

        send(
                digitalSystem,
                activatePacket
        );

        /*
         * -------------------------------------------------
         * 2. DEACTIVE ZEITGESTEUERT
         * -------------------------------------------------
         *
         * Der HTTP-Request wartet NICHT.
         *
         * Dadurch können mehrere Weichen praktisch
         * unmittelbar hintereinander geschaltet werden.
         */
        if (turnoutPause <= 0) {

            sendDeactivate(
                    digitalSystem,
                    functionAddress,
                    outputTwo
            );

            return;
        }

        scheduler.schedule(
                () ->
                        sendDeactivate(
                                digitalSystem,
                                functionAddress,
                                outputTwo
                        ),
                turnoutPause,
                TimeUnit.MILLISECONDS
        );
    }

    private void sendDeactivate(
            DigitalSystem digitalSystem,
            int functionAddress,
            boolean outputTwo
    ) {
        byte[] deactivatePacket =
                Z21Protocol.setTurnout(
                        functionAddress,
                        false,
                        outputTwo
                );

        try {
            send(
                    digitalSystem,
                    deactivatePacket
            );

        } catch (DigitalConnectionException exception) {

            log.error(
                    "Could not send Z21 turnout deactivate "
                            + "for address {}",
                    functionAddress + 1,
                    exception
            );
        }
    }

    private void send(
            DigitalSystem digitalSystem,
            byte[] data
    ) {
        try {
            InetAddress address =
                    InetAddress.getByName(
                            digitalSystem.getHost()
                    );

            int port =
                    digitalSystem.getPort() == null
                            ? DEFAULT_Z21_PORT
                            : digitalSystem.getPort();

            DatagramPacket packet =
                    new DatagramPacket(
                            data,
                            data.length,
                            address,
                            port
                    );

            synchronized (socket) {
                socket.send(packet);
            }

            log.debug(
                    "[Z21] {}:{} -> {}",
                    digitalSystem.getHost(),
                    port,
                    toHex(data)
            );

        } catch (IOException exception) {

            throw new DigitalConnectionException(
                    "Could not communicate with Z21 at "
                            + digitalSystem.getHost()
                            + ":"
                            + (
                            digitalSystem.getPort() == null
                                    ? DEFAULT_Z21_PORT
                                    : digitalSystem.getPort()
                    ),
                    exception
            );
        }
    }

    private void validate(
            DigitalSystem digitalSystem,
            int digitalAddress,
            TurnoutState state
    ) {
        if (digitalSystem == null) {

            throw new DigitalConnectionException(
                    "Digital system must not be null"
            );
        }

        if (state == null) {

            throw new DigitalConnectionException(
                    "Turnout state must not be null"
            );
        }

        if (digitalSystem.getInterfaceType()
                != DigitalInterfaceType.NETWORK) {

            throw new DigitalConnectionException(
                    "Z21 requires a network digital system"
            );
        }

        if (digitalSystem.getHost() == null
                || digitalSystem.getHost().isBlank()) {

            throw new DigitalConnectionException(
                    "Z21 host must not be empty"
            );
        }

        if (digitalAddress < 1
                || digitalAddress > 65536) {

            throw new DigitalConnectionException(
                    "Turnout address must be between 1 and 65536"
            );
        }
    }

    private String toHex(
            byte[] data
    ) {
        StringBuilder builder =
                new StringBuilder();

        for (byte value : data) {

            if (builder.length() > 0) {
                builder.append(" ");
            }

            builder.append(
                    String.format(
                            "%02X",
                            value & 0xFF
                    )
            );
        }

        return builder.toString();
    }

    @PreDestroy
    public void shutdown() {
        scheduler.shutdownNow();
        socket.close();
    }
}