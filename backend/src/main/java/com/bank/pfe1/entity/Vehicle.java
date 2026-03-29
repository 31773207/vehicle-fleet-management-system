package com.bank.pfe1.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "vehicle")
@Data
@NoArgsConstructor
@AllArgsConstructor
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Builder
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String plateNumber;

    private String model;

    private Integer year;

    private Double kilometrage;

    private String fuelType;

    @Enumerated(EnumType.STRING)
    private VehicleStatus status;

    // Link to Brand
    @ManyToOne
    @JoinColumn(name = "brand_id")
    private Brand brand;

    // Link to VehicleType
    @ManyToOne
    @JoinColumn(name = "type_id")
    private VehicleType vehicleType;
}