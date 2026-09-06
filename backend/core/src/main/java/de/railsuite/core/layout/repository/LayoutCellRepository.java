package de.railsuite.core.layout.repository;

import de.railsuite.core.layout.entity.LayoutCell;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface LayoutCellRepository
        extends JpaRepository<LayoutCell, UUID> {

    Optional<LayoutCell> findByLayoutIdAndXAndY(
            UUID layoutId,
            int x,
            int y
    );

    void deleteByLayoutIdAndXAndY(
            UUID layoutId,
            int x,
            int y
    );
}