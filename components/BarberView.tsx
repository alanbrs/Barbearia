
import React, { useState, useEffect } from 'react';
import { Appointment } from '../types';
import { getBarberInsights } from '../services/geminiService';
import { Button } from './Button';

interface BarberViewProps {
  appointments: Appointment[];
  onUpdateStatus: (id: string, status: Appointment['status']) => void;
}

export const BarberView: React.FC<BarberViewProps> = ({ appointments, onUpdateStatus }) => {
  const [insight, setInsight] = useState<string>('Carregando dicas do mestre...');
  const [filterDate, setFilterDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetchInsight = async () => {
      const today = new Date().toISOString().split('T')[0];
      const todayCount = appointments.filter(a => a.date === today && a.status !== 'canceled').length;
      const result = await getBarberInsights(todayCount);
      setInsight(result || "Qualidade é o nosso foco.");
    };
    fetchInsight();
  }, [appointments.length]);

  const filteredAppointments = appointments
    .filter(app => app.date === filterDate)
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="max-w-4xl mx-auto p-4 pb-24">
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-oswald font-bold text-amber-500 uppercase tracking-wider">Painel do Barbeiro</h1>
            <p className="text-slate-400">Total de {appointments.filter(a => a.status === 'pending').length} agendamentos pendentes no sistema.</p>
          </div>
          <div className="flex items-center gap-3 bg-slate-800 p-2 rounded-xl border border-slate-700">
             <label className="text-xs font-bold text-slate-500 uppercase px-2">Agenda de:</label>
             <input 
              type="date" 
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-slate-900 border-none rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-1 ring-amber-500"
             />
          </div>
        </div>
      </header>

      {/* Dica da IA */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 mb-8 flex items-start gap-4">
        <div className="bg-amber-500/20 p-3 rounded-xl text-amber-500">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        </div>
        <div>
          <h3 className="text-amber-500 font-bold text-sm uppercase tracking-widest mb-1">Dica do Mestre</h3>
          <p className="text-slate-300 italic text-sm">"{insight}"</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold font-oswald uppercase tracking-tight">
            Horários de {new Date(filterDate + 'T12:00:00').toLocaleDateString('pt-BR')}
          </h2>
          <span className="text-xs bg-slate-800 px-3 py-1 rounded-full text-slate-400 border border-slate-700">
            {filteredAppointments.length} clientes
          </span>
        </div>

        {filteredAppointments.length === 0 ? (
          <div className="bg-slate-800/30 border border-dashed border-slate-700 rounded-3xl p-16 text-center">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <p className="text-slate-500 font-medium">Nenhum agendamento para este dia.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredAppointments.map(app => (
              <div 
                key={app.id} 
                className={`bg-slate-800/80 backdrop-blur-sm border rounded-2xl p-4 transition-all ${
                  app.status === 'completed' ? 'border-green-500/20 opacity-60' : 
                  app.status === 'canceled' ? 'border-red-500/20 opacity-40' : 'border-slate-700 hover:border-amber-500/50'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="text-xl font-oswald font-bold text-amber-500 w-16">
                      {app.time}
                    </div>
                    <div className="h-10 w-[1px] bg-slate-700 hidden sm:block"></div>
                    <div>
                      <h4 className="font-bold text-slate-100">{app.clientName}</h4>
                      <p className="text-xs text-slate-500">{app.clientPhone} • <span className="text-amber-500/80">{app.service}</span></p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {app.status === 'pending' ? (
                      <>
                        <button 
                          onClick={() => onUpdateStatus(app.id, 'canceled')}
                          className="w-10 h-10 flex items-center justify-center text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                          title="Cancelar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <button 
                          onClick={() => onUpdateStatus(app.id, 'completed')}
                          className="bg-green-500/10 text-green-500 px-4 py-2 rounded-xl text-xs font-bold hover:bg-green-500 hover:text-white transition-all"
                        >
                          CONCLUIR
                        </button>
                      </>
                    ) : (
                      <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${
                        app.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {app.status === 'completed' ? 'Finalizado' : 'Cancelado'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
