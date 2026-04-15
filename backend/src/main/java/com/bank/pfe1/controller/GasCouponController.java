package com.bank.pfe1.controller;

import com.bank.pfe1.entity.*;
import com.bank.pfe1.service.GasCouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/gas-coupons")
@RequiredArgsConstructor
public class GasCouponController {

    private final GasCouponService service;

    @GetMapping
    public List<GasCoupon> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public GasCoupon getById(@PathVariable Long id) {
        return service.getById(id)
                .orElseThrow(() -> new RuntimeException("Not found"));
    }

    @PostMapping
    public GasCoupon create(@RequestBody GasCoupon coupon) {
        return service.create(coupon);
    }

    @PutMapping("/{id}")
    public GasCoupon update(@PathVariable Long id, @RequestBody GasCoupon coupon) {
        return service.update(id, coupon);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    
    @PatchMapping("/{couponId}/assign/{driverId}")
    public ResponseEntity<GasCoupon> assignToDriver(
            @PathVariable Long couponId,
            @PathVariable Long driverId) {
        return ResponseEntity.ok(service.assignToDriver(couponId, driverId));
    }

    
    @PatchMapping("/{couponId}/transfer")
    public ResponseEntity<GasCoupon> transfer(
            @PathVariable Long couponId,
            @RequestParam String transferredTo) {
        return ResponseEntity.ok(service.transfer(couponId, transferredTo));
    }


    @PatchMapping("/{couponId}/use")
    public ResponseEntity<GasCoupon> markAsUsed(@PathVariable Long couponId) {
        return ResponseEntity.ok(service.markAsUsed(couponId));
    }

   

    @GetMapping("/driver/{driverId}")
    public List<GasCoupon> byDriver(@PathVariable Long driverId) {
        return service.getByDriver(driverId);
    }

    @GetMapping("/status/{status}")
    public List<GasCoupon> byStatus(@PathVariable CouponStatus status) {
        return service.getByStatus(status);
    }

    @GetMapping("/count/{status}")
    public long count(@PathVariable CouponStatus status) {
        return service.countByStatus(status);
    }

    @GetMapping("/date-range")
    public List<GasCoupon> byDateRange(
            @RequestParam LocalDate start,
            @RequestParam LocalDate end) {
        return service.getByDateRange(start, end);
    }

    @GetMapping("/number/{number}")
    public GasCoupon byNumber(@PathVariable String number) {
        return service.getByCouponNumber(number)
                .orElseThrow(() -> new RuntimeException("Not found"));
    }
}