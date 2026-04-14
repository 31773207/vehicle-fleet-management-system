package com.bank.pfe1.scheduler;

import com.bank.pfe1.entity.*;
import com.bank.pfe1.repository.*;
import com.bank.pfe1.service.ManageService;  // ✅ ADD THIS IMPORT
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
@EnableScheduling
@RequiredArgsConstructor
public class MissionScheduler {

    private final MissionRepository missionRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final ManageService manageService;

    @Scheduled(cron = "0 * * * * *")  // Runs every minute
    @Transactional
    public void autoUpdateMissions() {
        LocalDate today = LocalDate.now();
        System.out.println("🔄 Auto-updating missions at: " + LocalDateTime.now());

        // ========== AUTO-START MISSIONS ==========
        List<Mission> toStart = missionRepository.findByStatusAndStartDateLessThanEqual(
                MissionStatus.PLANNED, today);

        for (Mission mission : toStart) {
            // Update mission
            mission.setStatus(MissionStatus.IN_PROGRESS);
            mission.setStartedAt(LocalDateTime.now());

            // Update vehicle
            Vehicle vehicle = mission.getVehicle();
            vehicle.setStatus(VehicleStatus.IN_MISSION);
            vehicle.setAssignedTo(mission.getDriver());
            vehicle.setAssignedAt(LocalDateTime.now());
            vehicleRepository.save(vehicle);

            // Update driver
            Driver driver = mission.getDriver();
            driver.setEmployeeStatus(EmployeeStatus.ON_MISSION);
            driver.setCurrentlyAssignedVehicle(vehicle);
            driver.setVehicleAssignedAt(LocalDateTime.now());
            driverRepository.save(driver);

            missionRepository.save(mission);
            System.out.println("✅ Auto-started mission ID: " + mission.getId());
        }

        // ========== AUTO-COMPLETE MISSIONS ==========
        List<Mission> toComplete = missionRepository.findByStatusAndEndDateLessThan(
                MissionStatus.IN_PROGRESS, today);

        for (Mission mission : toComplete) {
            // Update mission
            mission.setStatus(MissionStatus.COMPLETED);
            mission.setCompletedAt(LocalDateTime.now());

            // Reset vehicle
            Vehicle vehicle = mission.getVehicle();
            vehicle.setStatus(VehicleStatus.AVAILABLE);
            vehicle.setAssignedTo(null);
            vehicle.setAssignedAt(null);
            vehicleRepository.save(vehicle);

            // Reset driver
            Driver driver = mission.getDriver();
            driver.setEmployeeStatus(EmployeeStatus.AVAILABLE);
            driver.setCurrentlyAssignedVehicle(null);
            driver.setVehicleRemovedAt(LocalDateTime.now());
            driverRepository.save(driver);

            // Update history
            manageService.completeAssignmentHistory(driver, vehicle);

            missionRepository.save(mission);
            System.out.println("✅ Auto-completed mission ID: " + mission.getId());
        }
    }
}
