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
    private boolean scheduledStop = false;

    protected BlockMarker() {
    }

    public BlockMarker(
            Block block,
            BlockMarkerType type,
            int positionMm,
            int lengthMm,
            BlockDirection direction
    ) {
        this(
                block,
                type,
                positionMm,
                lengthMm,
                direction,
                BlockMarkerTrainPosition.FRONT,
                false
        );
    }

    public BlockMarker(
            Block block,
            BlockMarkerType type,
            int positionMm,
            int lengthMm,
            BlockDirection direction,
            BlockMarkerTrainPosition trainPosition,
            boolean scheduledStop
    ) {
        this.block = block;
        this.type = type;
        this.positionMm = positionMm;
        this.lengthMm = lengthMm;
        this.direction =
                direction == null
                        ? BlockDirection.BOTH
                        : direction;
        this.trainPosition =
                trainPosition == null
                        ? BlockMarkerTrainPosition.FRONT
                        : trainPosition;
        this.scheduledStop = scheduledStop;
    }

    public UUID getId() {
        return id;
    }

    public Block getBlock() {
        return block;
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
            BlockMarkerType type,
            int positionMm,
            int lengthMm,
            BlockDirection direction
    ) {
        update(
                type,
                positionMm,
                lengthMm,
                direction,
                this.trainPosition,
                this.scheduledStop
        );
    }

    public void update(
            BlockMarkerType type,
            int positionMm,
            int lengthMm,
            BlockDirection direction,
            BlockMarkerTrainPosition trainPosition,
            boolean scheduledStop
    ) {
        this.type = type;
        this.positionMm = positionMm;
        this.lengthMm = lengthMm;
        this.direction =
                direction == null
                        ? BlockDirection.BOTH
                        : direction;
        this.trainPosition =
                trainPosition == null
                        ? BlockMarkerTrainPosition.FRONT
                        : trainPosition;
        this.scheduledStop = scheduledStop;
    }
}