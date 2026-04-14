package com.bank.pfe1.repository;

import com.bank.pfe1.entity.Driver;
import com.bank.pfe1.entity.Mission;
import com.bank.pfe1.entity.MissionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.time.LocalDate;

@Repository
public interface MissionRepository extends JpaRepository<Mission, Long> {

    List<Mission> findByStatus(MissionStatus status);
    List<Mission> findByDriverId(Long driverId);
    List<Mission> findByVehicleId(Long vehicleId);

    // ✅ Add this method
    List<Mission> findByDriverIdAndStatus(Long driverId, MissionStatus status);

    // Add these to your MissionRepository.java
    List<Mission> findByStatusAndStartDateLessThanEqual(MissionStatus status, LocalDate date);
    List<Mission> findByStatusAndEndDateLessThan(MissionStatus status, LocalDate date);

    // Find active missions
    List<Mission> findByStatusIn(List<MissionStatus> statuses);

    // Find missions between dates
    List<Mission> findByStartDateBetween(LocalDate start, LocalDate end);

    // Count active missions for a vehicle
    @Query("SELECT COUNT(m) FROM Mission m WHERE m.vehicle.id = :vehicleId AND m.status = 'IN_PROGRESS'")
    long countActiveMissionsByVehicleId(Long vehicleId);

    // Get available drivers ordered by queue
    @Query("""
        SELECT d FROM Driver d
        WHERE d.id NOT IN (
            SELECT m.driver.id FROM Mission m 
            WHERE m.status = 'IN_PROGRESS'
        )
        ORDER BY (
            SELECT MAX(m2.endDate) FROM Mission m2 
            WHERE m2.driver.id = d.id
        ) ASC NULLS FIRST
    """)
    List<Driver> findAvailableDriversOrdered();
}