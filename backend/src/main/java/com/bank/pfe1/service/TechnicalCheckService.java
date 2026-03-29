package com.bank.pfe1.service;

import com.bank.pfe1.entity.*;
import com.bank.pfe1.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class TechnicalCheckService {

    @Autowired
    private TechnicalCheckRepository technicalCheckRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    public List<TechnicalCheck> getAllChecks() {
        return technicalCheckRepository.findAll();
    }

    public TechnicalCheck getCheckById(Long id) {
        return technicalCheckRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("TechnicalCheck not found with id: " + id));
    }

    public List<TechnicalCheck> getChecksByVehicle(Long vehicleId) {
        return technicalCheckRepository.findByVehicleId(vehicleId);
    }

    public TechnicalCheck createCheck(TechnicalCheck check) {
        Vehicle vehicle = vehicleRepository.findById(check.getVehicle().getId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
        check.setVehicle(vehicle);
        check.setStatus(TechnicalCheckStatus.VALID);
        return technicalCheckRepository.save(check);
    }

    public TechnicalCheck updateCheck(Long id, TechnicalCheck updated) {
        TechnicalCheck check = getCheckById(id);
        check.setCheckDate(updated.getCheckDate());
        check.setExpiryDate(updated.getExpiryDate());
        check.setCenter(updated.getCenter());
        check.setNotes(updated.getNotes());
        check.setStatus(updated.getStatus());
        return technicalCheckRepository.save(check);
    }

    public void deleteCheck(Long id) {
        technicalCheckRepository.deleteById(id);
    }
}