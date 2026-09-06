package de.railsuite.core;

import de.railsuite.core.digital.entity.DigitalInterfaceType;
import de.railsuite.core.digital.entity.DigitalSystem;
import de.railsuite.core.digital.entity.TurnoutState;
import de.railsuite.core.digital.protocol.z21.Z21CommandStation;
import org.junit.jupiter.api.Test;

import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;

class Z21CommandStationTest {

    @Test
    void shouldSendLeftTurnoutCommand() throws Exception {

        try (DatagramSocket receiver =
                     new DatagramSocket(21105)) {

            receiver.setSoTimeout(
                    (int) Duration.ofSeconds(2).toMillis()
            );

            DigitalSystem digitalSystem =
                    new DigitalSystem(
                            "Test Z21",
                            "Roco/Fleischmann",
                            "Z21",
                            DigitalInterfaceType.NETWORK,
                            0,
                            10,
                            "127.0.0.1",
                            21105
                    );

            Z21CommandStation commandStation =
                    new Z21CommandStation();

            Thread sender =
                    new Thread(() ->
                            commandStation.setTurnout(
                                    digitalSystem,
                                    1,
                                    1,
                                    TurnoutState.LEFT
                            )
                    );

            sender.start();

            byte[] activate =
                    receivePacket(receiver);

            byte[] deactivate =
                    receivePacket(receiver);

            sender.join();

            assertArrayEquals(
                    new byte[] {
                            0x09,
                            0x00,
                            0x40,
                            0x00,
                            0x53,
                            0x00,
                            0x04,
                            (byte) 0xB8,
                            (byte) 0xEF
                    },
                    activate
            );

            assertArrayEquals(
                    new byte[] {
                            0x09,
                            0x00,
                            0x40,
                            0x00,
                            0x53,
                            0x00,
                            0x04,
                            (byte) 0xB0,
                            (byte) 0xE7
                    },
                    deactivate
            );
        }
    }

    @Test
    void shouldSendRightTurnoutCommand() throws Exception {

        try (DatagramSocket receiver =
                     new DatagramSocket(21105)) {

            receiver.setSoTimeout(
                    (int) Duration.ofSeconds(2).toMillis()
            );

            DigitalSystem digitalSystem =
                    new DigitalSystem(
                            "Test Z21",
                            "Roco/Fleischmann",
                            "Z21",
                            DigitalInterfaceType.NETWORK,
                            0,
                            10,
                            "127.0.0.1",
                            21105
                    );

            Z21CommandStation commandStation =
                    new Z21CommandStation();

            Thread sender =
                    new Thread(() ->
                            commandStation.setTurnout(
                                    digitalSystem,
                                    1,
                                    1,
                                    TurnoutState.RIGHT
                            )
                    );

            sender.start();

            byte[] activate =
                    receivePacket(receiver);

            byte[] deactivate =
                    receivePacket(receiver);

            sender.join();

            assertArrayEquals(
                    new byte[] {
                            0x09,
                            0x00,
                            0x40,
                            0x00,
                            0x53,
                            0x00,
                            0x04,
                            (byte) 0xB9,
                            (byte) 0xEE
                    },
                    activate
            );

            assertArrayEquals(
                    new byte[] {
                            0x09,
                            0x00,
                            0x40,
                            0x00,
                            0x53,
                            0x00,
                            0x04,
                            (byte) 0xB1,
                            (byte) 0xE6
                    },
                    deactivate
            );
        }
    }

    private byte[] receivePacket(
            DatagramSocket receiver
    ) throws Exception {

        byte[] buffer =
                new byte[64];

        DatagramPacket packet =
                new DatagramPacket(
                        buffer,
                        buffer.length
                );

        receiver.receive(packet);

        assertEquals(
                9,
                packet.getLength()
        );

        byte[] result =
                new byte[packet.getLength()];

        System.arraycopy(
                packet.getData(),
                packet.getOffset(),
                result,
                0,
                packet.getLength()
        );

        return result;
    }
}