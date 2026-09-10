package de.railsuite.core.layout.repository;

import de.railsuite.core.layout.entity.ContactDetector;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ContactDetectorRepository
        extends JpaRepository<ContactDetector, UUID> {

    List<ContactDetector>
    findByLayoutIdOrderByNameAsc(
            UUID layoutId
    );
}