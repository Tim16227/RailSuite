package de.railsuite.core.layout.entity;

import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(
        name = "rail_block_cells",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_rail_block_cells_position",
                        columnNames = {
                                "block_id",
                                "x",
                                "y"
                        }
                ),
                @UniqueConstraint(
                        name = "uk_rail_block_cells_sequence",
                        columnNames = {
                                "block_id",
                                "sequence_index"
                        }
                )
        }
)
public class BlockCell {

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

    @Column(nullable = false)
    private int x;

    @Column(nullable = false)
    private int y;

    @Column(
            name = "sequence_index",
            nullable = false
    )
    private int sequenceIndex;

    protected BlockCell() {
    }

    public BlockCell(
            Block block,
            int x,
            int y,
            int sequenceIndex
    ) {
        this.block = block;
        this.x = x;
        this.y = y;
        this.sequenceIndex =
                sequenceIndex;
    }

    public UUID getId() {
        return id;
    }

    public Block getBlock() {
        return block;
    }

    public int getX() {
        return x;
    }

    public int getY() {
        return y;
    }

    public int getSequenceIndex() {
        return sequenceIndex;
    }
}