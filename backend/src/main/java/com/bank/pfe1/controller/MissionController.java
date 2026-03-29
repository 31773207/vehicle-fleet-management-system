package com.bank.pfe1.controller;

import com.bank.pfe1.entity.*;
import com.bank.pfe1.service.MissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/missions")
public class MissionController {

    @Autowired
    private MissionService missionService;

    @GetMapping
    public List<Mission> getAllMissions() {
        return missionService.getAllMissions();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Mission> getMissionById(@PathVariable Long id) {
        return ResponseEntity.ok(missionService.getMissionById(id));
    }

    @GetMapping("/status/{status}")
    public List<Mission> getMissionsByStatus(@PathVariable MissionStatus status) {
        return missionService.getMissionsByStatus(status);
    }

    @GetMapping("/driver/{driverId}")
    public List<Mission> getMissionsByDriver(@PathVariable Long driverId) {
        return missionService.getMissionsByDriver(driverId);
    }

    @PostMapping
    public ResponseEntity<Mission> createMission(@RequestBody Mission mission) {
        return ResponseEntity.ok(missionService.createMission(mission));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Mission> updateMission(@PathVariable Long id, @RequestBody Mission mission) {
        return ResponseEntity.ok(missionService.updateMission(id, mission));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Mission> cancelMission(@PathVariable Long id) {
        return ResponseEntity.ok(missionService.cancelMission(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Mission> updateStatus(@PathVariable Long id, @RequestParam MissionStatus status) {
        return ResponseEntity.ok(missionService.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMission(@PathVariable Long id) {
        missionService.deleteMission(id);
        return ResponseEntity.noContent().build();
    }

    // Mission Time endpoints
    @GetMapping("/{missionId}/times")
    public List<MissionTime> getTimesByMission(@PathVariable Long missionId) {
        return missionService.getTimesByMission(missionId);
    }

    @PostMapping("/times")
    public ResponseEntity<MissionTime> addMissionTime(@RequestBody MissionTime missionTime) {
        return ResponseEntity.ok(missionService.addMissionTime(missionTime));
    }

    @DeleteMapping("/times/{id}")
    public ResponseEntity<Void> deleteMissionTime(@PathVariable Long id) {
        missionService.deleteMissionTime(id);
        return ResponseEntity.noContent().build();
    }
    @GetMapping("/available-drivers")
    public List<Driver> getAvailableDrivers() {
        return missionService.getAvailableDrivers();
    }
}