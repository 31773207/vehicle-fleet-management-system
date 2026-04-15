package com.bank.pfe1.service;

import com.bank.pfe1.entity.*;
import com.bank.pfe1.repository.DriverRepository;
import com.bank.pfe1.repository.GasCouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class GasCouponService {

    private final GasCouponRepository repository;
    private final DriverRepository driverRepository;

    public List<GasCoupon> getAll() {
        return repository.findAll();
    }

    public Optional<GasCoupon> getById(Long id) {
        return repository.findById(id);
    }

    public GasCoupon create(GasCoupon coupon) {
        coupon.setStatus(CouponStatus.AVAILABLE);
        coupon.setIssueDate(LocalDate.now());
        return repository.save(coupon);
    }

    public GasCoupon update(Long id, GasCoupon updated) {
        GasCoupon existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Coupon not found"));

        existing.setCouponNumber(updated.getCouponNumber());
        existing.setFuelAmount(updated.getFuelAmount());
        existing.setIssueDate(updated.getIssueDate());
        existing.setStatus(updated.getStatus());
        existing.setDriver(updated.getDriver());
        existing.setAssignedDate(updated.getAssignedDate());
        existing.setUsedDate(updated.getUsedDate());
        existing.setTransferredTo(updated.getTransferredTo());
        existing.setTransferDate(updated.getTransferDate());

        return repository.save(existing);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    
    public GasCoupon assignToDriver(Long couponId, Long driverId) {
        GasCoupon coupon = repository.findById(couponId)
                .orElseThrow(() -> new RuntimeException("Coupon not found"));

        if (coupon.getStatus() != CouponStatus.AVAILABLE) {
            throw new RuntimeException("Coupon is not available for assignment. Current status: " + coupon.getStatus());
        }

        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver not found"));

        coupon.setDriver(driver);
        coupon.setStatus(CouponStatus.ASSIGNED);
        coupon.setAssignedDate(LocalDate.now());
        return repository.save(coupon);
    }

    
    public GasCoupon transfer(Long couponId, String transferredTo) {
        GasCoupon coupon = repository.findById(couponId)
                .orElseThrow(() -> new RuntimeException("Coupon not found"));

        if (coupon.getStatus() == CouponStatus.USED) {
            throw new RuntimeException("Cannot transfer a used coupon.");
        }

        coupon.setTransferredTo(transferredTo);
        coupon.setTransferDate(LocalDate.now());
        coupon.setStatus(CouponStatus.TRANSFERRED);
        coupon.setDriver(null);
        return repository.save(coupon);
    }

    
    public GasCoupon markAsUsed(Long couponId) {
        GasCoupon coupon = repository.findById(couponId)
                .orElseThrow(() -> new RuntimeException("Coupon not found"));

        if (coupon.getStatus() != CouponStatus.ASSIGNED) {
            throw new RuntimeException("Only ASSIGNED coupons can be marked as used.");
        }

        coupon.setStatus(CouponStatus.USED);
        coupon.setUsedDate(LocalDate.now());
        return repository.save(coupon);
    }

    public List<GasCoupon> getByDriver(Long driverId) {
        return repository.findByDriverId(driverId);
    }

    public List<GasCoupon> getByStatus(CouponStatus status) {
        return repository.findByStatus(status);
    }

    public List<GasCoupon> getByDriverAndStatus(Driver driver, CouponStatus status) {
        return repository.findByDriverAndStatus(driver, status);
    }

    public Optional<GasCoupon> getByCouponNumber(String number) {
        return repository.findByCouponNumber(number);
    }

    public List<GasCoupon> getByDateRange(LocalDate start, LocalDate end) {
        return repository.findByIssueDateBetween(start, end);
    }

    public long countByStatus(CouponStatus status) {
        return repository.countByStatus(status);
    }
}