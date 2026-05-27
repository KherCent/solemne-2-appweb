package com.infratech.incidentportal.repository;

import com.infratech.incidentportal.model.Technician;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TechnicianRepository extends JpaRepository<Technician, Long> {
    Optional<Technician> findByNombre(String nombre);
}
