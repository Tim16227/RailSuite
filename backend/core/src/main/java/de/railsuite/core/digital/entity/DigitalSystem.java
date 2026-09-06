package de.railsuite.core.digital.entity;

import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "digital_systems")
public class DigitalSystem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 100)
    private String manufacturer;

    @Column(nullable = false, length = 100)
    private String model;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "interface_type",
            nullable = false,
            length = 20
    )
    private DigitalInterfaceType interfaceType;

    @Column(
            name = "send_pause",
            nullable = false
    )
    private int sendPause;

    @Column(
            name = "turnout_pause",
            nullable = false
    )
    private int turnoutPause;

    @Column(length = 255)
    private String host;

    @Column
    private Integer port;

    protected DigitalSystem() {
    }

    public DigitalSystem(
            String name,
            String manufacturer,
            String model,
            DigitalInterfaceType interfaceType,
            int sendPause,
            int turnoutPause,
            String host,
            Integer port
    ) {
        this.name = name;
        this.manufacturer = manufacturer;
        this.model = model;
        this.interfaceType = interfaceType;
        this.sendPause = sendPause;
        this.turnoutPause = turnoutPause;
        this.host = host;
        this.port = port;
    }

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getManufacturer() {
        return manufacturer;
    }

    public String getModel() {
        return model;
    }

    public DigitalInterfaceType getInterfaceType() {
        return interfaceType;
    }

    public int getSendPause() {
        return sendPause;
    }

    public int getTurnoutPause() {
        return turnoutPause;
    }

    public String getHost() {
        return host;
    }

    public Integer getPort() {
        return port;
    }

    public void update(
            String name,
            String manufacturer,
            String model,
            DigitalInterfaceType interfaceType,
            int sendPause,
            int turnoutPause,
            String host,
            Integer port
    ) {
        this.name = name;
        this.manufacturer = manufacturer;
        this.model = model;
        this.interfaceType = interfaceType;
        this.sendPause = sendPause;
        this.turnoutPause = turnoutPause;
        this.host = host;
        this.port = port;
    }
}