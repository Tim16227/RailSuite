package de.railsuite.core.layout.repository;

import de.railsuite.core.layout.entity.Block;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface BlockRepository
        extends JpaRepository<Block, UUID> {

    List<Block> findByLayoutIdOrderByNameAsc(
            UUID layoutId
    );
}