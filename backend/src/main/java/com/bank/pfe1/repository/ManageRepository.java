package com.bank.pfe1.repository;

import com.bank.pfe1.entity.Manage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ManageRepository extends JpaRepository<Manage, Long> {
    List<Manage> findByDriverId(Long driverId);
    List<Manage> findByVehicleId(Long vehicleId);

}