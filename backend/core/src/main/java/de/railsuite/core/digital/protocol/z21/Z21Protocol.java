package de.railsuite.core.digital.protocol.z21;

public final class Z21Protocol {

    private static final int LAN_X_SET_TURNOUT = 0x53;
    private static final int QUEUE_COMMAND = 1;

    private Z21Protocol() {
    }

    /**
     * Übersetzt die für den Benutzer sichtbare Weichennummer
     * in die von der Z21 verwendete Function Address.
     *
     * Beispiel:
     *
     * WLANMAUS / RailSuite 5
     * -> Z21 FAdr 4
     */
    public static int functionAddress(
            int turnoutAddress
    ) {
        if (turnoutAddress < 1
                || turnoutAddress > 65536) {

            throw new IllegalArgumentException(
                    "Turnout address must be between 1 and 65536"
            );
        }

        return turnoutAddress - 1;
    }

    /**
     * Erstellt ein LAN_X_SET_TURNOUT Paket.
     *
     * Q=1:
     * Der Befehl wird von der Z21 in die interne FIFO
     * eingereiht.
     */
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

        /*
         * DB2 = 10Q0A00P
         *
         * Q = 1 -> Z21 FIFO
         * A = 1 -> activate
         * A = 0 -> deactivate
         * P = 0 -> output 1
         * P = 1 -> output 2
         */
        int command =
                0xA0
                        | ((QUEUE_COMMAND & 0x01) << 4)
                        | (activate ? 0x08 : 0x00)
                        | (outputTwo ? 0x01 : 0x00);

        byte[] packet = new byte[9];

        packet[0] = 0x09;
        packet[1] = 0x00;

        packet[2] = 0x40;
        packet[3] = 0x00;

        packet[4] = (byte) LAN_X_SET_TURNOUT;
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

    public static byte[] setBroadcastFlags(
            int flags
    ) {
        byte[] packet = new byte[8];

        packet[0] = 0x08;
        packet[1] = 0x00;

        packet[2] = 0x50;
        packet[3] = 0x00;

        packet[4] = (byte) (flags & 0xFF);
        packet[5] = (byte) ((flags >> 8) & 0xFF);
        packet[6] = (byte) ((flags >> 16) & 0xFF);
        packet[7] = (byte) ((flags >> 24) & 0xFF);

        return packet;
    }
}