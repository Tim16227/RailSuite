package de.railsuite.core.layout.entity;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "rail_blocks")
public class Block {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
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

    @OneToMany(
            mappedBy = "block",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @OrderBy("sequenceIndex ASC")
    private List<BlockCell> cells =
            new ArrayList<>();

    @OneToMany(
            mappedBy = "block",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @OrderBy("positionMm ASC")
    private List<BlockMarker> markers =
            new ArrayList<>();

    @OneToMany(
            mappedBy = "block",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<BlockContactAssignment> contactAssignments =
            new ArrayList<>();

    protected Block() {
    }

    public Block(
            Layout layout,
            String name,
            int lengthMm,
            BlockDirection direction
    ) {
        this.layout = layout;
        this.name = name;
        this.lengthMm = lengthMm;
        this.direction =
                direction == null
                        ? BlockDirection.BOTH
                        : direction;
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

    public int getLengthMm() {
        return lengthMm;
    }

    public BlockDirection getDirection() {
        return direction;
    }

    public List<BlockCell> getCells() {
        return cells;
    }

    public List<BlockMarker> getMarkers() {
        return markers;
    }

    public List<BlockContactAssignment> getContactAssignments() {
        return contactAssignments;
    }

    public void update(
            String name,
            int lengthMm,
            BlockDirection direction
    ) {
        this.name = name;
        this.lengthMm = lengthMm;
        this.direction =
                direction == null
                        ? BlockDirection.BOTH
                        : direction;
    }

    public void replaceCells(
            List<BlockCell> newCells
    ) {
        this.cells.clear();

        if (newCells != null) {
            this.cells.addAll(
                    newCells
            );
        }
    }
}