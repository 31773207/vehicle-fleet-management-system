package com.bank.pfe1.controller;

import com.bank.pfe1.entity.Maintenance;
import com.bank.pfe1.service.MaintenanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
public class MaintenanceController {

    @Autowired
    private MaintenanceService maintenanceService;

    @GetMapping
    public List<Maintenance> getAllMaintenance() {
        return maintenanceService.getAllMaintenance();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Maintenance> getMaintenanceById(@PathVariable Long id) {
        return ResponseEntity.ok(maintenanceService.getMaintenanceById(id));
    }

    @GetMapping("/vehicle/{vehicleId}")
    public List<Maintenance> getMaintenanceByVehicle(@PathVariable Long vehicleId) {
        return maintenanceService.getMaintenanceByVehicle(vehicleId);
    }

    @PostMapping
    public ResponseEntity<Maintenance> createMaintenance(@RequestBody Maintenance maintenance) {
        return ResponseEntity.ok(maintenanceService.createMaintenance(maintenance));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<Maintenance> completeMaintenance(@PathVariable Long id) {
        return ResponseEntity.ok(maintenanceService.completeMaintenance(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Maintenance> updateMaintenance(@PathVariable Long id, @RequestBody Maintenance maintenance) {
        return ResponseEntity.ok(maintenanceService.updateMaintenance(id, maintenance));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMaintenance(@PathVariable Long id) {
        maintenanceService.deleteMaintenance(id);
        return ResponseEntity.noContent().build();
    }
}