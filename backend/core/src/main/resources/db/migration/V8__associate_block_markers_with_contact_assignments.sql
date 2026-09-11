ALTER TABLE rail_block_markers
    ADD COLUMN contact_assignment_id UUID;

ALTER TABLE rail_block_markers
    ADD CONSTRAINT fk_rail_block_markers_contact_assignment
        FOREIGN KEY (contact_assignment_id)
        REFERENCES rail_block_contact_assignments(id)
        ON DELETE SET NULL;

CREATE INDEX idx_rail_block_markers_contact_assignment_id
    ON rail_block_markers(contact_assignment_id);