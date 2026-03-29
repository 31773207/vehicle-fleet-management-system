package com.bank.pfe1.controller;

import com.bank.pfe1.entity.Manage;
import com.bank.pfe1.service.ManageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/manage")
public class ManageController {

    @Autowired
    private ManageService manageService;

    @PostMapping("/assign")
    public ResponseEntity<Manage> assignVehicle(
            @RequestParam Long driverId,
            @RequestParam Long vehicleId) {
        return ResponseEntity.ok(manageService.assignVehicle(driverId, vehicleId));
    }

    @PostMapping("/remove")
    public ResponseEntity<Manage> removeVehicle(
            @RequestParam Long driverId,
            @RequestParam(required = false) String organization,
            @RequestParam(required = false) String endDate) {
        LocalDate date = endDate != null ? LocalDate.parse(endDate) : null;
        return ResponseEntity.ok(manageService.removeVehicle(driverId, organization, date));
    }

    @GetMapping("/history/{driverId}")
    public List<Manage> getDriverHistory(@PathVariable Long driverId) {
        return manageService.getDriverHistory(driverId);
    }
}