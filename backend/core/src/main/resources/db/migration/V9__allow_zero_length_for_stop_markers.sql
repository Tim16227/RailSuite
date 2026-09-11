ALTER TABLE rail_block_markers
    DROP CONSTRAINT IF EXISTS chk_rail_block_markers_length;

ALTER TABLE rail_block_markers
    ADD CONSTRAINT chk_rail_block_markers_length
    CHECK (
        (type = 'STOP' AND length_mm = 0)
        OR
        (type <> 'STOP' AND length_mm > 0)
    );