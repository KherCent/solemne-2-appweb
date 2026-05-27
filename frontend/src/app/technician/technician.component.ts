import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TaskService } from '../services/incident.service';
import { Technician } from '../models/incident.model';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-technician',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './technician.component.html',
  styleUrls: ['./technician.component.css']
})
export class TechnicianComponent implements OnInit {
  technicians: Technician[] = [];
  techForm!: FormGroup;
  isEditMode = false;
  editingId?: number;

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadTechnicians();
  }

  private initForm(): void {
    this.techForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      especialidad: ['', [Validators.required]],
      disponible: [true]
    });
  }

  loadTechnicians(): void {
    this.taskService.getTechnicians().subscribe({
      next: (data) => {
        this.technicians = data;
      },
      error: (err) => {
        this.notificationService.showError('Error al cargar la lista de técnicos');
      }
    });
  }

  onEdit(tech: Technician): void {
    this.isEditMode = true;
    this.editingId = tech.id;
    this.techForm.patchValue({
      nombre: tech.nombre,
      especialidad: tech.especialidad || '',
      disponible: tech.disponible !== false
    });
  }

  onDelete(id: number): void {
    if (confirm('¿Está seguro de que desea eliminar este técnico?')) {
      this.taskService.deleteTechnician(id).subscribe({
        next: () => {
          this.notificationService.showSuccess('Técnico eliminado con éxito');
          this.loadTechnicians();
          this.onCancel();
        },
        error: (err) => {
          this.notificationService.showError('Error al eliminar el técnico. Puede estar asignado a un incidente activo.');
        }
      });
    }
  }

  onSubmit(): void {
    if (this.techForm.invalid) {
      this.techForm.markAllAsTouched();
      return;
    }

    const techData: Technician = this.techForm.value;

    if (this.isEditMode && this.editingId) {
      this.taskService.updateTechnician(this.editingId, techData).subscribe({
        next: () => {
          this.notificationService.showSuccess('Técnico actualizado con éxito');
          this.loadTechnicians();
          this.onCancel();
        },
        error: (err) => {
          this.notificationService.showError('Error al actualizar el técnico');
        }
      });
    } else {
      this.taskService.createTechnician(techData).subscribe({
        next: () => {
          this.notificationService.showSuccess('Técnico registrado con éxito');
          this.loadTechnicians();
          this.onCancel();
        },
        error: (err) => {
          this.notificationService.showError('Error al registrar el técnico');
        }
      });
    }
  }

  onCancel(): void {
    this.isEditMode = false;
    this.editingId = undefined;
    this.techForm.reset({ disponible: true });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.techForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}
