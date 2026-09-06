package de.railsuite.core.layout.entity;

import de.railsuite.core.layout.entity.LayoutCell;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "layouts")
public class Layout {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false)
    private int width;

    @Column(nullable = false)
    private int height;

    @Version
    private long version;

    @OneToMany(
            mappedBy = "layout",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<LayoutCell> cells = new ArrayList<>();

    protected Layout() {
    }

    public Layout(
            String name,
            int width,
            int height
    ) {
        this.name = name;
        this.width = width;
        this.height = height;
    }

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public int getWidth() {
        return width;
    }

    public int getHeight() {
        return height;
    }

    public long getVersion() {
        return version;
    }

    public List<LayoutCell> getCells() {
        return cells;
    }

    public void setName(String name) {
        this.name = name;
    }
}