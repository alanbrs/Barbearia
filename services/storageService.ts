
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Appointment } from '../types';

// Função utilitária para acessar env sem quebrar o browser
const getEnvSafe = (key: string): string => {
  try {
    if (typeof process !== 'undefined' && process.env) {
      return (process.env as any)[key] || '';
    }
  } catch (e) {
    console.warn(`Erro ao acessar a variável ${key}:`, e);
  }
  return '';
};

const supabaseUrl = getEnvSafe('SUPABASE_URL');
const supabaseAnonKey = getEnvSafe('SUPABASE_ANON_KEY');

let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.error("Erro ao inicializar Supabase:", err);
  }
}

export const storageService = {
  async getAppointments(): Promise<Appointment[]> {
    if (!supabase) {
      console.warn("Banco de dados não configurado no Vercel. Use variáveis de ambiente.");
      return [];
    }

    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('time', { ascending: true });

    if (error) {
      console.error("Erro na busca de dados:", error);
      return [];
    }

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
  },

  async saveAppointment(appointment: Omit<Appointment, 'id' | 'createdAt' | 'status'>): Promise<void> {
    if (!supabase) throw new Error("Banco de dados não configurado.");

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
    if (!supabase) throw new Error("Banco de dados não configurado.");

    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
  }
};
