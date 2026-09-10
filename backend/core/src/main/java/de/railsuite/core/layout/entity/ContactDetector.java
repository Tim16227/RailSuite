package de.railsuite.core.layout.entity;

import de.railsuite.core.digital.entity.DigitalSystem;
import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "contact_detectors")
public class ContactDetector {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "layout_id",
            nullable = false
    )
    private Layout layout;

    @Column(
            nullable = false,
            length = 100
    )
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 20
    )
    private ContactDetectorType type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "digital_system_id"
    )
    private DigitalSystem digitalSystem;

    @Column(name = "digital_address")
    private Integer digitalAddress;

    protected ContactDetector() {
    }

    public ContactDetector(
            Layout layout,
            String name,
            ContactDetectorType type,
            DigitalSystem digitalSystem,
            Integer digitalAddress
    ) {
        this.layout = layout;
        this.name = name;
        this.type = type;
        this.digitalSystem =
                digitalSystem;
        this.digitalAddress =
                digitalAddress;
    }

    public UUID getId() {
        return id;
    }

    public Layout getLayout() {
        return layout;
    }

    public String getName() {
        return name;
    }

    public ContactDetectorType getType() {
        return type;
    }

    public DigitalSystem getDigitalSystem() {
        return digitalSystem;
    }

    public Integer getDigitalAddress() {
        return digitalAddress;
    }

    public void update(
            String name,
            ContactDetectorType type,
            DigitalSystem digitalSystem,
            Integer digitalAddress
    ) {
        this.name = name;
        this.type = type;
        this.digitalSystem =
                digitalSystem;
        this.digitalAddress =
                digitalAddress;
    }
}