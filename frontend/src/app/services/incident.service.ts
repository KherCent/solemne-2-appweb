import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Incident, IncidentPriority, IncidentStatus, IncidentStats, Technician } from '../models/incident.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = typeof window !== 'undefined' && window.location.origin.includes('localhost:4200')
    ? 'http://localhost:8090/api/incidents'
    : '/api/incidents';

  private techApiUrl = typeof window !== 'undefined' && window.location.origin.includes('localhost:4200')
    ? 'http://localhost:8090/api/technicians'
    : '/api/technicians';


  constructor(private http: HttpClient) {}

  getIncidents(filters?: {
    tipo?: string;
    estado?: IncidentStatus;
    prioridad?: IncidentPriority;
    fechaInicio?: string;
    fechaFin?: string;
  }): Observable<Incident[]> {
    let params = new HttpParams();
    if (filters) {
      if (filters.tipo) params = params.set('tipo', filters.tipo);
      if (filters.estado) params = params.set('estado', filters.estado);
      if (filters.prioridad) params = params.set('prioridad', filters.prioridad);
      if (filters.fechaInicio) params = params.set('fechaInicio', filters.fechaInicio);
      if (filters.fechaFin) params = params.set('fechaFin', filters.fechaFin);
    }
    return this.http.get<Incident[]>(this.apiUrl, { params });
  }

  getIncidentById(id: number): Observable<Incident> {
    return this.http.get<Incident>(`${this.apiUrl}/${id}`);
  }

  createIncident(incident: Incident): Observable<Incident> {
    return this.http.post<Incident>(this.apiUrl, incident);
  }

  updateIncident(id: number, incident: Incident): Observable<Incident> {
    return this.http.put<Incident>(`${this.apiUrl}/${id}`, incident);
  }

  assignTechnician(id: number, technician: string): Observable<Incident> {
    return this.http.put<Incident>(`${this.apiUrl}/${id}/assign`, null, {
      params: new HttpParams().set('technician', technician)
    });
  }

  updateStatus(id: number, status: IncidentStatus): Observable<Incident> {
    return this.http.put<Incident>(`${this.apiUrl}/${id}/status`, null, {
      params: new HttpParams().set('status', status)
    });
  }

  deleteIncident(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getStats(): Observable<IncidentStats> {
    return this.http.get<IncidentStats>(`${this.apiUrl}/stats`);
  }

  // Métodos de Técnicos
  getTechnicians(): Observable<Technician[]> {
    return this.http.get<Technician[]>(this.techApiUrl);
  }

  createTechnician(tech: Technician): Observable<Technician> {
    return this.http.post<Technician>(this.techApiUrl, tech);
  }

  updateTechnician(id: number, tech: Technician): Observable<Technician> {
    return this.http.put<Technician>(`${this.techApiUrl}/${id}`, tech);
  }

  deleteTechnician(id: number): Observable<void> {
    return this.http.delete<void>(`${this.techApiUrl}/${id}`);
  }
}
