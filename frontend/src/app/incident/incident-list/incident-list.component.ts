import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { TaskService } from '../../services/incident.service';
import { Incident, IncidentPriority, IncidentStatus } from '../../models/incident.model';
import { NotificationService } from '../../services/notification.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-incident-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './incident-list.component.html',
  styleUrls: ['./incident-list.component.css']
})
export class IncidentListComponent implements OnInit {
  incidents: Incident[] = [];
  
  // Opciones para filtros
  statuses = Object.values(IncidentStatus);
  priorities = Object.values(IncidentPriority);
  
  // Filtros actuales
  filters = {
    tipo: '',
    estado: undefined as IncidentStatus | undefined,
    prioridad: undefined as IncidentPriority | undefined,
    fechaInicio: '',
    fechaFin: ''
  };

  // Técnicos disponibles para asignación (dinámicos)
  technicians: string[] = [];

  // Subject para debounce de búsqueda por tipo
  private searchSubject = new Subject<string>();

  constructor(
    private taskService: TaskService,
    private route: ActivatedRoute,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadTechnicians();

    // Configurar debounce para filtro de tipo
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      this.filters.tipo = value;
      this.loadIncidents();
    });

    // Suscribirse a query params del Dashboard
    this.route.queryParamMap.subscribe(params => {
      const estadoParam = params.get('estado');
      if (estadoParam) {
        this.filters.estado = estadoParam as IncidentStatus;
      }
      const prioridadParam = params.get('prioridad');
      if (prioridadParam) {
        this.filters.prioridad = prioridadParam as IncidentPriority;
      }
      this.loadIncidents();
    });
  }

  onSearchTypeChange(value: string): void {
    this.searchSubject.next(value);
  }

  loadIncidents(): void {
    // Limpiamos los filtros vacíos para no enviarlos como strings
    const activeFilters = {
      tipo: this.filters.tipo || undefined,
      estado: this.filters.estado || undefined,
      prioridad: this.filters.prioridad || undefined,
      fechaInicio: this.filters.fechaInicio || undefined,
      fechaFin: this.filters.fechaFin || undefined
    };

    this.taskService.getIncidents(activeFilters).subscribe({
      next: (data) => {
        this.incidents = data;
      },
      error: (err) => {
        console.error('Error al cargar incidentes:', err);
      }
    });
  }

  loadTechnicians(): void {
    this.taskService.getTechnicians().subscribe({
      next: (data) => {
        this.technicians = data.filter(t => t.disponible).map(t => t.nombre);
      },
      error: (err) => {
        console.error('Error al cargar técnicos:', err);
      }
    });
  }

  applyFilters(): void {
    this.loadIncidents();
  }

  clearFilters(): void {
    this.filters = {
      tipo: '',
      estado: undefined,
      prioridad: undefined,
      fechaInicio: '',
      fechaFin: ''
    };
    this.loadIncidents();
  }

  onAssignTechnician(id: number, tech: string): void {
    if (!tech) return;
    this.taskService.assignTechnician(id, tech).subscribe({
      next: () => {
        this.notificationService.showSuccess(`Técnico ${tech} asignado con éxito`);
        this.loadIncidents();
      },
      error: (err) => {
        this.notificationService.showError('Error al asignar técnico');
      }
    });
  }

  onUpdateStatus(id: number, status: IncidentStatus): void {
    if (confirm(`¿Está seguro de que desea cambiar el estado a ${status}?`)) {
      this.taskService.updateStatus(id, status).subscribe({
        next: () => {
          this.notificationService.showSuccess(`Estado actualizado a ${status}`);
          this.loadIncidents();
        },
        error: (err) => {
          this.notificationService.showError('Error al actualizar el estado del incidente');
        }
      });
    } else {
      // Refrescar para revertir la selección del select en el UI
      this.loadIncidents();
    }
  }

  onDelete(id: number): void {
    if (confirm('¿Está seguro de que desea eliminar este incidente?')) {
      this.taskService.deleteIncident(id).subscribe({
        next: () => {
          this.notificationService.showSuccess('Incidente eliminado');
          this.loadIncidents();
        },
        error: (err) => {
          this.notificationService.showError('Error al eliminar el incidente');
        }
      });
    }
  }

  isOverdue(fechaCreacion?: string, estado?: IncidentStatus): boolean {
    if (!fechaCreacion || estado === IncidentStatus.RESUELTO) {
      return false;
    }
    const createdDate = new Date(fechaCreacion);
    const limit = new Date().getTime() - 48 * 60 * 60 * 1000; // 48 horas en milisegundos
    return createdDate.getTime() < limit;
  }

  hasOverdueIncidents(): boolean {
    return this.incidents.some(i => this.isOverdue(i.fechaCreacion, i.estado));
  }

  formatResolutionTime(minutes?: number): string {
    if (minutes === undefined || minutes === null) return '';
    if (minutes < 60) return `${minutes}m`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  }

  getPriorityClass(priority: IncidentPriority): string {
    switch (priority) {
      case IncidentPriority.ALTA: return 'badge-danger';
      case IncidentPriority.MEDIA: return 'badge-warning';
      case IncidentPriority.BAJA: return 'badge-info';
      default: return 'badge-secondary';
    }
  }

  getStatusClass(status: IncidentStatus): string {
    switch (status) {
      case IncidentStatus.NUEVO: return 'status-new';
      case IncidentStatus.EN_PROCESO: return 'status-process';
      case IncidentStatus.RESUELTO: return 'status-resolved';
      default: return 'status-default';
    }
  }
}
