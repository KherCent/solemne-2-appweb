package com.infratech.incidentportal.service;

import com.infratech.incidentportal.model.Technician;
import com.infratech.incidentportal.repository.TechnicianRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TechnicianService {

    private final TechnicianRepository technicianRepository;

    @PostConstruct
    public void initDefaultTechnicians() {
        if (technicianRepository.count() == 0) {
            technicianRepository.save(Technician.builder().nombre("Carlos Gómez").especialidad("Soporte Redes").disponible(true).build());
            technicianRepository.save(Technician.builder().nombre("Ana Martínez").especialidad("Soporte Sistemas/SW").disponible(true).build());
            technicianRepository.save(Technician.builder().nombre("Luis Rodríguez").especialidad("Hardware/Microinformatica").disponible(true).build());
            technicianRepository.save(Technician.builder().nombre("Sofía Plaza").especialidad("Seguridad Informática").disponible(true).build());
            technicianRepository.save(Technician.builder().nombre("Juan Muñoz").especialidad("Soporte General").disponible(true).build());
        }
    }

    public List<Technician> getAllTechnicians() {
        return technicianRepository.findAll();
    }

    public Technician createTechnician(Technician technician) {
        if (technicianRepository.findByNombre(technician.getNombre()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ya existe un técnico registrado con ese nombre");
        }
        return technicianRepository.save(technician);
    }

    public Technician updateTechnician(Long id, Technician technicianDetails) {
        Technician tech = technicianRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Técnico no encontrado"));

        tech.setNombre(technicianDetails.getNombre());
        tech.setEspecialidad(technicianDetails.getEspecialidad());
        tech.setDisponible(technicianDetails.isDisponible());

        return technicianRepository.save(tech);
    }

    public void deleteTechnician(Long id) {
        if (!technicianRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Técnico no encontrado");
        }
        technicianRepository.deleteById(id);
    }
}
