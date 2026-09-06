package de.railsuite.core.layout.entity;

import de.railsuite.core.digital.entity.DigitalSystem;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(
        name = "layout_cells",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_layout_cell_position",
                        columnNames = {
                                "layout_id",
                                "x",
                                "y"
                        }
                )
        }
)
public class LayoutCell {

    @Getter
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "layout_id",
            nullable = false
    )
    private Layout layout;

    @Getter
    @Column(nullable = false)
    private int x;

    @Getter
    @Column(nullable = false)
    private int y;

    @Getter
    @Enumerated(EnumType.STRING)
    @Column(
            name = "element_type",
            nullable = false,
            length = 50
    )
    private LayoutElementType elementType;

    @Getter
    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 20
    )
    private LayoutOrientation orientation;

    @Getter
    @Setter
    @Enumerated(EnumType.STRING)
    @Column(name = "turnout_hand", length = 10)
    private LayoutTurnoutHand turnoutHand;

    @Getter
    @Setter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "digital_system_id")
    private DigitalSystem digitalSystem;

    @Getter
    @Setter
    @Column(name = "digital_address")
    private Integer digitalAddress;

    @Getter
    @Setter
    @Column(name = "digital_port")
    private Integer digitalPort;

    protected LayoutCell() {
    }

    public LayoutCell(
            Layout layout,
            int x,
            int y,
            LayoutElementType elementType,
            LayoutOrientation orientation
    ) {
        this.layout = layout;
        this.x = x;
        this.y = y;
        this.elementType = elementType;
        this.orientation = orientation;
    }

    public void update(
            LayoutElementType elementType,
            LayoutOrientation orientation
    ) {
        this.elementType = elementType;
        this.orientation = orientation;

        if (elementType != LayoutElementType.TURNOUT) {
            this.turnoutHand = null;
            this.digitalSystem = null;
            this.digitalAddress = null;
            this.digitalPort = null;
        }
    }
}