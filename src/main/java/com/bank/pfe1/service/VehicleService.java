package com.bank.pfe1.service;

import com.bank.pfe1.entity.Vehicle;
import com.bank.pfe1.entity.VehicleStatus;
import com.bank.pfe1.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
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

    public List<Vehicle> getAvailableVehicles() {
        return vehicleRepository.findAvailableVehicles();
    }

    @Transactional
    public Vehicle createVehicle(Vehicle vehicle) {
        if (vehicleRepository.existsByPlateNumber(vehicle.getPlateNumber())) {
            throw new RuntimeException("Plate number already exists!");
        }

        // ✅ If car is 10+ years old -> REFORMED, else -> AVAILABLE
        int currentYear = LocalDate.now().getYear();
        if (vehicle.getYear() != null && (currentYear - vehicle.getYear()) >= 10) {
            vehicle.setStatus(VehicleStatus.REFORMED);
        } else {
            vehicle.setStatus(VehicleStatus.AVAILABLE);
        }

        return vehicleRepository.save(vehicle);
    }

    @Transactional
    public Vehicle updateVehicle(Long id, Vehicle updated) {
        Vehicle vehicle = getVehicleById(id);
        vehicle.setPlateNumber(updated.getPlateNumber());
        vehicle.setModel(updated.getModel());
        vehicle.setYear(updated.getYear());
        vehicle.setKilometrage(updated.getKilometrage());
        vehicle.setFuelType(updated.getFuelType());
        vehicle.setBrand(updated.getBrand());
        vehicle.setVehicleType(updated.getVehicleType());

        // ✅ Re-check age and update status if needed
        int currentYear = LocalDate.now().getYear();
        if (vehicle.getYear() != null && (currentYear - vehicle.getYear()) >= 10) {
            vehicle.setStatus(VehicleStatus.REFORMED);
        } else {
            vehicle.setStatus(VehicleStatus.AVAILABLE);
        }

        return vehicleRepository.save(vehicle);
    }

    @Transactional
    public Vehicle updateStatus(Long id, VehicleStatus status) {
        Vehicle vehicle = getVehicleById(id);
        vehicle.setStatus(status);
        return vehicleRepository.save(vehicle);
    }

    @Transactional
    public void deleteVehicle(Long id) {
        if (!vehicleRepository.existsById(id)) {
            throw new RuntimeException("Vehicle not found!");
        }
        vehicleRepository.deleteById(id);
    }
}