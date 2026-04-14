package com.bank.pfe1.repository;

import com.bank.pfe1.entity.Driver;
import com.bank.pfe1.entity.GasCoupon;
import com.bank.pfe1.entity.CouponStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface GasCouponRepository extends JpaRepository<GasCoupon, Long> {

    List<GasCoupon> findByDriverId(Long driverId);

    List<GasCoupon> findByDriver(Driver driver);

    List<GasCoupon> findByStatus(CouponStatus status);

    List<GasCoupon> findByDriverAndStatus(Driver driver, CouponStatus status);

    Optional<GasCoupon> findByCouponNumber(String couponNumber);

    List<GasCoupon> findByIssueDateBetween(LocalDate startDate, LocalDate endDate);

    List<GasCoupon> findByUsedDateBetween(LocalDate startDate, LocalDate endDate);

    List<GasCoupon> findByTransferredTo(String driverName);

    long countByStatus(CouponStatus status);
}