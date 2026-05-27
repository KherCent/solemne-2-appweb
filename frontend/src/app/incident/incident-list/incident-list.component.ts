import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { TaskService } from '../../services/incident.service';
import { Incident, IncidentPriority, IncidentStatus } from '../../models/incident.model';
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

  // Técnicos disponibles para asignación
  technicians = ['Carlos Gómez', 'Ana Martínez', 'Luis Rodríguez', 'Sofía Plaza', 'Juan Muñoz'];

  // Subject para debounce de búsqueda por tipo
  private searchSubject = new Subject<string>();

  constructor(private taskService: TaskService, private route: ActivatedRoute) {}

  ngOnInit(): void {
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
        this.loadIncidents();
      },
      error: (err) => {
        console.error('Error al asignar técnico:', err);
      }
    });
  }

  onUpdateStatus(id: number, status: IncidentStatus): void {
    this.taskService.updateStatus(id, status).subscribe({
      next: () => {
        this.loadIncidents();
      },
      error: (err) => {
        console.error('Error al actualizar estado:', err);
      }
    });
  }

  onDelete(id: number): void {
    if (confirm('¿Está seguro de que desea eliminar este incidente?')) {
      this.taskService.deleteIncident(id).subscribe({
        next: () => {
          this.loadIncidents();
        },
        error: (err) => {
          console.error('Error al eliminar incidente:', err);
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
