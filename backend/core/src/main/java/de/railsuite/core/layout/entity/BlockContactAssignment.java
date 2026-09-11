package de.railsuite.core.layout.entity;

import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(
        name = "rail_block_contact_assignments",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_block_contact_assignment",
                        columnNames = {
                                "block_id",
                                "contact_detector_id",
                                "role"
                        }
                )
        }
)
public class BlockContactAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "block_id",
            nullable = false
    )
    private Block block;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "contact_detector_id",
            nullable = false
    )
    private ContactDetector contactDetector;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 20
    )
    private BlockContactRole role;

    @Column(name = "position_mm")
    private Integer positionMm;

    @Column(
            name = "length_mm",
            nullable = false
    )
    private int lengthMm = 1000;

    protected BlockContactAssignment() {
    }

    public BlockContactAssignment(
            Block block,
            ContactDetector contactDetector,
            BlockContactRole role,
            Integer positionMm
    ) {
        this(
                block,
                contactDetector,
                role,
                positionMm,
                1000
        );
    }

    public BlockContactAssignment(
            Block block,
            ContactDetector contactDetector,
            BlockContactRole role,
            Integer positionMm,
            int lengthMm
    ) {
        this.block = block;
        this.contactDetector = contactDetector;
        this.role = role;
        this.positionMm = positionMm;
        this.lengthMm =
                Math.max(
                        1,
                        lengthMm
                );
    }

    public UUID getId() {
        return id;
    }

    public Block getBlock() {
        return block;
    }

    public ContactDetector getContactDetector() {
        return contactDetector;
    }

    public BlockContactRole getRole() {
        return role;
    }

    public Integer getPositionMm() {
        return positionMm;
    }

    public int getLengthMm() {
        return lengthMm;
    }

    public void updateEditorPosition(
            Integer positionMm,
            int lengthMm
    ) {
        this.positionMm =
                positionMm;
        this.lengthMm =
                Math.max(
                        1,
                        lengthMm
                );
    }
}