package de.railsuite.core.digital.protocol.z21;

public final class Z21Protocol {

    private Z21Protocol() {
    }

    public static byte[] setTurnout(
            int functionAddress,
            boolean activate,
            boolean outputTwo
    ) {
        if (functionAddress < 0
                || functionAddress > 65535) {
            throw new IllegalArgumentException(
                    "Function address must be between 0 and 65535"
            );
        }

        int high =
                (functionAddress >> 8) & 0xFF;

        int low =
                functionAddress & 0xFF;

        int command =
                0x80;

        if (activate) {
            command |= 0x08;
        }

        if (outputTwo) {
            command |= 0x01;
        }

        byte[] packet = new byte[9];

        packet[0] = 0x09;
        packet[1] = 0x00;

        packet[2] = 0x40;
        packet[3] = 0x00;

        packet[4] = 0x53;

        packet[5] = (byte) high;
        packet[6] = (byte) low;

        packet[7] = (byte) command;

        packet[8] =
                xor(
                        packet[4],
                        packet[5],
                        packet[6],
                        packet[7]
                );

        return packet;
    }

    private static byte xor(
            byte... values
    ) {
        byte result = 0;

        for (byte value : values) {
            result ^= value;
        }

        return result;
    }
}