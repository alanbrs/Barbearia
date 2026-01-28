
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Appointment } from '../types';

const LOCAL_STORAGE_KEY = 'barberflow_appointments';

let supabaseInstance: SupabaseClient | null = null;

const getEnvSafe = (key: string): string => {
  try {
    // Busca em múltiplas fontes para garantir compatibilidade com Vite/Vercel
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
      console.error("Erro ao inicializar Supabase:", e);
    }
  }
  return null;
};

const getLocalAppointments = (): Appointment[] => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
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
          .order('date', { ascending: true })
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
        if (error) console.warn("Supabase retornou erro:", error.message);
      } catch (err) {
        console.warn("Falha de conexão com Supabase.");
      }
    }
    
    return getLocalAppointments();
  },

  async saveAppointment(appointment: Omit<Appointment, 'id' | 'createdAt' | 'status'>): Promise<void> {
    const supabase = getSupabase();
    const tempId = Math.random().toString(36).substr(2, 9);
    const timestamp = Date.now();

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
        console.error("Erro ao salvar no Supabase:", error.message);
      } catch (err) {
        console.error("Falha crítica ao tentar salvar no Supabase.");
      }
    }

    // Fallback LocalStorage
    saveLocalAppointment({
      ...appointment,
      id: tempId,
      createdAt: timestamp,
      status: 'pending'
    });
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
        console.error("Erro de rede ao atualizar status.");
      }
    }

    const apps = getLocalAppointments();
    const updated = apps.map(app => app.id === id ? { ...app, status } : app);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  }
};
