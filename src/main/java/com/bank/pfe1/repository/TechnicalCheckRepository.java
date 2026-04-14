package com.bank.pfe1.repository;

import com.bank.pfe1.entity.TechnicalCheck;
import com.bank.pfe1.entity.TechnicalCheckStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TechnicalCheckRepository extends JpaRepository<TechnicalCheck, Long> {
    List<TechnicalCheck> findByVehicleId(Long vehicleId);
    List<TechnicalCheck> findByStatus(TechnicalCheckStatus status);
}