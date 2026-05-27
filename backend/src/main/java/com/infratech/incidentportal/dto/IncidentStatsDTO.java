package com.infratech.incidentportal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IncidentStatsDTO {
    private long totalIncidentes;
    private Map<String, Long> porEstado;
    private Map<String, Long> porPrioridad;
    private Double tiempoPromedioResolucionHoras;
    private long sinResolverMas48Horas;
}
