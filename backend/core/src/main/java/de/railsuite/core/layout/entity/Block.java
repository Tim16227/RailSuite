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

    @Column(
            name = "show_signals",
            nullable = false
    )
    private boolean showSignals = true;

    @Column(
            name = "visible_only_in_edit_mode",
            nullable = false
    )
    private boolean visibleOnlyInEditMode = false;

    @Column(
            name = "request_yellow",
            nullable = false
    )
    private boolean requestYellow = false;

    @Column(
            name = "maximum_speed_kmh"
    )
    private Integer maximumSpeedKmh;

    @Column(
            name = "slow_speed_kmh"
    )
    private Integer slowSpeedKmh;

    @Column(
            name = "include_in_train_tracking",
            nullable = false
    )
    private boolean includeInTrainTracking = true;

    @Column(
            name = "maximum_train_length_mm"
    )
    private Integer maximumTrainLengthMm;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "grid_orientation",
            nullable = false,
            length = 20
    )
    private BlockGridOrientation gridOrientation =
            BlockGridOrientation.HORIZONTAL;

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

    public boolean isShowSignals() {
        return showSignals;
    }

    public boolean isVisibleOnlyInEditMode() {
        return visibleOnlyInEditMode;
    }

    public boolean isRequestYellow() {
        return requestYellow;
    }

    public Integer getMaximumSpeedKmh() {
        return maximumSpeedKmh;
    }

    public Integer getSlowSpeedKmh() {
        return slowSpeedKmh;
    }

    public boolean isIncludeInTrainTracking() {
        return includeInTrainTracking;
    }

    public Integer getMaximumTrainLengthMm() {
        return maximumTrainLengthMm;
    }

    public BlockGridOrientation getGridOrientation() {
        return gridOrientation;
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

    public void updateEditorProperties(
            String name,
            int lengthMm,
            BlockDirection direction,
            boolean showSignals,
            boolean visibleOnlyInEditMode,
            boolean requestYellow,
            Integer maximumSpeedKmh,
            Integer slowSpeedKmh,
            boolean includeInTrainTracking,
            Integer maximumTrainLengthMm,
            BlockGridOrientation gridOrientation
    ) {
        this.name = name;
        this.lengthMm = lengthMm;
        this.direction =
                direction == null
                        ? BlockDirection.BOTH
                        : direction;

        this.showSignals = showSignals;
        this.visibleOnlyInEditMode =
                visibleOnlyInEditMode;
        this.requestYellow = requestYellow;
        this.maximumSpeedKmh =
                maximumSpeedKmh;
        this.slowSpeedKmh =
                slowSpeedKmh;
        this.includeInTrainTracking =
                includeInTrainTracking;
        this.maximumTrainLengthMm =
                maximumTrainLengthMm;
        this.gridOrientation =
                gridOrientation == null
                        ? BlockGridOrientation.HORIZONTAL
                        : gridOrientation;
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