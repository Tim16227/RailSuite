CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    keycloak_id VARCHAR(255) UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE layouts (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE layout_cells (
    id UUID PRIMARY KEY,
    layout_id UUID NOT NULL,
    x INTEGER NOT NULL,
    y INTEGER NOT NULL,
    element_type VARCHAR(50) NOT NULL,
    orientation VARCHAR(20) NOT NULL,

    CONSTRAINT fk_layout_cells_layout
        FOREIGN KEY (layout_id)
        REFERENCES layouts(id)
        ON DELETE CASCADE,

    CONSTRAINT uk_layout_cell_position
        UNIQUE (layout_id, x, y)
);

CREATE INDEX idx_layout_cells_layout_id
    ON layout_cells(layout_id);