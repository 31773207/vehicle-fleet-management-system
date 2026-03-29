package com.bank.pfe1.service;

import com.bank.pfe1.entity.*;
import com.bank.pfe1.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class MaintenanceService {

    @Autowired
    private MaintenanceRepository maintenanceRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    public List<Maintenance> getAllMaintenance() {
        return maintenanceRepository.findAll();
    }

    public List<Maintenance> getMaintenanceByVehicle(Long vehicleId) {
        return maintenanceRepository.findByVehicleId(vehicleId);
    }

    public Maintenance getMaintenanceById(Long id) {
        return maintenanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Maintenance not found with id: " + id));
    }

    public Maintenance createMaintenance(Maintenance maintenance) {
        // Load full vehicle
        Vehicle vehicle = vehicleRepository.findById(maintenance.getVehicle().getId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
        maintenance.setVehicle(vehicle);

        // Set status to SCHEDULED
        maintenance.setStatus(MaintenanceStatus.SCHEDULED);

        // Change vehicle status to IN_REVISION
        vehicle.setStatus(VehicleStatus.IN_REVISION);
        vehicleRepository.save(vehicle);

        return maintenanceRepository.save(maintenance);
    }

    public Maintenance completeMaintenance(Long id) {
        Maintenance maintenance = getMaintenanceById(id);
        maintenance.setStatus(MaintenanceStatus.COMPLETED);

        // Change vehicle status back to ACTIVE
        Vehicle vehicle = maintenance.getVehicle();
        vehicle.setStatus(VehicleStatus.ACTIVE);
        vehicleRepository.save(vehicle);

        return maintenanceRepository.save(maintenance);
    }

    public Maintenance updateMaintenance(Long id, Maintenance updated) {
        Maintenance maintenance = getMaintenanceById(id);
        maintenance.setDescription(updated.getDescription());
        maintenance.setStartDate(updated.getStartDate());
        maintenance.setEndDate(updated.getEndDate());
        maintenance.setCost(updated.getCost());
        return maintenanceRepository.save(maintenance);
    }

    public void deleteMaintenance(Long id) {
        maintenanceRepository.deleteById(id);
    }
}