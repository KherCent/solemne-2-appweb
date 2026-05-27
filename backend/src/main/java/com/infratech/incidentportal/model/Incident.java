package com.infratech.incidentportal.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "incidents")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Incident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String tipo;

    @Column(nullable = false)
    private String area;

    @Column(nullable = false, length = 1000)
    private String descripcion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private IncidentStatus estado;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private IncidentPriority prioridad;

    private String responsableTecnico;

    @Column(nullable = false)
    private LocalDateTime fechaCreacion;

    private LocalDateTime fechaResolucion;

    // Tiempo de resolución en minutos
    private Long tiempoResolucion;

    @PrePersist
    protected void onCreate() {
        if (fechaCreacion == null) {
            fechaCreacion = LocalDateTime.now();
        }
        if (estado == null) {
            estado = IncidentStatus.NUEVO;
        }
    }
}
