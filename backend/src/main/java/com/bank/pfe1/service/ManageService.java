package com.bank.pfe1.service;

import com.bank.pfe1.entity.*;
import com.bank.pfe1.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
public class ManageService {

    @Autowired
    private ManageRepository manageRepository;

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    // Assign vehicle to driver
    public Manage assignVehicle(Long driverId, Long vehicleId) {
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver not found"));
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        // Check vehicle is ACTIVE
        if (vehicle.getStatus() != VehicleStatus.ACTIVE) {
            throw new RuntimeException("Vehicle is not available! Status: " + vehicle.getStatus());
        }

        // Check vehicle not already assigned to another driver
        List<Manage> allManage = manageRepository.findByVehicleId(vehicleId);
        boolean vehicleAlreadyAssigned = allManage.stream()
                .anyMatch(m -> m.getEndDate() == null);
        if (vehicleAlreadyAssigned) {
            throw new RuntimeException("Vehicle is already assigned to another driver!");
        }

        // Assign vehicle to driver
        driver.setAssignedVehicle(vehicle);
        driverRepository.save(driver);

        // Change vehicle status
        vehicle.setStatus(VehicleStatus.ASSIGNED);
        vehicleRepository.save(vehicle);

        // Create manage record
        Manage manage = new Manage();
        manage.setDriver(driver);
        manage.setVehicle(vehicle);
        manage.setStartDate(LocalDate.now());
        manage.setAssignTime(LocalTime.now());
        return manageRepository.save(manage);
    }

    // Remove vehicle from driver
    public Manage removeVehicle(Long driverId, String organization, LocalDate endDate) {
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver not found"));

        List<Manage> records = manageRepository.findByDriverId(driverId);
        Manage manage = records.stream()
                .filter(m -> m.getEndDate() == null)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No active assignment found"));

        manage.setEndDate(endDate != null ? endDate : LocalDate.now());
        manage.setRemoveTime(LocalTime.now());
        manage.setOrganization(organization);

        // Change vehicle status back to ACTIVE
        Vehicle vehicle = manage.getVehicle();
        vehicle.setStatus(VehicleStatus.ACTIVE);
        vehicleRepository.save(vehicle);

        // Remove vehicle from driver
        driver.setAssignedVehicle(null);
        driverRepository.save(driver);

        return manageRepository.save(manage);
    }

    // Get full assignment history for a driver
    public List<Manage> getDriverHistory(Long driverId) {
        return manageRepository.findByDriverId(driverId);
    }
}
