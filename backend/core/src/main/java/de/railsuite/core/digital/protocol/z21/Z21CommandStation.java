package de.railsuite.core.digital.protocol.z21;

import de.railsuite.core.digital.communication.DigitalCommandStation;
import de.railsuite.core.digital.communication.DigitalConnectionException;
import de.railsuite.core.digital.entity.DigitalInterfaceType;
import de.railsuite.core.digital.entity.DigitalSystem;
import de.railsuite.core.digital.entity.TurnoutState;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;

@Component
public class Z21CommandStation implements DigitalCommandStation {

    private static final int DEFAULT_Z21_PORT = 21105;

    private static final int Z21_HEADER_LOW = 0x40;
    private static final int Z21_HEADER_HIGH = 0x00;

    private static final int LAN_X_SET_TURNOUT = 0x53;

    private static final int QUEUE_COMMAND = 1;
    private static final int ACTIVATE = 1;
    private static final int DEACTIVATE = 0;

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

        int fAdr =
                digitalAddress * 4
                        + (digitalPort - 1);

        int p =
                state == TurnoutState.LEFT
                        ? 0
                        : 1;

        try (DatagramSocket socket = new DatagramSocket()) {

            byte[] activatePacket =
                    createTurnoutPacket(
                            fAdr,
                            QUEUE_COMMAND,
                            ACTIVATE,
                            p
                    );

            send(
                    socket,
                    digitalSystem,
                    activatePacket
            );

            sleep(
                    digitalSystem.getTurnoutPause()
            );

            byte[] deactivatePacket =
                    createTurnoutPacket(
                            fAdr,
                            QUEUE_COMMAND,
                            DEACTIVATE,
                            p
                    );

            send(
                    socket,
                    digitalSystem,
                    deactivatePacket
            );

            sleep(
                    digitalSystem.getSendPause()
            );

        } catch (IOException exception) {
            throw new DigitalConnectionException(
                    "Could not communicate with Z21 at "
                            + digitalSystem.getHost()
                            + ":"
                            + getPort(digitalSystem),
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

        if (digitalAddress < 0) {
            throw new DigitalConnectionException(
                    "Digital address must not be negative"
            );
        }

        if (digitalPort < 1 || digitalPort > 4) {
            throw new DigitalConnectionException(
                    "Digital port must be between 1 and 4"
            );
        }
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