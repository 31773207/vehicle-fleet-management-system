package com.bank.pfe1.service;

import com.bank.pfe1.entity.*;
import com.bank.pfe1.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MissionService {

    private final MissionRepository missionRepository;
    private final MissionTimeRepository missionTimeRepository;
    private final DriverRepository driverRepository;
    private final VehicleRepository vehicleRepository;
    private final ManageService manageService;

    public List<Mission> getAllMissions() {
        return missionRepository.findAll();
    }

    public Mission getMissionById(Long id) {
        return missionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mission not found with id: " + id));
    }

    public List<Mission> getMissionsByStatus(MissionStatus status) {
        return missionRepository.findByStatus(status);
    }

    public List<Mission> getMissionsByDriver(Long driverId) {
        return missionRepository.findByDriverId(driverId);
    }

    @Transactional
    public Mission createMission(Mission mission) {
        Driver driver = driverRepository.findById(mission.getDriver().getId())
                .orElseThrow(() -> new RuntimeException("Driver not found"));
        Vehicle vehicle = vehicleRepository.findById(mission.getVehicle().getId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        if (vehicle.getStatus() != VehicleStatus.AVAILABLE  && vehicle.getStatus() != VehicleStatus.REFORMED) {
            throw new RuntimeException("Vehicle is not available for mission! Current status: " + vehicle.getStatus());
        }

        List<Mission> activeMissions = missionRepository.findByDriverIdAndStatus(driver.getId(), MissionStatus.IN_PROGRESS);
        if (!activeMissions.isEmpty()) {
            throw new RuntimeException("Driver is already on a mission!");
        }

        mission.setDriver(driver);
        mission.setVehicle(vehicle);
        mission.setStatus(MissionStatus.PLANNED);
        mission.setAssignedAt(LocalDateTime.now());

        // Update vehicle - track which driver has it
        vehicle.setStatus(VehicleStatus.IN_MISSION);
        vehicle.setAssignedTo(driver);  // ← Set the driver
        vehicle.setAssignedAt(LocalDateTime.now());  // ← Set timestamp
        vehicleRepository.save(vehicle);

        //  Update driver - track which vehicle they have

        driver.setCurrentlyAssignedVehicle(vehicle);  // ← Set the vehicle
        driver.setVehicleAssignedAt(LocalDateTime.now());  // ← Set timestamp
        driver.setVehicleRemovedAt(null);  // ← Clear any previous removal
        driver.setEmployeeStatus(EmployeeStatus.ON_MISSION);  // Driver should be ON_MISSION, not AVAILABLE!
        driverRepository.save(driver);

        // Create history
        manageService.createAssignmentHistory(driver, vehicle, "MISSION");

        return missionRepository.save(mission);
    }

    @Transactional
    public Mission updateMission(Long id, Mission updated) {
        Mission mission = getMissionById(id);
        mission.setDestination(updated.getDestination());
        mission.setPurpose(updated.getPurpose());
        mission.setStartDate(updated.getStartDate());
        mission.setEndDate(updated.getEndDate());
        mission.setMissionType(updated.getMissionType());
        return missionRepository.save(mission);
    }

    @Transactional
    public Mission startMission(Long id) {
        Mission mission = getMissionById(id);
        mission.setStatus(MissionStatus.IN_PROGRESS);
        mission.setStartedAt(LocalDateTime.now());

        // ✅ Update driver status to ON_MISSION
        Driver driver = mission.getDriver();
        driver.setEmployeeStatus(EmployeeStatus.ON_MISSION);
        driverRepository.save(driver);
        return missionRepository.save(mission);
    }

    @Transactional
    public Mission completeMission(Long id) {
        Mission mission = getMissionById(id);
        mission.setStatus(MissionStatus.COMPLETED);
        mission.setCompletedAt(LocalDateTime.now());

        Vehicle vehicle = mission.getVehicle();
        Driver driver = mission.getDriver();

        // ✅ FIX: Clear assignment from vehicle
        vehicle.setStatus(VehicleStatus.AVAILABLE);
        vehicle.setAssignedTo(null);
        vehicle.setAssignedAt(null);
        vehicleRepository.save(vehicle);

        // ✅ FIX: Clear assignment from driver
        driver.setCurrentlyAssignedVehicle(null);
        driver.setVehicleAssignedAt(null);  // ← Clear this
        driver.setVehicleRemovedAt(LocalDateTime.now());
        driver.setEmployeeStatus(EmployeeStatus.AVAILABLE);  // ← Change back to AVAILABLE
        driverRepository.save(driver);

        manageService.completeAssignmentHistory(driver, vehicle);

        return missionRepository.save(mission);
    }
    @Transactional
    public Mission cancelMission(Long id) {
        Mission mission = getMissionById(id);
        mission.setStatus(MissionStatus.CANCELLED);

        Vehicle vehicle = mission.getVehicle();
        if (vehicle.getAssignedTo() != null) {
            vehicle.setStatus(VehicleStatus.ASSIGNED);
        } else {
            vehicle.setStatus(VehicleStatus.AVAILABLE);
        }
        vehicleRepository.save(vehicle);

        return missionRepository.save(mission);
    }

    // ✅ Make sure this method exists
    @Transactional
    public void deleteMission(Long id) {
        Mission mission = getMissionById(id);
        // Only delete if mission is not IN_PROGRESS
        if (mission.getStatus() == MissionStatus.IN_PROGRESS) {
            throw new RuntimeException("Cannot delete a mission that is in progress!");
        }
        missionRepository.deleteById(id);
    }

    public List<Driver> getAvailableDrivers() {
        return driverRepository.findAvailableDrivers();
    }

    // Mission Time methods
    public List<MissionTime> getTimesByMission(Long missionId) {
        return missionTimeRepository.findByMissionId(missionId);
    }

    public MissionTime addMissionTime(MissionTime missionTime) {
        return missionTimeRepository.save(missionTime);
    }

    public void deleteMissionTime(Long id) {
        missionTimeRepository.deleteById(id);
    }
}