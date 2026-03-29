package com.bank.pfe1.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalTime;
import java.time.LocalDate;
@Entity
@Table(name = "mission_time")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MissionTime {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalTime departureTime;
    private LocalTime returnTime;
    private LocalDate missionDate;

    @ManyToOne
    @JoinColumn(name = "mission_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Mission mission;
}