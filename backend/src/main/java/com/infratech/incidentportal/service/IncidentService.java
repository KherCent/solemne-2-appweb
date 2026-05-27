package com.infratech.incidentportal.service;

import com.infratech.incidentportal.dto.IncidentDTO;
import com.infratech.incidentportal.model.Incident;
import com.infratech.incidentportal.model.IncidentPriority;
import com.infratech.incidentportal.model.IncidentStatus;
import com.infratech.incidentportal.repository.IncidentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IncidentService {

    private final IncidentRepository incidentRepository;

    public IncidentDTO createIncident(IncidentDTO dto) {
        Incident incident = convertToEntity(dto);
        incident.setEstado(IncidentStatus.NUEVO);
        incident.setFechaCreacion(LocalDateTime.now());
        incident.setFechaResolucion(null);
        incident.setTiempoResolucion(null);
        
        Incident saved = incidentRepository.save(incident);
        return convertToDTO(saved);
    }

    public IncidentDTO getIncidentById(Long id) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Incidente no encontrado con ID: " + id));
        return convertToDTO(incident);
    }

    public List<IncidentDTO> getAllIncidents() {
        return incidentRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<IncidentDTO> searchIncidents(String tipo, IncidentStatus estado, IncidentPriority prioridad, LocalDate fechaInicio, LocalDate fechaFin) {
        Specification<Incident> spec = Specification.where(null);

        if (tipo != null && !tipo.trim().isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.like(cb.lower(root.get("tipo")), "%" + tipo.toLowerCase() + "%"));
        }
        if (estado != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("estado"), estado));
        }
        if (prioridad != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("prioridad"), prioridad));
        }
        if (fechaInicio != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("fechaCreacion"), fechaInicio.atStartOfDay()));
        }
        if (fechaFin != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("fechaCreacion"), fechaFin.atTime(LocalTime.MAX)));
        }

        return incidentRepository.findAll(spec).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public IncidentDTO assignTechnician(Long id, String technician) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Incidente no encontrado con ID: " + id));
        
        incident.setResponsableTecnico(technician);
        // Si el estado es NUEVO y se le asigna técnico, podemos pasarlo a EN_PROCESO automáticamente
        if (incident.getEstado() == IncidentStatus.NUEVO) {
            incident.setEstado(IncidentStatus.EN_PROCESO);
        }
        
        Incident saved = incidentRepository.save(incident);
        return convertToDTO(saved);
    }

    public IncidentDTO updateStatus(Long id, IncidentStatus status) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Incidente no encontrado con ID: " + id));
        
        incident.setEstado(status);
        if (status == IncidentStatus.RESUELTO) {
            LocalDateTime now = LocalDateTime.now();
            incident.setFechaResolucion(now);
            
            // Calcular el tiempo de resolución en minutos
            long minutes = Duration.between(incident.getFechaCreacion(), now).toMinutes();
            incident.setTiempoResolucion(minutes);
        } else {
            // Si vuelve a otro estado, limpiamos la resolución
            incident.setFechaResolucion(null);
            incident.setTiempoResolucion(null);
        }
        
        Incident saved = incidentRepository.save(incident);
        return convertToDTO(saved);
    }

    public IncidentDTO updateIncident(Long id, IncidentDTO dto) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Incidente no encontrado con ID: " + id));
        
        incident.setTipo(dto.getTipo());
        incident.setArea(dto.getArea());
        incident.setDescripcion(dto.getDescripcion());
        incident.setPrioridad(dto.getPrioridad());
        incident.setResponsableTecnico(dto.getResponsableTecnico());
        
        if (dto.getEstado() != null && dto.getEstado() != incident.getEstado()) {
            incident.setEstado(dto.getEstado());
            if (dto.getEstado() == IncidentStatus.RESUELTO) {
                LocalDateTime now = LocalDateTime.now();
                incident.setFechaResolucion(now);
                long minutes = Duration.between(incident.getFechaCreacion(), now).toMinutes();
                incident.setTiempoResolucion(minutes);
            } else {
                incident.setFechaResolucion(null);
                incident.setTiempoResolucion(null);
            }
        }
        
        Incident saved = incidentRepository.save(incident);
        return convertToDTO(saved);
    }

    public void deleteIncident(Long id) {
        if (!incidentRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Incidente no encontrado con ID: " + id);
        }
        incidentRepository.deleteById(id);
    }

    // Convertir de DTO a Entidad
    private Incident convertToEntity(IncidentDTO dto) {
        return Incident.builder()
                .id(dto.getId())
                .tipo(dto.getTipo())
                .area(dto.getArea())
                .descripcion(dto.getDescripcion())
                .estado(dto.getEstado())
                .prioridad(dto.getPrioridad())
                .responsableTecnico(dto.getResponsableTecnico())
                .fechaCreacion(dto.getFechaCreacion())
                .fechaResolucion(dto.getFechaResolucion())
                .tiempoResolucion(dto.getTiempoResolucion())
                .build();
    }

    // Convertir de Entidad a DTO
    private IncidentDTO convertToDTO(Incident incident) {
        return IncidentDTO.builder()
                .id(incident.getId())
                .tipo(incident.getTipo())
                .area(incident.getArea())
                .descripcion(incident.getDescripcion())
                .estado(incident.getEstado())
                .prioridad(incident.getPrioridad())
                .responsableTecnico(incident.getResponsableTecnico())
                .fechaCreacion(incident.getFechaCreacion())
                .fechaResolucion(incident.getFechaResolucion())
                .tiempoResolucion(incident.getTiempoResolucion())
                .build();
    }
}
