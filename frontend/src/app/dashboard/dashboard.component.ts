import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TaskService } from '../services/incident.service';
import { IncidentStats } from '../models/incident.model';
import { Chart, registerables } from 'chart.js';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

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

  generatePDF(): void {
    if (!this.stats) return;
    this.taskService.getIncidents().subscribe({
      next: (incidents) => {
        const doc = new jsPDF();
        
        // Titulo y encabezado
        doc.setFillColor(30, 41, 59); // color primario (slate-800)
        doc.rect(0, 0, 210, 40, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text("InfraTech S.A.", 15, 22);
        doc.setFontSize(12);
        doc.text("Portal de Gestión de Incidentes - Reporte General", 15, 32);
        
        // Fecha de emision
        doc.setTextColor(100, 116, 139);
        doc.setFontSize(9);
        const now = new Date();
        doc.text(`Fecha de Emisión: ${now.toLocaleString()}`, 130, 48);
        doc.text(`Generado por: Jorge Kevin Herrera Centellas`, 130, 53);
        
        // Sección Métricas
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(14);
        doc.text("Resumen de Métricas", 15, 60);
        
        doc.setFontSize(10);
        doc.text(`Total Incidentes Registrados: ${this.stats.totalIncidentes}`, 15, 70);
        doc.text(`Tiempo Promedio de Resolución: ${this.stats.tiempoPromedioResolucionHoras} horas`, 15, 76);
        doc.text(`Incidentes Sin Resolver > 48 horas: ${this.stats.sinResolverMas48Horas}`, 15, 82);
        
        // Estados
        doc.text(`NUEVOS: ${this.stats.porEstado['NUEVO'] || 0}`, 120, 70);
        doc.text(`EN PROCESO: ${this.stats.porEstado['EN_PROCESO'] || 0}`, 120, 76);
        doc.text(`RESUELTOS: ${this.stats.porEstado['RESUELTO'] || 0}`, 120, 82);
        
        // Tabla de Incidentes
        doc.setFontSize(14);
        doc.text("Detalle de Incidentes", 15, 95);
        
        const tableBody = incidents.map(item => [
          `#${item.id}`,
          item.tipo,
          item.area,
          item.prioridad,
          item.estado || '',
          item.responsableTecnico || 'Sin asignar',
          item.fechaCreacion ? new Date(item.fechaCreacion).toLocaleString() : ''
        ]);
        
        autoTable(doc, {
          startY: 100,
          head: [['ID', 'Tipo', 'Área', 'Prioridad', 'Estado', 'Técnico', 'Fecha Registro']],
          body: tableBody,
          theme: 'striped',
          headStyles: { fillColor: [30, 41, 59] },
          styles: { fontSize: 8 },
          margin: { left: 15, right: 15 }
        });
        
        doc.save(`Reporte_Incidentes_${now.toISOString().split('T')[0]}.pdf`);
      },
      error: (err) => console.error('Error al generar PDF:', err)
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
