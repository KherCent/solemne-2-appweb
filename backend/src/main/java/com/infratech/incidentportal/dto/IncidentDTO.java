package com.infratech.incidentportal.dto;

import com.infratech.incidentportal.model.IncidentPriority;
import com.infratech.incidentportal.model.IncidentStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IncidentDTO {

    private Long id;

    @NotBlank(message = "El tipo de incidente es obligatorio")
    private String tipo;

    @NotBlank(message = "El área es obligatoria")
    private String area;

    @NotBlank(message = "La descripción es obligatoria")
    @Size(min = 10, max = 1000, message = "La descripción debe tener entre 10 y 1000 caracteres")
    private String descripcion;

    private IncidentStatus estado;

    @NotNull(message = "La prioridad es obligatoria")
    private IncidentPriority prioridad;

    private String responsableTecnico;

    private LocalDateTime fechaCreacion;

    private LocalDateTime fechaResolucion;

    private Long tiempoResolucion;
}
