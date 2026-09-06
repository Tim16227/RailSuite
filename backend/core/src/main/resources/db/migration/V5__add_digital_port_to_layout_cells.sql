ALTER TABLE layout_cells
ADD COLUMN digital_port INTEGER;

ALTER TABLE layout_cells
ADD CONSTRAINT chk_layout_cells_digital_port
    CHECK (
        digital_port IS NULL
        OR (digital_port >= 1 AND digital_port <= 4)
    );