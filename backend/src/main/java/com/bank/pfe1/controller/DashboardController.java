package com.bank.pfe1.controller;

import com.bank.pfe1.entity.*;
import com.bank.pfe1.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final VehicleRepository vehicleRepository;
    private final MissionRepository missionRepository;
    private final MaintenanceRepository maintenanceRepository;
    private final GasCouponRepository gasCouponRepository;
    private final TechnicalCheckRepository technicalCheckRepository;
    private final DriverRepository driverRepository;

    
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();

        stats.put("totalVehicles",    vehicleRepository.count());
        stats.put("activeVehicles",   vehicleRepository.findByStatus(VehicleStatus.ACTIVE).size());
        stats.put("assignedVehicles", vehicleRepository.findByStatus(VehicleStatus.ASSIGNED).size());
        stats.put("inMission",        vehicleRepository.findByStatus(VehicleStatus.IN_MISSION).size());
        stats.put("inRevision",       vehicleRepository.findByStatus(VehicleStatus.IN_REVISION).size());
        stats.put("breakdown",        vehicleRepository.findByStatus(VehicleStatus.BREAKDOWN).size());
        stats.put("reformed",         vehicleRepository.findByStatus(VehicleStatus.REFORMED).size());

        
        stats.put("totalDrivers", driverRepository.count());

        // --- MISSION STATS ---
        stats.put("totalMissions",     missionRepository.count());
        stats.put("missionsPlanned",   missionRepository.findByStatus(MissionStatus.PLANNED).size());
        stats.put("missionsInProgress",missionRepository.findByStatus(MissionStatus.IN_PROGRESS).size());
        stats.put("missionsCompleted", missionRepository.findByStatus(MissionStatus.COMPLETED).size());
        stats.put("missionsCancelled", missionRepository.findByStatus(MissionStatus.CANCELLED).size());

        // --- MAINTENANCE STATS ---
        stats.put("totalMaintenance",  maintenanceRepository.count());
        stats.put("openMaintenance",   maintenanceRepository.countByStatus(MaintenanceStatus.IN_PROGRESS));
        stats.put("doneMaintenance",   maintenanceRepository.countByStatus(MaintenanceStatus.COMPLETED));

        
        List<Maintenance> allMaintenance = maintenanceRepository.findAll();
        BigDecimal totalCost = allMaintenance.stream()
                .map(Maintenance::getCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.put("totalMaintenanceCost", totalCost);

        stats.put("couponsAvailable",   gasCouponRepository.countByStatus(CouponStatus.AVAILABLE));
        stats.put("couponsAssigned",    gasCouponRepository.countByStatus(CouponStatus.ASSIGNED));
        stats.put("couponsUsed",        gasCouponRepository.countByStatus(CouponStatus.USED));
        stats.put("couponsTransferred", gasCouponRepository.countByStatus(CouponStatus.TRANSFERRED));

        
        List<GasCoupon> usedCoupons = gasCouponRepository.findByStatus(CouponStatus.USED);
        BigDecimal totalFuel = usedCoupons.stream()
                .map(GasCoupon::getFuelAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.put("totalFuelUsed", totalFuel);

       
        stats.put("validChecks",   technicalCheckRepository.findByStatus(TechnicalCheckStatus.VALID).size());
        stats.put("expiredChecks", technicalCheckRepository.findByStatus(TechnicalCheckStatus.EXPIRED).size());
        stats.put("expiringSoon",  technicalCheckRepository
                        .findByExpiryDateBetween(
                            java.time.LocalDate.now(),
                            java.time.LocalDate.now().plusDays(15)
                        ).size());

        return ResponseEntity.ok(stats);
    }
}