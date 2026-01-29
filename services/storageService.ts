
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Appointment } from '../types';

const LOCAL_STORAGE_KEY = 'barberflow_appointments_cache';

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
    supabaseInstance = createClient(url, key);
    return supabaseInstance;
  }
  return null;
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

        if (error) throw error;

        if (data) {
          const mapped = data.map((item: any) => ({
            id: item.id,
            clientName: item.client_name,
            clientPhone: item.client_phone,
            service: item.service,
            date: item.date,
            time: item.time,
            status: item.status,
            createdAt: new Date(item.created_at || Date.now()).getTime()
          }));
          // Atualiza o cache local para consulta offline
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mapped));
          return mapped;
        }
      } catch (err) {
        console.error("Erro ao buscar do Supabase, tentando cache local:", err);
      }
    }
    
    // Fallback para cache local se o banco falhar ou não estiver configurado
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    return cached ? JSON.parse(cached) : [];
  },

  async saveAppointment(appointment: Omit<Appointment, 'id' | 'createdAt' | 'status'>): Promise<void> {
    const supabase = getSupabase();

    if (supabase) {
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

      if (error) {
        console.error("Erro Supabase:", error.message);
        throw new Error("Erro ao salvar no banco de dados.");
      }
    } else {
      // Se não houver banco, salva localmente para não perder a venda
      const localApps = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
      const newApp = {
        ...appointment,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: Date.now(),
        status: 'pending'
      };
      localApps.push(newApp);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localApps));
      console.warn("Agendamento salvo apenas LOCALMENTE. Configure o Supabase para sincronizar entre aparelhos.");
    }
  },

  async updateAppointmentStatus(id: string, status: Appointment['status']): Promise<void> {
    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    }
    
    // Atualiza local também
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      const apps = JSON.parse(cached) as Appointment[];
      const updated = apps.map(a => a.id === id ? { ...a, status } : a);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    }
  }
};
