ALTER TABLE rail_blocks
    ADD COLUMN show_signals BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN visible_only_in_edit_mode BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN request_yellow BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN maximum_speed_kmh INTEGER,
    ADD COLUMN slow_speed_kmh INTEGER,
    ADD COLUMN include_in_train_tracking BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN maximum_train_length_mm INTEGER,
    ADD COLUMN grid_orientation VARCHAR(20) NOT NULL DEFAULT 'HORIZONTAL';

ALTER TABLE rail_block_markers
    DROP CONSTRAINT chk_rail_block_markers_type;

ALTER TABLE rail_block_markers
    ADD COLUMN train_position VARCHAR(20) NOT NULL DEFAULT 'FRONT',
    ADD COLUMN scheduled_stop BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE rail_block_markers
    ADD CONSTRAINT chk_rail_block_markers_type
        CHECK (
            type IN (
                'BRAKE',
                'STOP',
                'SPEED',
                'ENTRY',
                'EXIT'
            )
        );

ALTER TABLE rail_block_markers
    ADD CONSTRAINT chk_rail_block_markers_train_position
        CHECK (
            train_position IN (
                'FRONT',
                'MIDDLE',
                'END',
                'FORMULA'
            )
        );

ALTER TABLE rail_blocks
    ADD CONSTRAINT chk_rail_blocks_grid_orientation
        CHECK (
            grid_orientation IN (
                'HORIZONTAL',
                'VERTICAL'
            )
        );

ALTER TABLE rail_blocks
    ADD CONSTRAINT chk_rail_blocks_maximum_speed
        CHECK (
            maximum_speed_kmh IS NULL
            OR maximum_speed_kmh >= 0
        );

ALTER TABLE rail_blocks
    ADD CONSTRAINT chk_rail_blocks_slow_speed
        CHECK (
            slow_speed_kmh IS NULL
            OR slow_speed_kmh >= 0
        );

ALTER TABLE rail_blocks
    ADD CONSTRAINT chk_rail_blocks_maximum_train_length
        CHECK (
            maximum_train_length_mm IS NULL
            OR maximum_train_length_mm >= 0
        );

ALTER TABLE rail_block_contact_assignments
    ADD COLUMN length_mm INTEGER NOT NULL DEFAULT 1000;

ALTER TABLE rail_block_contact_assignments
    ADD CONSTRAINT chk_block_contact_assignment_length
        CHECK (
            length_mm > 0
        );

CREATE TABLE rail_block_signals (
    id UUID PRIMARY KEY,
    block_id UUID NOT NULL,
    side VARCHAR(20) NOT NULL,
    signal_type VARCHAR(20) NOT NULL DEFAULT 'NONE',

    CONSTRAINT fk_rail_block_signals_block
        FOREIGN KEY (block_id)
        REFERENCES rail_blocks(id)
        ON DELETE CASCADE,

    CONSTRAINT uk_rail_block_signals_side
        UNIQUE (
            block_id,
            side
        ),

    CONSTRAINT chk_rail_block_signals_side
        CHECK (
            side IN (
                'START',
                'END'
            )
        ),

    CONSTRAINT chk_rail_block_signals_type
        CHECK (
            signal_type IN (
                'NONE',
                'TWO_ASPECT',
                'THREE_ASPECT',
                'FOUR_ASPECT'
            )
        )
);

CREATE INDEX idx_rail_block_signals_block_id
    ON rail_block_signals(block_id);