package com.bank.pfe1.service;

import com.bank.pfe1.entity.*;
import com.bank.pfe1.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class GasCouponService {

    @Autowired
    private GasCouponRepository gasCouponRepository;

    @Autowired
    private DriverRepository driverRepository;

    public List<GasCoupon> getAllCoupons() {
        return gasCouponRepository.findAll();
    }

    public GasCoupon getCouponById(Long id) {
        return gasCouponRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Coupon not found with id: " + id));
    }

    public List<GasCoupon> getCouponsByDriver(Long driverId) {
        return gasCouponRepository.findByDriverId(driverId);
    }

    public GasCoupon createCoupon(GasCoupon coupon) {
        coupon.setStatus(CouponStatus.AVAILABLE);
        return gasCouponRepository.save(coupon);
    }

    public GasCoupon assignToDriver(Long id, Long driverId) {
        GasCoupon coupon = getCouponById(id);
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver not found"));
        coupon.setDriver(driver);
        coupon.setStatus(CouponStatus.ASSIGNED);
        return gasCouponRepository.save(coupon);
    }

    public GasCoupon transferCoupon(Long id, String organization) {
        GasCoupon coupon = getCouponById(id);
        coupon.setTransferredTo(organization);
        coupon.setStatus(CouponStatus.TRANSFERRED);
        coupon.setDriver(null);
        return gasCouponRepository.save(coupon);
    }

    public GasCoupon useCoupon(Long id) {
        GasCoupon coupon = getCouponById(id);
        coupon.setStatus(CouponStatus.USED);
        return gasCouponRepository.save(coupon);
    }

    public void deleteCoupon(Long id) {
        gasCouponRepository.deleteById(id);
    }
}