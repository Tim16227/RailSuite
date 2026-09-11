package de.railsuite.core.layout.entity;

import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "rail_block_markers")
public class BlockMarker {

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
            fetch = FetchType.LAZY
    )
    @JoinColumn(
            name = "contact_assignment_id"
    )
    private BlockContactAssignment contactAssignment;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 20
    )
    private BlockMarkerType type;

    @Column(
            name = "position_mm",
            nullable = false
    )
    private int positionMm;

    @Column(
            name = "length_mm",
            nullable = false
    )
    private int lengthMm;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 20
    )
    private BlockDirection direction =
            BlockDirection.BOTH;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "train_position",
            nullable = false,
            length = 20
    )
    private BlockMarkerTrainPosition trainPosition =
            BlockMarkerTrainPosition.FRONT;

    @Column(
            name = "scheduled_stop",
            nullable = false
    )
    private boolean scheduledStop =
            false;

    protected BlockMarker() {
    }

    public BlockMarker(
            Block block,
            BlockContactAssignment contactAssignment,
            BlockMarkerType type,
            int positionMm,
            int lengthMm,
            BlockDirection direction,
            BlockMarkerTrainPosition trainPosition,
            boolean scheduledStop
    ) {
        this.block = block;
        this.contactAssignment =
                contactAssignment;
        this.type = type;
        this.positionMm =
                positionMm;
        this.lengthMm =
                Math.max(
                        0,
                        lengthMm
                );
        this.direction =
                direction == null
                        ? BlockDirection.BOTH
                        : direction;
        this.trainPosition =
                trainPosition == null
                        ? BlockMarkerTrainPosition.FRONT
                        : trainPosition;
        this.scheduledStop =
                scheduledStop;
    }

    public UUID getId() {
        return id;
    }

    public Block getBlock() {
        return block;
    }

    public BlockContactAssignment getContactAssignment() {
        return contactAssignment;
    }

    public BlockMarkerType getType() {
        return type;
    }

    public int getPositionMm() {
        return positionMm;
    }

    public int getLengthMm() {
        return lengthMm;
    }

    public BlockDirection getDirection() {
        return direction;
    }

    public BlockMarkerTrainPosition getTrainPosition() {
        return trainPosition;
    }

    public boolean isScheduledStop() {
        return scheduledStop;
    }

    public void update(
            BlockContactAssignment contactAssignment,
            BlockMarkerType type,
            int positionMm,
            int lengthMm,
            BlockDirection direction,
            BlockMarkerTrainPosition trainPosition,
            boolean scheduledStop
    ) {
        this.contactAssignment =
                contactAssignment;
        this.type = type;
        this.positionMm =
                positionMm;
        this.lengthMm =
                Math.max(
                        0,
                        lengthMm
                );
        this.direction =
                direction == null
                        ? BlockDirection.BOTH
                        : direction;
        this.trainPosition =
                trainPosition == null
                        ? BlockMarkerTrainPosition.FRONT
                        : trainPosition;
        this.scheduledStop =
                scheduledStop;
    }
}