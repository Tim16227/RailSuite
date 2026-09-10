CREATE TABLE rail_blocks (
    id UUID PRIMARY KEY,
    layout_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    length_mm INTEGER NOT NULL,
    direction VARCHAR(20) NOT NULL DEFAULT 'BOTH',

    CONSTRAINT fk_rail_blocks_layout
        FOREIGN KEY (layout_id)
        REFERENCES layouts(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_rail_blocks_length
        CHECK (length_mm > 0),

    CONSTRAINT chk_rail_blocks_direction
        CHECK (
            direction IN (
                'BOTH',
                'FORWARD',
                'REVERSE'
            )
        )
);

CREATE INDEX idx_rail_blocks_layout_id
    ON rail_blocks(layout_id);


CREATE TABLE rail_block_cells (
    id UUID PRIMARY KEY,
    block_id UUID NOT NULL,
    x INTEGER NOT NULL,
    y INTEGER NOT NULL,
    sequence_index INTEGER NOT NULL,

    CONSTRAINT fk_rail_block_cells_block
        FOREIGN KEY (block_id)
        REFERENCES rail_blocks(id)
        ON DELETE CASCADE,

    CONSTRAINT uk_rail_block_cells_position
        UNIQUE (
            block_id,
            x,
            y
        ),

    CONSTRAINT uk_rail_block_cells_sequence
        UNIQUE (
            block_id,
            sequence_index
        )
);

CREATE INDEX idx_rail_block_cells_block_id
    ON rail_block_cells(block_id);


CREATE TABLE rail_block_markers (
    id UUID PRIMARY KEY,
    block_id UUID NOT NULL,
    type VARCHAR(20) NOT NULL,
    position_mm INTEGER NOT NULL,
    length_mm INTEGER NOT NULL,
    direction VARCHAR(20) NOT NULL DEFAULT 'BOTH',

    CONSTRAINT fk_rail_block_markers_block
        FOREIGN KEY (block_id)
        REFERENCES rail_blocks(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_rail_block_markers_type
        CHECK (
            type IN (
                'BRAKE',
                'STOP',
                'ENTRY',
                'EXIT'
            )
        ),

    CONSTRAINT chk_rail_block_markers_position
        CHECK (
            position_mm >= 0
        ),

    CONSTRAINT chk_rail_block_markers_length
        CHECK (
            length_mm > 0
        ),

    CONSTRAINT chk_rail_block_markers_direction
        CHECK (
            direction IN (
                'BOTH',
                'FORWARD',
                'REVERSE'
            )
        )
);

CREATE INDEX idx_rail_block_markers_block_id
    ON rail_block_markers(block_id);


CREATE TABLE contact_detectors (
    id UUID PRIMARY KEY,
    layout_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL,
    digital_system_id UUID,
    digital_address INTEGER,

    CONSTRAINT fk_contact_detectors_layout
        FOREIGN KEY (layout_id)
        REFERENCES layouts(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_contact_detectors_digital_system
        FOREIGN KEY (digital_system_id)
        REFERENCES digital_systems(id)
        ON DELETE SET NULL,

    CONSTRAINT chk_contact_detectors_type
        CHECK (
            type IN (
                'PHYSICAL',
                'VIRTUAL'
            )
        ),

    CONSTRAINT chk_contact_detectors_address
        CHECK (
            digital_address IS NULL
            OR digital_address >= 1
        )
);

CREATE INDEX idx_contact_detectors_layout_id
    ON contact_detectors(layout_id);

CREATE INDEX idx_contact_detectors_digital_system_id
    ON contact_detectors(digital_system_id);


CREATE TABLE rail_block_contact_assignments (
    id UUID PRIMARY KEY,
    block_id UUID NOT NULL,
    contact_detector_id UUID NOT NULL,
    role VARCHAR(20) NOT NULL,
    position_mm INTEGER,

    CONSTRAINT fk_block_contact_assignments_block
        FOREIGN KEY (block_id)
        REFERENCES rail_blocks(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_block_contact_assignments_detector
        FOREIGN KEY (contact_detector_id)
        REFERENCES contact_detectors(id)
        ON DELETE CASCADE,

    CONSTRAINT uk_block_contact_assignment
        UNIQUE (
            block_id,
            contact_detector_id,
            role
        ),

    CONSTRAINT chk_block_contact_assignment_role
        CHECK (
            role IN (
                'ENTRY',
                'OCCUPANCY',
                'EXIT'
            )
        ),

    CONSTRAINT chk_block_contact_assignment_position
        CHECK (
            position_mm IS NULL
            OR position_mm >= 0
        )
);

CREATE INDEX idx_block_contact_assignments_block_id
    ON rail_block_contact_assignments(block_id);

CREATE INDEX idx_block_contact_assignments_detector_id
    ON rail_block_contact_assignments(contact_detector_id);