
import React, { useState, useEffect } from 'react';
import { Appointment } from '../types';
import { getBarberInsights } from '../services/geminiService';

interface BarberViewProps {
  appointments: Appointment[];
  onUpdateStatus: (id: string, status: Appointment['status']) => void;
}

export const BarberView: React.FC<BarberViewProps> = ({ appointments, onUpdateStatus }) => {
  const [insight, setInsight] = useState<string>('Refinando o atendimento...');
  const [filterDate, setFilterDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetchInsight = async () => {
      const today = new Date().toISOString().split('T')[0];
      const todayCount = appointments.filter(a => a.date === today && a.status !== 'canceled').length;
      const result = await getBarberInsights(todayCount);
      setInsight(result || "A excelência está nos detalhes.");
    };
    fetchInsight();
  }, [appointments.length]);

  const filteredAppointments = appointments
    .filter(app => app.date === filterDate)
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="max-w-5xl mx-auto p-6 pb-24">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <span className="text-gold-500 text-[10px] font-bold tracking-[0.5em] uppercase mb-2 block">Management Console</span>
          <h1 className="text-5xl font-oswald font-light tracking-tight uppercase leading-none">Painel de <span className="text-gold-500">Comando</span></h1>
        </div>
        <div className="flex items-center gap-4 bg-obsidian-800/40 p-1.5 rounded-2xl border border-zinc-800">
           <span className="text-[9px] font-bold text-zinc-500 uppercase px-4">Agenda:</span>
           <input 
            type="date" 
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="bg-obsidian-900 border-none rounded-xl px-4 py-2 text-xs font-bold outline-none text-gold-500"
           />
        </div>
      </header>

      {/* Luxury Insight Card */}
      <div className="relative overflow-hidden rounded-3xl mb-12 group">
        <div className="absolute inset-0 gold-gradient opacity-10 group-hover:opacity-20 transition-opacity"></div>
        <div className="relative glass-panel p-8 flex items-center gap-8 border-gold-500/10">
          <div className="hidden sm:flex h-16 w-16 gold-gradient rounded-2xl items-center justify-center text-obsidian-950 shadow-xl shadow-gold-500/10">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div>
            <h3 className="text-gold-500 font-bold text-[10px] uppercase tracking-[0.4em] mb-2">Visão Estratégica AI</h3>
            <p className="text-white text-lg font-light italic leading-relaxed">"{insight}"</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-end border-b border-zinc-800 pb-4 px-2">
          <h2 className="text-xl font-oswald font-light tracking-[0.1em] uppercase">
            {new Date(filterDate + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
          </h2>
          <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest bg-zinc-900/50 px-3 py-1 rounded-full border border-zinc-800">
            {filteredAppointments.length} Serviços
          </span>
        </div>

        {filteredAppointments.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-zinc-600 font-light italic uppercase tracking-widest text-sm">Sem agendamentos para este período.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredAppointments.map(app => (
              <div 
                key={app.id} 
                className={`group relative overflow-hidden rounded-2xl transition-all duration-300 ${
                  app.status === 'completed' ? 'opacity-40 grayscale' : 
                  app.status === 'canceled' ? 'opacity-20 line-through' : 'hover:scale-[1.01]'
                }`}
              >
                <div className="glass-panel p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-8 w-full sm:w-auto">
                    <div className="font-oswald text-3xl font-light text-gold-500 tracking-tighter w-20">
                      {app.time}
                    </div>
                    <div className="h-12 w-[1px] bg-zinc-800 hidden md:block"></div>
                    <div>
                      <h4 className="font-oswald text-lg font-medium tracking-wide text-white uppercase">{app.clientName}</h4>
                      <p className="text-[10px] font-bold text-zinc-500 tracking-widest flex items-center gap-2 mt-1">
                        {app.clientPhone} <span className="w-1 h-1 bg-zinc-700 rounded-full"></span> 
                        <span className="text-gold-500/80">{app.service}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    {app.status === 'pending' ? (
                      <>
                        <button 
                          onClick={() => onUpdateStatus(app.id, 'canceled')}
                          className="w-12 h-12 flex items-center justify-center text-red-900 hover:text-red-500 hover:bg-red-500/5 rounded-full transition-all border border-transparent hover:border-red-900/30"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <button 
                          onClick={() => onUpdateStatus(app.id, 'completed')}
                          className="bg-gold-500/5 text-gold-500 border border-gold-500/30 px-6 py-2.5 rounded-xl text-[10px] font-bold tracking-[0.2em] hover:bg-gold-500 hover:text-obsidian-950 transition-all uppercase"
                        >
                          Finalizar
                        </button>
                      </>
                    ) : (
                      <span className={`text-[9px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-full border ${
                        app.status === 'completed' ? 'border-green-900 text-green-700' : 'border-red-900 text-red-900'
                      }`}>
                        {app.status === 'completed' ? 'Entregue' : 'Cancelado'}
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
