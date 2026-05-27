import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TaskService } from '../services/incident.service';
import { IncidentStats } from '../models/incident.model';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  stats?: IncidentStats;
  loading = true;

  @ViewChild('statusChart') statusChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('priorityChart') priorityChartRef!: ElementRef<HTMLCanvasElement>;

  statusChartInstance?: Chart;
  priorityChartInstance?: Chart;

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  ngAfterViewInit(): void {
    // Los gráficos se inicializarán una vez que se carguen los datos
  }

  loadStats(): void {
    this.taskService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
        // Esperamos a que Angular renderice el DOM con el *ngIf
        setTimeout(() => this.initializeCharts(), 50);
      },
      error: (err) => {
        console.error('Error al cargar estadísticas:', err);
        this.loading = false;
      }
    });
  }

  initializeCharts(): void {
    if (!this.stats) return;

    // Destruir gráficos previos si existen
    if (this.statusChartInstance) this.statusChartInstance.destroy();
    if (this.priorityChartInstance) this.priorityChartInstance.destroy();

    const statusKeys = Object.keys(this.stats.porEstado);
    const statusValues = Object.values(this.stats.porEstado);

    const priorityKeys = Object.keys(this.stats.porPrioridad);
    const priorityValues = Object.values(this.stats.porPrioridad);

    // Gráfico de Estado (Dona)
    if (this.statusChartRef) {
      this.statusChartInstance = new Chart(this.statusChartRef.nativeElement, {
        type: 'doughnut',
        data: {
          labels: statusKeys,
          datasets: [{
            data: statusValues,
            backgroundColor: [
              'rgba(56, 189, 248, 0.7)', // NUEVO - Celeste
              'rgba(245, 158, 11, 0.7)',  // EN_PROCESO - Amarillo/Naranja
              'rgba(16, 185, 129, 0.7)'   // RESUELTO - Verde
            ],
            borderColor: [
              '#38bdf8',
              '#f59e0b',
              '#10b981'
            ],
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: '#f8fafc' }
            }
          }
        }
      });
    }

    // Gráfico de Prioridad (Barra)
    if (this.priorityChartRef) {
      this.priorityChartInstance = new Chart(this.priorityChartRef.nativeElement, {
        type: 'bar',
        data: {
          labels: priorityKeys,
          datasets: [{
            label: 'Incidentes',
            data: priorityValues,
            backgroundColor: [
              'rgba(59, 130, 246, 0.7)',  // BAJA - Azul
              'rgba(245, 158, 11, 0.7)',  // MEDIA - Naranja
              'rgba(239, 68, 68, 0.7)'    // ALTA - Rojo
            ],
            borderColor: [
              '#3b82f6',
              '#f59e0b',
              '#ef4444'
            ],
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: {
              grid: { color: 'rgba(255, 255, 255, 0.05)' },
              ticks: { color: '#94a3b8' }
            },
            y: {
              grid: { color: 'rgba(255, 255, 255, 0.05)' },
              ticks: { color: '#94a3b8', stepSize: 1 }
            }
          }
        }
      });
    }
  }
}
