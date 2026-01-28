
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Appointment } from '../types';

let supabaseInstance: SupabaseClient | null = null;

const getSupabase = (): SupabaseClient | null => {
  if (supabaseInstance) return supabaseInstance;

  try {
    const env = (window as any).process?.env || {};
    const url = env.SUPABASE_URL || '';
    const key = env.SUPABASE_ANON_KEY || '';

    if (url && key && url.startsWith('http')) {
      supabaseInstance = createClient(url, key);
      return supabaseInstance;
    }
  } catch (e) {
    console.error("Erro ao inicializar Supabase:", e);
  }
  
  return null;
};

export const storageService = {
  async getAppointments(): Promise<Appointment[]> {
    const supabase = getSupabase();
    if (!supabase) {
      console.warn("Supabase não configurado.");
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('time', { ascending: true });

      if (error) throw error;

      return (data || []).map((item: any) => ({
        id: item.id,
        clientName: item.client_name,
        clientPhone: item.client_phone,
        service: item.service,
        date: item.date,
        time: item.time,
        status: item.status,
        createdAt: new Date(item.created_at).getTime()
      }));
    } catch (err) {
      console.error("Erro ao buscar agendamentos:", err);
      return [];
    }
  },

  async saveAppointment(appointment: Omit<Appointment, 'id' | 'createdAt' | 'status'>): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error("Banco de dados não disponível.");
    }

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

    if (error) throw error;
  },

  async updateAppointmentStatus(id: string, status: Appointment['status']): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) return;

    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
  }
};
