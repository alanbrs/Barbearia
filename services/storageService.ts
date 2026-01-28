
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Appointment } from '../types';

// Proteção global para o objeto process no navegador
const safeProcess = (typeof process !== 'undefined' ? process : (window as any).process) || { env: {} };

const getEnvSafe = (key: string): string => {
  try {
    return safeProcess.env?.[key] || '';
  } catch (e) {
    return '';
  }
};

const supabaseUrl = getEnvSafe('SUPABASE_URL');
const supabaseAnonKey = getEnvSafe('SUPABASE_ANON_KEY');

let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey && supabaseUrl !== '' && supabaseAnonKey !== '') {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.error("Erro crítico ao inicializar Supabase:", err);
  }
} else {
  console.warn("Supabase não configurado: Verifique as variáveis de ambiente SUPABASE_URL e SUPABASE_ANON_KEY no painel da Vercel.");
}

export const storageService = {
  async getAppointments(): Promise<Appointment[]> {
    if (!supabase) return [];

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
      console.error("Falha ao buscar agendamentos:", err);
      return [];
    }
  },

  async saveAppointment(appointment: Omit<Appointment, 'id' | 'createdAt' | 'status'>): Promise<void> {
    if (!supabase) {
      alert("Configuração do banco de dados ausente. Verifique o painel da Vercel.");
      return;
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
    if (!supabase) return;

    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
  }
};
