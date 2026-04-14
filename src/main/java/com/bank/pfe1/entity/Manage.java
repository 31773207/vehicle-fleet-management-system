package com.bank.pfe1.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;  // ✅ Add this

@Entity
@Table(name = "manage")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Manage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "employee_id")
    private Employee employee;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;

    private LocalDateTime assignedAt;   // ✅ Use LocalDateTime
    private LocalDateTime removedAt;    // ✅ Use LocalDateTime

    private String organization;
    private String notes;
}