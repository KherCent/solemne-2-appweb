package com.infratech.incidentportal.controller;

import com.infratech.incidentportal.dto.IncidentDTO;
import com.infratech.incidentportal.dto.IncidentStatsDTO;
import com.infratech.incidentportal.model.IncidentPriority;
import com.infratech.incidentportal.model.IncidentStatus;
import com.infratech.incidentportal.service.IncidentService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incidents")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.PATCH, RequestMethod.OPTIONS})
public class IncidentController {

    private final IncidentService incidentService;

    @PostMapping
    public ResponseEntity<IncidentDTO> createIncident(@Valid @RequestBody IncidentDTO dto) {
        IncidentDTO created = incidentService.createIncident(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<IncidentDTO>> getAllIncidents(
            @RequestParam(required = false) String tipo,
            @RequestParam(required = false) IncidentStatus estado,
            @RequestParam(required = false) IncidentPriority prioridad,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {
        
        List<IncidentDTO> incidents = incidentService.searchIncidents(tipo, estado, prioridad, fechaInicio, fechaFin);
        return ResponseEntity.ok(incidents);
    }

    @GetMapping("/{id}")
    public ResponseEntity<IncidentDTO> getIncidentById(@PathVariable Long id) {
        IncidentDTO incident = incidentService.getIncidentById(id);
        return ResponseEntity.ok(incident);
    }

    @PutMapping("/{id}")
    public ResponseEntity<IncidentDTO> updateIncident(@PathVariable Long id, @Valid @RequestBody IncidentDTO dto) {
        IncidentDTO updated = incidentService.updateIncident(id, dto);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<IncidentDTO> assignTechnician(@PathVariable Long id, @RequestParam String technician) {
        IncidentDTO updated = incidentService.assignTechnician(id, technician);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<IncidentDTO> updateStatus(@PathVariable Long id, @RequestParam IncidentStatus status) {
        IncidentDTO updated = incidentService.updateStatus(id, status);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIncident(@PathVariable Long id) {
        incidentService.deleteIncident(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<IncidentStatsDTO> getIncidentStats() {
        IncidentStatsDTO stats = incidentService.getIncidentStats();
        return ResponseEntity.ok(stats);
    }
}
