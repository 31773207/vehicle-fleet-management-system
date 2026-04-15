package com.bank.pfe1.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;  // ✅ ADD THIS IMPORT
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
@Entity
@Table(name = "vehicle")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})  // ✅ ADD THIS

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

    private Double price; 

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private VehicleStatus status = VehicleStatus.AVAILABLE;

    @ManyToOne
    @JoinColumn(name = "brand_id")
    private Brand brand;
    private String color;  // Add this field
    @ManyToOne
    @JoinColumn(name = "type_id")
    private VehicleType vehicleType;

    // ✅ These fields need LocalDateTime
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assigned_to_id")
    @JsonIgnore  // ✅ Add this
    private Employee assignedTo;

    private LocalDateTime assignedAt;  // ✅ Now works with import
}