package com.bank.pfe1.repository;

import com.bank.pfe1.entity.Driver;
import com.bank.pfe1.entity.Mission;
import com.bank.pfe1.entity.MissionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

@Repository
public interface MissionRepository extends JpaRepository<Mission, Long> {
    List<Mission> findByStatus(MissionStatus status);
    List<Mission> findByDriverId(Long driverId);
    List<Mission> findByVehicleId(Long vehicleId);

    // Get available drivers ordered by queue (never had mission first, then oldest mission first)
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
