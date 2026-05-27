package com.infratech.incidentportal.service;

import com.infratech.incidentportal.model.Incident;
import com.infratech.incidentportal.model.IncidentPriority;
import com.infratech.incidentportal.model.IncidentStatus;
import com.infratech.incidentportal.repository.IncidentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DatabaseInitializer implements CommandLineRunner {

    private final IncidentRepository incidentRepository;

    @Override
    public void run(String... args) throws Exception {
        if (incidentRepository.count() == 0) {
            // Incidente 1: Caída de Servidor Principal (Retrasado > 48h, prioridad alta, estado nuevo)
            incidentRepository.save(Incident.builder()
                    .tipo("Falla de Servidor")
                    .area("TI - Infraestructura")
                    .descripcion("El servidor de producción principal no responde a las solicitudes de ping. Las bases de datos secundarias no pueden sincronizar.")
                    .estado(IncidentStatus.NUEVO)
                    .prioridad(IncidentPriority.ALTA)
                    .fechaCreacion(LocalDateTime.now().minusDays(3).minusHours(4)) // Creado hace 76 horas
                    .build());

            // Incidente 2: Falla de Conectividad planta 2 (Asignado en proceso, prioridad media, hace 24h)
            incidentRepository.save(Incident.builder()
                    .tipo("Problema de Red")
                    .area("Operaciones / Logística")
                    .descripcion("El conmutador de red de la planta 2 presenta intermitencia. El personal de bodega no puede subir informes de inventario.")
                    .estado(IncidentStatus.EN_PROCESO)
                    .prioridad(IncidentPriority.MEDIA)
                    .responsableTecnico("Carlos Gómez")
                    .fechaCreacion(LocalDateTime.now().minusDays(1)) // Creado hace 24 horas
                    .build());

            // Incidente 3: Impresora atascada (Resuelto, prioridad baja, creado hace 5h, resuelto hace 3h)
            incidentRepository.save(Incident.builder()
                    .tipo("Falla de Hardware")
                    .area("Administración / Finanzas")
                    .descripcion("La impresora multifuncional de la oficina de administración tiene atascada la bandeja de salida de papel principal.")
                    .estado(IncidentStatus.RESUELTO)
                    .prioridad(IncidentPriority.BAJA)
                    .responsableTecnico("Ana Martínez")
                    .fechaCreacion(LocalDateTime.now().minusHours(5))
                    .fechaResolucion(LocalDateTime.now().minusHours(3))
                    .tiempoResolucion(120L) // 120 minutos (2 horas)
                    .build());

            // Incidente 4: Error ERP (Retrasado > 48h, prioridad alta, estado nuevo, hace 5 días)
            incidentRepository.save(Incident.builder()
                    .tipo("Falla de Software")
                    .area("Finanzas / Contabilidad")
                    .descripcion("Los usuarios reportan error 500 al intentar acceder al módulo de facturación mensual en el ERP corporativo.")
                    .estado(IncidentStatus.NUEVO)
                    .prioridad(IncidentPriority.ALTA)
                    .fechaCreacion(LocalDateTime.now().minusDays(5)) // Creado hace 5 días
                    .build());

            // Incidente 5: Renovación Licencia Antivirus (Asignado en proceso, prioridad baja, hace 3 horas)
            incidentRepository.save(Incident.builder()
                    .tipo("Ciberseguridad")
                    .area("Seguridad Informática")
                    .descripcion("Actualizar e instalar licencias del antivirus corporativo en los equipos nuevos recibidos por compras.")
                    .estado(IncidentStatus.EN_PROCESO)
                    .prioridad(IncidentPriority.BAJA)
                    .responsableTecnico("Sofía Plaza")
                    .fechaCreacion(LocalDateTime.now().minusHours(3))
                    .build());
        }
    }
}
