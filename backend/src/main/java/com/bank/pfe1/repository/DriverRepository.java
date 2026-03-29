package com.bank.pfe1.repository;

import com.bank.pfe1.entity.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DriverRepository extends JpaRepository<Driver, Long> {
    boolean existsByLicenseNumber(String licenseNumber);
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
}