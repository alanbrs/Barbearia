
import { Appointment } from '../types';

const STORAGE_KEY = 'barber_flow_appointments';

// Simula o atraso de uma rede real para você testar a UX
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const storageService = {
  /**
   * Busca todos os agendamentos.
   * Em um cenário real, aqui você faria: 
   * const { data } = await supabase.from('appointments').select('*')
   */
  async getAppointments(): Promise<Appointment[]> {
    await delay(600); // Simula latência de rede
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  },

  /**
   * Salva um novo agendamento.
   */
  async saveAppointment(appointment: Appointment): Promise<void> {
    await delay(800);
    const appointments = await this.getAppointments();
    const updated = [...appointments, appointment];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  /**
   * Atualiza o status de um agendamento existente.
   */
  async updateAppointmentStatus(id: string, status: Appointment['status']): Promise<void> {
    await delay(500);
    const appointments = await this.getAppointments();
    const updated = appointments.map(app => 
      app.id === id ? { ...app, status } : app
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  /**
   * Limpa dados antigos (opcional)
   */
  async clearOldAppointments(): Promise<void> {
    const appointments = await this.getAppointments();
    const today = new Date().toISOString().split('T')[0];
    const filtered = appointments.filter(app => app.date >= today);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }
};
