package com.bank.pfe1.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "vehicle_part")
@Data
@NoArgsConstructor
@AllArgsConstructor
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class VehiclePart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String partName;
    private String condition;
    private String notes;

    @ManyToOne
    @JoinColumn(name = "technical_check_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "parts"})
    private TechnicalCheck technicalCheck;
}