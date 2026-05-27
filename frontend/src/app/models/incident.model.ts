export enum IncidentStatus {
  NUEVO = 'NUEVO',
  EN_PROCESO = 'EN_PROCESO',
  RESUELTO = 'RESUELTO'
}

export enum IncidentPriority {
  BAJA = 'BAJA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA'
}

export interface Incident {
  id?: number;
  tipo: string;
  area: string;
  descripcion: string;
  estado?: IncidentStatus;
  prioridad: IncidentPriority;
  responsableTecnico?: string;
  fechaCreacion?: string;
  fechaResolucion?: string;
  tiempoResolucion?: number; // en minutos
}

export interface IncidentStats {
  totalIncidentes: number;
  porEstado: { [key: string]: number };
  porPrioridad: { [key: string]: number };
  tiempoPromedioResolucionHoras: number;
  sinResolverMas48Horas: number;
}

export interface Technician {
  id?: number;
  nombre: string;
  especialidad?: string;
  disponible?: boolean;
}
