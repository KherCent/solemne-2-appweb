import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TaskService } from '../../services/incident.service';
import { Incident, IncidentPriority, IncidentStatus } from '../../models/incident.model';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-incident-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './incident-form.component.html',
  styleUrls: ['./incident-form.component.css']
})
export class IncidentFormComponent implements OnInit {
  incidentForm!: FormGroup;
  isEditMode = false;
  incidentId?: number;

  priorities = Object.values(IncidentPriority);
  statuses = Object.values(IncidentStatus);
  technicians: string[] = [];

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadTechnicians();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.incidentId = +idParam;
      this.loadIncident(this.incidentId);
    }
  }

  private loadTechnicians(): void {
    this.taskService.getTechnicians().subscribe({
      next: (data) => {
        this.technicians = data.filter(t => t.disponible).map(t => t.nombre);
      },
      error: (err) => console.error('Error al cargar técnicos:', err)
    });
  }

  private initForm(): void {
    this.incidentForm = this.fb.group({
      tipo: ['', [Validators.required, Validators.minLength(2)]],
      area: ['', [Validators.required, Validators.minLength(2)]],
      descripcion: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
      prioridad: [IncidentPriority.MEDIA, [Validators.required]],
      estado: [IncidentStatus.NUEVO],
      responsableTecnico: ['']
    });

    // Si no está en modo edición, podemos ocultar el estado ya que se crea como NUEVO
    if (!this.isEditMode) {
      this.incidentForm.get('estado')?.disable();
    }
  }

  private loadIncident(id: number): void {
    this.taskService.getIncidentById(id).subscribe({
      next: (incident) => {
        this.incidentForm.enable(); // Habilita estado para poder editarlo
        this.incidentForm.patchValue({
          tipo: incident.tipo,
          area: incident.area,
          descripcion: incident.descripcion,
          prioridad: incident.prioridad,
          estado: incident.estado,
          responsableTecnico: incident.responsableTecnico || ''
        });
      },
      error: (err) => {
        console.error('Error al cargar incidente:', err);
        this.notificationService.showError('No se pudo cargar el incidente.');
        this.router.navigate(['/incidents']);
      }
    });
  }

  onSubmit(): void {
    if (this.incidentForm.invalid) {
      this.incidentForm.markAllAsTouched();
      return;
    }

    // Obtenemos los valores incluyendo los campos deshabilitados (como estado en creación)
    const rawValue = this.incidentForm.getRawValue();
    const incidentData: Incident = {
      tipo: rawValue.tipo,
      area: rawValue.area,
      descripcion: rawValue.descripcion,
      prioridad: rawValue.prioridad,
      estado: rawValue.estado || IncidentStatus.NUEVO,
      responsableTecnico: rawValue.responsableTecnico || undefined
    };

    if (this.isEditMode && this.incidentId) {
      this.taskService.updateIncident(this.incidentId, incidentData).subscribe({
        next: () => {
          this.notificationService.showSuccess('Incidente actualizado con éxito');
          this.router.navigate(['/incidents']);
        },
        error: (err) => {
          console.error('Error al actualizar incidente:', err);
          this.notificationService.showError('Error al guardar los cambios.');
        }
      });
    } else {
      this.taskService.createIncident(incidentData).subscribe({
        next: () => {
          this.notificationService.showSuccess('Incidente registrado con éxito');
          this.router.navigate(['/incidents']);
        },
        error: (err) => {
          console.error('Error al crear incidente:', err);
          this.notificationService.showError('Error al registrar el incidente.');
        }
      });
    }
  }

  isFieldInvalid(field: string): boolean {
    const control = this.incidentForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}
