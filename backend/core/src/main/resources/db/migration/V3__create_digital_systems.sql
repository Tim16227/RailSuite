CREATE TABLE digital_systems (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    manufacturer VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    interface_type VARCHAR(20) NOT NULL,
    send_pause INTEGER NOT NULL DEFAULT 0,
    turnout_pause INTEGER NOT NULL DEFAULT 0,
    host VARCHAR(255),
    port INTEGER,

    CONSTRAINT chk_digital_system_interface_type
        CHECK (interface_type IN ('OFFLINE', 'NETWORK')),

    CONSTRAINT chk_digital_system_send_pause
        CHECK (send_pause >= 0),

    CONSTRAINT chk_digital_system_turnout_pause
        CHECK (turnout_pause >= 0),

    CONSTRAINT chk_digital_system_port
        CHECK (
            port IS NULL
            OR (port >= 1 AND port <= 65535)
        )
);