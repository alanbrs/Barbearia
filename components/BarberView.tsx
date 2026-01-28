
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
      const todayCount = appointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length;
      const result = await getBarberInsights(todayCount);
      setInsight(result || "O segredo de um bom barbeiro é a atenção aos detalhes.");
    };
    fetchInsight();
  }, []);

  const filteredAppointments = appointments
    .filter(app => app.date === filterDate)
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="max-w-4xl mx-auto p-4 pb-24">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-oswald font-bold text-amber-500 uppercase tracking-wider">Painel do Barbeiro</h1>
          <p className="text-slate-400">Gerencie sua agenda e atendimentos.</p>
        </div>
        <div className="flex items-center gap-2">
           <label className="text-sm text-slate-400 whitespace-nowrap">Filtrar Data:</label>
           <input 
            type="date" 
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-500"
           />
        </div>
      </header>

      {/* AI Insight Box */}
      <div className="bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 rounded-2xl p-6 mb-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
        </div>
        <h3 className="text-amber-500 font-bold mb-2 flex items-center gap-2">
          <span className="text-xl">✨</span> Dica do Mestre (AI)
        </h3>
        <p className="text-slate-300 italic">"{insight}"</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          Agendamentos do Dia
          <span className="bg-amber-500 text-slate-900 text-xs px-2 py-0.5 rounded-full">{filteredAppointments.length}</span>
        </h2>

        {filteredAppointments.length === 0 ? (
          <div className="bg-slate-800/30 border border-slate-800 rounded-2xl p-12 text-center">
            <p className="text-slate-500">Nenhum agendamento para esta data.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredAppointments.map(app => (
              <div 
                key={app.id} 
                className={`bg-slate-800/50 border rounded-2xl p-5 transition-all ${
                  app.status === 'completed' ? 'border-green-500/30 opacity-75' : 
                  app.status === 'canceled' ? 'border-red-500/30 opacity-50 grayscale' : 'border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-full bg-slate-700 flex items-center justify-center text-amber-500 font-bold text-xl flex-shrink-0">
                      {app.clientName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="font-bold text-lg">{app.clientName}</h4>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          app.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                          app.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm">{app.clientPhone}</p>
                      <p className="text-amber-500 font-medium mt-1">{app.service}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-row sm:flex-col justify-between items-end gap-2">
                    <div className="text-2xl font-oswald font-bold text-white bg-slate-700/50 px-4 py-1 rounded-lg">
                      {app.time}
                    </div>
                    {app.status === 'pending' && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => onUpdateStatus(app.id, 'canceled')}
                          className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                          title="Cancelar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <button 
                          onClick={() => onUpdateStatus(app.id, 'completed')}
                          className="p-2 text-green-400 hover:bg-green-400/10 rounded-lg transition-colors"
                          title="Concluir"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                        </button>
                      </div>
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
