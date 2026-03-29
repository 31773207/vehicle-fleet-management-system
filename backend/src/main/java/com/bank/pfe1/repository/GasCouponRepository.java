package com.bank.pfe1.repository;

import com.bank.pfe1.entity.CouponStatus;
import com.bank.pfe1.entity.GasCoupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GasCouponRepository extends JpaRepository<GasCoupon, Long> {
    List<GasCoupon> findByDriverId(Long driverId);
    List<GasCoupon> findByStatus(CouponStatus status);
}