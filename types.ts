
export enum ServiceType {
  HAIRCUT = 'Corte de Cabelo',
  BEARD = 'Barba Profissional',
  COMBO = 'Combo (Cabelo + Barba)',
  VIP = 'Tratamento VIP (Corte + Barba + Relaxamento)'
}

export interface Service {
  id: string;
  name: ServiceType;
  price: number;
  duration: number; // in minutes
  description: string;
}

export interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  service: ServiceType;
  date: string; // ISO String (YYYY-MM-DD)
  time: string; // HH:mm
  status: 'pending' | 'completed' | 'canceled';
  createdAt: number;
}

export type UserRole = 'client' | 'barber';
