package com.bank.pfe1.service;

import com.bank.pfe1.entity.Vehicle;
import com.bank.pfe1.entity.VehicleStatus;
import com.bank.pfe1.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    public List<Vehicle> getVehiclesByStatus(VehicleStatus status) {
        return vehicleRepository.findByStatus(status);
    }

    public Vehicle getVehicleById(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found!"));
    }

    public Vehicle createVehicle(Vehicle vehicle) {
        if (vehicleRepository.existsByPlateNumber(vehicle.getPlateNumber())) {
            throw new RuntimeException("Plate number already exists!");
        }
        vehicle.setStatus(VehicleStatus.ACTIVE);
        return vehicleRepository.save(vehicle);
    }

    public Vehicle updateVehicle(Long id, Vehicle updated) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found!"));
        vehicle.setPlateNumber(updated.getPlateNumber());
        vehicle.setModel(updated.getModel());
        vehicle.setYear(updated.getYear());
        vehicle.setKilometrage(updated.getKilometrage());
        vehicle.setFuelType(updated.getFuelType());
        vehicle.setBrand(updated.getBrand());
        vehicle.setVehicleType(updated.getVehicleType());
        return vehicleRepository.save(vehicle);
    }

    public Vehicle updateStatus(Long id, VehicleStatus status) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found!"));
        vehicle.setStatus(status);
        return vehicleRepository.save(vehicle);
    }

    public void deleteVehicle(Long id) {
        // Check if vehicle exists first
        if (!vehicleRepository.existsById(id)) {
            throw new RuntimeException("Vehicle not found!");
        }
        vehicleRepository.deleteById(id);
    }
}