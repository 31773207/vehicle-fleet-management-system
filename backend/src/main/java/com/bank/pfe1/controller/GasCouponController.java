package com.bank.pfe1.controller;

import com.bank.pfe1.entity.GasCoupon;
import com.bank.pfe1.service.GasCouponService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/gas-coupons")
public class GasCouponController {

    @Autowired
    private GasCouponService gasCouponService;

    @GetMapping
    public List<GasCoupon> getAllCoupons() {
        return gasCouponService.getAllCoupons();
    }

    @GetMapping("/{id}")
    public ResponseEntity<GasCoupon> getCouponById(@PathVariable Long id) {
        return ResponseEntity.ok(gasCouponService.getCouponById(id));
    }

    @GetMapping("/driver/{driverId}")
    public List<GasCoupon> getCouponsByDriver(@PathVariable Long driverId) {
        return gasCouponService.getCouponsByDriver(driverId);
    }

    @PostMapping
    public ResponseEntity<GasCoupon> createCoupon(@RequestBody GasCoupon coupon) {
        return ResponseEntity.ok(gasCouponService.createCoupon(coupon));
    }

    @PatchMapping("/{id}/assign/{driverId}")
    public ResponseEntity<GasCoupon> assignToDriver(@PathVariable Long id, @PathVariable Long driverId) {
        return ResponseEntity.ok(gasCouponService.assignToDriver(id, driverId));
    }

    @PatchMapping("/{id}/transfer")
    public ResponseEntity<GasCoupon> transferCoupon(@PathVariable Long id, @RequestParam String organization) {
        return ResponseEntity.ok(gasCouponService.transferCoupon(id, organization));
    }

    @PatchMapping("/{id}/use")
    public ResponseEntity<GasCoupon> useCoupon(@PathVariable Long id) {
        return ResponseEntity.ok(gasCouponService.useCoupon(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCoupon(@PathVariable Long id) {
        gasCouponService.deleteCoupon(id);
        return ResponseEntity.noContent().build();
    }
}