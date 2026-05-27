package com.infratech.incidentportal.controller;

import com.infratech.incidentportal.model.Technician;
import com.infratech.incidentportal.service.TechnicianService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/technicians")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.PATCH, RequestMethod.OPTIONS})
public class TechnicianController {

    private final TechnicianService technicianService;

    @GetMapping
    public ResponseEntity<List<Technician>> getAllTechnicians() {
        return ResponseEntity.ok(technicianService.getAllTechnicians());
    }

    @PostMapping
    public ResponseEntity<Technician> createTechnician(@RequestBody Technician technician) {
        Technician created = technicianService.createTechnician(technician);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Technician> updateTechnician(@PathVariable Long id, @RequestBody Technician technician) {
        Technician updated = technicianService.updateTechnician(id, technician);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTechnician(@PathVariable Long id) {
        technicianService.deleteTechnician(id);
        return ResponseEntity.noContent().build();
    }
}
