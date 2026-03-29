package com.bank.pfe1.service;

import com.bank.pfe1.entity.*;
import com.bank.pfe1.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class MissionService {

    @Autowired
    private MissionRepository missionRepository;

    @Autowired
    private MissionTimeRepository missionTimeRepository;

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    // --- MISSION ---

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

    public Mission createMission(Mission mission) {
        if (mission.getDriver() != null) {
            Driver driver = driverRepository.findById(mission.getDriver().getId())
                    .orElseThrow(() -> new RuntimeException("Driver not found"));
            mission.setDriver(driver);
        }
        if (mission.getVehicle() != null) {
            Vehicle vehicle = vehicleRepository.findById(mission.getVehicle().getId())
                    .orElseThrow(() -> new RuntimeException("Vehicle not found"));
            mission.setVehicle(vehicle);
        }
        mission.setStatus(MissionStatus.PLANNED);
        return missionRepository.save(mission);
    }

    public Mission updateMission(Long id, Mission updated) {
        Mission mission = getMissionById(id);
        mission.setDestination(updated.getDestination());
        mission.setPurpose(updated.getPurpose());
        mission.setStartDate(updated.getStartDate());
        mission.setEndDate(updated.getEndDate());
        mission.setMissionType(updated.getMissionType());
        mission.setDriver(updated.getDriver());
        mission.setVehicle(updated.getVehicle());
        return missionRepository.save(mission);
    }

    public Mission cancelMission(Long id) {
        Mission mission = getMissionById(id);
        mission.setStatus(MissionStatus.CANCELLED);
        return missionRepository.save(mission);
    }

    public Mission updateStatus(Long id, MissionStatus status) {
        Mission mission = getMissionById(id);
        mission.setStatus(status);
        return missionRepository.save(mission);
    }

    public void deleteMission(Long id) {
        missionRepository.deleteById(id);
    }

    // --- MISSION TIME ---

    public List<MissionTime> getTimesByMission(Long missionId) {
        return missionTimeRepository.findByMissionId(missionId);
    }

    public MissionTime addMissionTime(MissionTime missionTime) {
        return missionTimeRepository.save(missionTime);
    }

    public void deleteMissionTime(Long id) {
        missionTimeRepository.deleteById(id);
    }

    public List<Driver> getAvailableDrivers() {
        return missionRepository.findAvailableDriversOrdered();
    }
}