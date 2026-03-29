package com.bank.pfe1.repository;

import com.bank.pfe1.entity.Vehicle;
import com.bank.pfe1.entity.VehicleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    boolean existsByPlateNumber(String plateNumber);
    List<Vehicle> findByStatus(VehicleStatus status);

}