
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Appointment } from '../types';

const LOCAL_STORAGE_KEY = 'barberflow_appointments';

let supabaseInstance: SupabaseClient | null = null;

const getEnvSafe = (key: string): string => {
  try {
    return (
      (window as any).process?.env?.[key] || 
      (typeof process !== 'undefined' ? process.env[key] : '') ||
      ''
    );
  } catch {
    return '';
  }
};

const getSupabase = (): SupabaseClient | null => {
  if (supabaseInstance) return supabaseInstance;

  const url = getEnvSafe('SUPABASE_URL');
  const key = getEnvSafe('SUPABASE_ANON_KEY');

  if (url && key && url.startsWith('http')) {
    try {
      supabaseInstance = createClient(url, key);
      return supabaseInstance;
    } catch (e) {
      console.error("Erro ao conectar com Supabase:", e);
    }
  }
  return null;
};

// Métodos auxiliares para LocalStorage
const getLocalAppointments = (): Appointment[] => {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveLocalAppointment = (appointment: Appointment) => {
  const apps = getLocalAppointments();
  apps.push(appointment);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(apps));
};

export const storageService = {
  async getAppointments(): Promise<Appointment[]> {
    const supabase = getSupabase();
    
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .order('time', { ascending: true });

        if (!error && data) {
          return data.map((item: any) => ({
            id: item.id,
            clientName: item.client_name,
            clientPhone: item.client_phone,
            service: item.service,
            date: item.date,
            time: item.time,
            status: item.status,
            createdAt: new Date(item.created_at || Date.now()).getTime()
          }));
        }
      } catch (err) {
        console.warn("Supabase falhou, usando dados locais.");
      }
    }
    
    return getLocalAppointments();
  },

  async saveAppointment(appointment: Omit<Appointment, 'id' | 'createdAt' | 'status'>): Promise<void> {
    const supabase = getSupabase();
    const newId = Math.random().toString(36).substr(2, 9);
    const timestamp = Date.now();

    const newAppointment: Appointment = {
      ...appointment,
      id: newId,
      createdAt: timestamp,
      status: 'pending'
    };

    if (supabase) {
      try {
        const { error } = await supabase
          .from('appointments')
          .insert([
            {
              client_name: appointment.clientName,
              client_phone: appointment.clientPhone,
              service: appointment.service,
              date: appointment.date,
              time: appointment.time,
              status: 'pending'
            }
          ]);

        if (!error) return;
        console.error("Erro no insert do Supabase:", error);
      } catch (err) {
        console.error("Falha na conexão com Supabase ao salvar.");
      }
    }

    // Se chegar aqui, salva localmente como fallback
    saveLocalAppointment(newAppointment);
    console.info("Agendamento salvo localmente (Modo Offline/Fallback).");
  },

  async updateAppointmentStatus(id: string, status: Appointment['status']): Promise<void> {
    const supabase = getSupabase();
    
    if (supabase) {
      try {
        const { error } = await supabase
          .from('appointments')
          .update({ status })
          .eq('id', id);
        
        if (!error) return;
      } catch (err) {
        console.error("Erro ao atualizar no Supabase.");
      }
    }

    // Atualização local
    const apps = getLocalAppointments();
    const updated = apps.map(app => app.id === id ? { ...app, status } : app);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  }
};
