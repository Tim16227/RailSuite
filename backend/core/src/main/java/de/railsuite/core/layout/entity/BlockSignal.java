package de.railsuite.core.layout.entity;

import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(
        name = "rail_block_signals",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_rail_block_signals_side",
                        columnNames = {
                                "block_id",
                                "side"
                        }
                )
        }
)
public class BlockSignal {

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
    private BlockSignalSide side;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "signal_type",
            nullable = false,
            length = 20
    )
    private BlockSignalType signalType =
            BlockSignalType.NONE;

    protected BlockSignal() {
    }

    public BlockSignal(
            Block block,
            BlockSignalSide side,
            BlockSignalType signalType
    ) {
        this.block = block;
        this.side = side;
        this.signalType =
                signalType == null
                        ? BlockSignalType.NONE
                        : signalType;
    }

    public UUID getId() {
        return id;
    }

    public Block getBlock() {
        return block;
    }

    public BlockSignalSide getSide() {
        return side;
    }

    public BlockSignalType getSignalType() {
        return signalType;
    }

    public void update(
            BlockSignalType signalType
    ) {
        this.signalType =
                signalType == null
                        ? BlockSignalType.NONE
                        : signalType;
    }
}