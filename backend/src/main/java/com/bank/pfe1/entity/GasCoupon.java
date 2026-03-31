package com.bank.pfe1.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "gas_coupon")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"driver"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class GasCoupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @NotBlank(message = "Coupon number is required")
    @Column(nullable = false, unique = true, length = 50)
    private String couponNumber;

    @NotNull(message = "Fuel amount is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Fuel amount must be positive")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal fuelAmount;

    @NotNull(message = "Issue date is required")
    @Column(nullable = false)
    private LocalDate issueDate;

    //
    private String transferredTo;
    @Column(name = "transfer_date")
    private LocalDate transferDate;
    //
    @Column(name = "assigned_date")
    private LocalDate assignedDate;

    //
    @Column(name = "used_date")
    private LocalDate usedDate;

    @NotNull(message = "Status is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private CouponStatus status;

    //
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id")
    @JsonIgnoreProperties({"gasCoupons", "assignedVehicle"})
    private Driver driver;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;



}