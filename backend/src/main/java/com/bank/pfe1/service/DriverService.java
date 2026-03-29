package com.bank.pfe1.service;

import com.bank.pfe1.entity.Driver;
import com.bank.pfe1.repository.DriverRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class DriverService {

    @Autowired
    private DriverRepository driverRepository;

    public List<Driver> getAllDrivers() {
        return driverRepository.findAll();
    }

    public Driver getDriverById(Long id) {
        return driverRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Driver not found with id: " + id));
    }

    //add driver
    public Driver createDriver(Driver driver) {
        if (driverRepository.existsByLicenseNumber(driver.getLicenseNumber()))
            throw new RuntimeException("License number already exists!");
        if (driverRepository.existsByEmail(driver.getEmail()))
            throw new RuntimeException("Email already exists!");
        if (driverRepository.existsByPhone(driver.getPhone()))
            throw new RuntimeException("Phone already exists!");
        return driverRepository.save(driver);
    }

    //edit driver
    public Driver updateDriver(Long id, Driver updated) {
        Driver driver = getDriverById(id);
        driver.setFirstName(updated.getFirstName());
        driver.setLastName(updated.getLastName());
        driver.setPhone(updated.getPhone());
        driver.setEmail(updated.getEmail());
        driver.setAddress(updated.getAddress());
        driver.setDateOfBirth(updated.getDateOfBirth());
        driver.setLicenseNumber(updated.getLicenseNumber());
        driver.setLicenseExpiry(updated.getLicenseExpiry());
        driver.setAssignedVehicle(updated.getAssignedVehicle());
        return driverRepository.save(driver);
    }
//delete driver
    public void deleteDriver(Long id) {
        driverRepository.deleteById(id);
    }
}