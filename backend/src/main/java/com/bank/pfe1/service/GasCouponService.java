package com.bank.pfe1.service;

import com.bank.pfe1.entity.*;
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

    public List<GasCoupon> getAll() {
        return repository.findAll();
    }

    public Optional<GasCoupon> getById(Long id) {
        return repository.findById(id);
    }

    public GasCoupon create(GasCoupon coupon) {
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

    // ====== YOUR CUSTOM METHODS ======

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