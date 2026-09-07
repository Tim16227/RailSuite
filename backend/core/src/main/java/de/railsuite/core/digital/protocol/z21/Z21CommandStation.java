package de.railsuite.core.digital.protocol.z21;

import de.railsuite.core.digital.communication.DigitalCommandStation;
import de.railsuite.core.digital.communication.DigitalConnectionException;
import de.railsuite.core.digital.entity.DigitalInterfaceType;
import de.railsuite.core.digital.entity.DigitalSystem;
import de.railsuite.core.digital.entity.TurnoutState;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.net.SocketTimeoutException;

@Component
public class Z21CommandStation implements DigitalCommandStation {

    private static final Logger log =
            LoggerFactory.getLogger(Z21CommandStation.class);

    private static final int DEFAULT_Z21_PORT = 21105;

    private static final int Z21_HEADER_LOW = 0x40;
    private static final int Z21_HEADER_HIGH = 0x00;

    private static final int LAN_X_SET_TURNOUT = 0x53;
    private static final int LAN_X_GET_TURNOUT_INFO = 0x43;

    private static final int QUEUE_COMMAND = 1;

    private static final int ACTIVATE = 1;
    private static final int DEACTIVATE = 0;

    private static final int RESPONSE_TIMEOUT_MS = 1000;

    @Override
    public void setTurnout(
            DigitalSystem digitalSystem,
            int digitalAddress,
            int digitalPort,
            TurnoutState state
    ) {
        validate(
                digitalSystem,
                digitalAddress,
                digitalPort,
                state
        );

        int fAdr = (digitalAddress - 1) * 4 + (digitalPort - 1);

        int p =
                state == TurnoutState.LEFT
                        ? 0
                        : 1;

        int targetPort =
                getPort(digitalSystem);

        log.info(
                "[Z21] ========================================"
        );

        log.info(
                "[Z21] TURNOUT COMMAND"
        );

        log.info(
                "[Z21] Target: {}:{}",
                digitalSystem.getHost(),
                targetPort
        );

        log.info(
                "[Z21] Digital address: {}",
                digitalAddress
        );

        log.info(
                "[Z21] Digital port: {}",
                digitalPort
        );

        log.info(
                "[Z21] State: {}",
                state
        );

        log.info(
                "[Z21] Function address (fAdr): {}",
                fAdr
        );

        log.info(
                "[Z21] Output P: {}",
                p
        );

        try (DatagramSocket socket = new DatagramSocket()) {

            socket.setSoTimeout(
                    RESPONSE_TIMEOUT_MS
            );

            /*
             * -------------------------------------------------
             * 1. ACTIVATE
             * -------------------------------------------------
             */

            byte[] activatePacket =
                    createTurnoutPacket(
                            fAdr,
                            QUEUE_COMMAND,
                            ACTIVATE,
                            p
                    );

            log.info(
                    "[Z21] SEND ACTIVATE: {}",
                    toHex(activatePacket)
            );

            send(
                    socket,
                    digitalSystem,
                    activatePacket
            );

            /*
             * -------------------------------------------------
             * 2. DEACTIVATE
             * -------------------------------------------------
             */

            byte[] deactivatePacket =
                    createTurnoutPacket(
                            fAdr,
                            QUEUE_COMMAND,
                            DEACTIVATE,
                            p
                    );

            log.info(
                    "[Z21] SEND DEACTIVATE: {}",
                    toHex(deactivatePacket)
            );

            send(
                    socket,
                    digitalSystem,
                    deactivatePacket
            );

            sleep(
                    digitalSystem.getSendPause()
            );

            /*
             * -------------------------------------------------
             * 3. ASK Z21 FOR CURRENT TURNOUT STATE
             * -------------------------------------------------
             */

            byte[] getTurnoutInfoPacket =
                    createGetTurnoutInfoPacket(
                            fAdr
                    );

            log.info(
                    "[Z21] SEND GET TURNOUT INFO: {}",
                    toHex(getTurnoutInfoPacket)
            );

            send(
                    socket,
                    digitalSystem,
                    getTurnoutInfoPacket
            );

            /*
             * -------------------------------------------------
             * 4. WAIT FOR Z21 RESPONSE
             * -------------------------------------------------
             */

            receiveTurnoutResponse(
                    socket,
                    fAdr
            );

            log.info(
                    "[Z21] ========================================"
            );

        } catch (IOException exception) {

            log.error(
                    "[Z21] Communication error with {}:{}",
                    digitalSystem.getHost(),
                    targetPort,
                    exception
            );

            throw new DigitalConnectionException(
                    "Could not communicate with Z21 at "
                            + digitalSystem.getHost()
                            + ":"
                            + targetPort,
                    exception
            );
        }
    }

    private byte[] createTurnoutPacket(
            int fAdr,
            int q,
            int a,
            int p
    ) {
        int fAdrLow =
                fAdr & 0xFF;

        int fAdrHigh =
                (fAdr >> 8) & 0xFF;

        /*
         * Z21 LAN_X_SET_TURNOUT:
         *
         * DB2 = 10Q0A00P
         *
         * bit 7 = 1
         * bit 6 = 0
         * bit 5 = 1
         * bit 4 = Q
         * bit 3 = A
         * bit 2 = 0
         * bit 1 = 0
         * bit 0 = P
         */

        int command =
                0xA0
                        | ((q & 0x01) << 4)
                        | ((a & 0x01) << 3)
                        | (p & 0x01);

        int xor =
                LAN_X_SET_TURNOUT
                        ^ fAdrHigh
                        ^ fAdrLow
                        ^ command;

        return new byte[] {
                0x09,
                0x00,
                (byte) Z21_HEADER_LOW,
                (byte) Z21_HEADER_HIGH,
                (byte) LAN_X_SET_TURNOUT,
                (byte) fAdrHigh,
                (byte) fAdrLow,
                (byte) command,
                (byte) xor
        };
    }

    private byte[] createGetTurnoutInfoPacket(
            int fAdr
    ) {
        int fAdrLow =
                fAdr & 0xFF;

        int fAdrHigh =
                (fAdr >> 8) & 0xFF;

        /*
         * Z21 LAN_X_GET_TURNOUT_INFO:
         *
         * 08 00 40 00 43
         * FAdr_MSB
         * FAdr_LSB
         * XOR
         */

        int xor =
                LAN_X_GET_TURNOUT_INFO
                        ^ fAdrHigh
                        ^ fAdrLow;

        return new byte[] {
                0x08,
                0x00,
                (byte) Z21_HEADER_LOW,
                (byte) Z21_HEADER_HIGH,
                (byte) LAN_X_GET_TURNOUT_INFO,
                (byte) fAdrHigh,
                (byte) fAdrLow,
                (byte) xor
        };
    }

    private void receiveTurnoutResponse(
            DatagramSocket socket,
            int expectedFAdr
    ) throws IOException {

        byte[] buffer =
                new byte[1024];

        DatagramPacket response =
                new DatagramPacket(
                        buffer,
                        buffer.length
                );

        try {

            socket.receive(response);

            byte[] data =
                    new byte[
                            response.getLength()
                            ];

            System.arraycopy(
                    response.getData(),
                    response.getOffset(),
                    data,
                    0,
                    response.getLength()
            );

            log.info(
                    "[Z21] RECEIVE FROM {}:{}",
                    response.getAddress()
                            .getHostAddress(),
                    response.getPort()
            );

            log.info(
                    "[Z21] RECEIVE HEX: {}",
                    toHex(data)
            );

            log.info(
                    "[Z21] RECEIVE LENGTH: {} bytes",
                    data.length
            );

            if (data.length >= 8) {

                int xHeader =
                        data[4] & 0xFF;

                int fAdrHigh =
                        data[5] & 0xFF;

                int fAdrLow =
                        data[6] & 0xFF;

                int responseFAdr =
                        (fAdrHigh << 8)
                                | fAdrLow;

                log.info(
                        "[Z21] Response X-Header: 0x{}",
                        String.format(
                                "%02X",
                                xHeader
                        )
                );

                log.info(
                        "[Z21] Response function address: {}",
                        responseFAdr
                );

                if (
                        responseFAdr
                                == expectedFAdr
                ) {
                    log.info(
                            "[Z21] RESPONSE MATCHES REQUESTED TURNOUT"
                    );
                } else {
                    log.warn(
                            "[Z21] RESPONSE ADDRESS {} DOES NOT MATCH REQUESTED ADDRESS {}",
                            responseFAdr,
                            expectedFAdr
                    );
                }
            }

        } catch (SocketTimeoutException exception) {

            log.warn(
                    "[Z21] NO RESPONSE within {} ms",
                    RESPONSE_TIMEOUT_MS
            );

            log.warn(
                    "[Z21] The SET command itself does not normally return a response."
            );

            log.warn(
                    "[Z21] Therefore this timeout means that no response to GET_TURNOUT_INFO was received."
            );
        }
    }

    private void send(
            DatagramSocket socket,
            DigitalSystem digitalSystem,
            byte[] data
    ) throws IOException {

        InetAddress address =
                InetAddress.getByName(
                        digitalSystem.getHost()
                );

        int port =
                getPort(digitalSystem);

        DatagramPacket packet =
                new DatagramPacket(
                        data,
                        data.length,
                        address,
                        port
                );

        socket.send(packet);
    }

    private int getPort(
            DigitalSystem digitalSystem
    ) {
        return digitalSystem.getPort() == null
                ? DEFAULT_Z21_PORT
                : digitalSystem.getPort();
    }

    private void validate(
            DigitalSystem digitalSystem,
            int digitalAddress,
            int digitalPort,
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

        if (
                digitalSystem.getInterfaceType()
                        != DigitalInterfaceType.NETWORK
        ) {
            throw new DigitalConnectionException(
                    "Z21 requires a network digital system"
            );
        }

        if (
                digitalSystem.getHost() == null
                        || digitalSystem.getHost().isBlank()
        ) {
            throw new DigitalConnectionException(
                    "Z21 host must not be empty"
            );
        }

        if (digitalAddress < 0) {
            throw new DigitalConnectionException(
                    "Digital address must not be negative"
            );
        }

        if (
                digitalPort < 1
                        || digitalPort > 4
        ) {
            throw new DigitalConnectionException(
                    "Digital port must be between 1 and 4"
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

    private void sleep(
            int milliseconds
    ) {
        if (milliseconds <= 0) {
            return;
        }

        try {
            Thread.sleep(milliseconds);

        } catch (InterruptedException exception) {

            Thread.currentThread().interrupt();

            throw new DigitalConnectionException(
                    "Interrupted while waiting for digital command",
                    exception
            );
        }
    }
}