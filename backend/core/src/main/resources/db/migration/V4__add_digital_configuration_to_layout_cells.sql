ALTER TABLE layout_cells
ADD COLUMN digital_system_id UUID;

ALTER TABLE layout_cells
ADD COLUMN digital_address INTEGER;

ALTER TABLE layout_cells
ADD CONSTRAINT fk_layout_cells_digital_system
    FOREIGN KEY (digital_system_id)
    REFERENCES digital_systems(id)
    ON DELETE SET NULL;

ALTER TABLE layout_cells
ADD CONSTRAINT chk_layout_cells_digital_address
    CHECK (
        digital_address IS NULL
        OR digital_address >= 1
    );

CREATE INDEX idx_layout_cells_digital_system_id
    ON layout_cells(digital_system_id);