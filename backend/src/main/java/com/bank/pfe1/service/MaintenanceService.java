package com.bank.pfe1.service;

import com.bank.pfe1.entity.Maintenance;
import com.bank.pfe1.entity.MaintenanceStatus;
import com.bank.pfe1.repository.MaintenanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MaintenanceService {

    private final MaintenanceRepository repository;

    // ===== CRUD =====

    public List<Maintenance> getAll() {
        return repository.findAll();
    }

    public Optional<Maintenance> getById(Long id) {
        return repository.findById(id);
    }

    public Maintenance create(Maintenance maintenance) {
        return repository.save(maintenance);
    }

    public Maintenance update(Long id, Maintenance updated) {

        Maintenance existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Maintenance not found"));

        existing.setStartDate(updated.getStartDate());
        existing.setEndDate(updated.getEndDate());
        existing.setMaintenanceType(updated.getMaintenanceType());
        existing.setCost(updated.getCost());
        existing.setDescription(updated.getDescription());
        existing.setStatus(updated.getStatus());
        existing.setVehicle(updated.getVehicle());
        existing.setVehicleParts(updated.getVehicleParts());

        return repository.save(existing);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    // ===== CUSTOM METHODS =====

    public List<Maintenance> getByVehicle(Long vehicleId) {
        return repository.findByVehicleId(vehicleId);
    }

    public List<Maintenance> getByStatus(MaintenanceStatus status) {
        return repository.findByStatus(status);
    }

    public List<Maintenance> getByType(String type) {
        return repository.findByMaintenanceType(type);
    }

    public List<Maintenance> getByDateRange(LocalDate start, LocalDate end) {
        return repository.findByStartDateBetween(start, end);
    }

    public long countByStatus(MaintenanceStatus status) {
        return repository.countByStatus(status);
    }
}