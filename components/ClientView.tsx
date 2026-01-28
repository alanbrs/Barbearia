
import React, { useState, useEffect } from 'react';
import { SERVICES, TIME_SLOTS, DAYS_TO_SHOW } from '../constants';
import { ServiceType, Appointment } from '../types';
import { Button } from './Button';

interface ClientViewProps {
  appointments: Appointment[];
  onBook: (newAppointment: Omit<Appointment, 'id' | 'createdAt' | 'status'>) => void;
}

export const ClientView: React.FC<ClientViewProps> = ({ appointments, onBook }) => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [step, setStep] = useState(1);

  // Generate next 7 days
  const dates = Array.from({ length: DAYS_TO_SHOW }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      iso: d.toISOString().split('T')[0],
      day: d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
      num: d.getDate()
    };
  });

  const isSlotBooked = (time: string) => {
    return appointments.some(app => app.date === selectedDate && app.time === time && app.status !== 'canceled');
  };

  const handleBooking = () => {
    if (!selectedService || !selectedTime || !clientName || !clientPhone) return;
    onBook({
      clientName,
      clientPhone,
      service: selectedService,
      date: selectedDate,
      time: selectedTime
    });
    // Reset form
    setStep(1);
    setSelectedService(null);
    setSelectedTime(null);
    setClientName('');
    setClientPhone('');
    alert('Agendamento realizado com sucesso!');
  };

  return (
    <div className="max-w-xl mx-auto p-4 pb-24">
      <header className="mb-8">
        <h1 className="text-3xl font-oswald font-bold text-amber-500 uppercase tracking-wider">Reserve seu Horário</h1>
        <p className="text-slate-400">Escolha o melhor momento para cuidar do seu visual.</p>
      </header>

      {/* Step Indicator */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map(s => (
          <div key={s} className={`h-1 flex-1 rounded-full ${step >= s ? 'bg-amber-500' : 'bg-slate-700'}`} />
        ))}
      </div>

      {step === 1 && (
        <section className="space-y-6 animate-in fade-in duration-300">
          <h2 className="text-xl font-semibold">1. Escolha a Data</h2>
          <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
            {dates.map(d => (
              <button
                key={d.iso}
                onClick={() => setSelectedDate(d.iso)}
                className={`flex-shrink-0 w-16 h-20 flex flex-col items-center justify-center rounded-xl border-2 transition-all ${
                  selectedDate === d.iso ? 'border-amber-500 bg-amber-500/10 text-amber-500' : 'border-slate-800 bg-slate-800/50 text-slate-400'
                }`}
              >
                <span className="text-xs uppercase font-medium">{d.day}</span>
                <span className="text-xl font-bold">{d.num}</span>
              </button>
            ))}
          </div>

          <h2 className="text-xl font-semibold pt-4">2. Selecione o Serviço</h2>
          <div className="grid gap-4">
            {SERVICES.map(service => (
              <button
                key={service.id}
                onClick={() => setSelectedService(service.name)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selectedService === service.name ? 'border-amber-500 bg-amber-500/10' : 'border-slate-800 bg-slate-800/50'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-lg">{service.name}</h3>
                  <span className="text-amber-500 font-bold">R$ {service.price}</span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">{service.description}</p>
                <div className="mt-2 text-xs text-slate-500 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {service.duration} minutos
                </div>
              </button>
            ))}
          </div>

          <Button 
            fullWidth 
            disabled={!selectedService}
            onClick={() => setStep(2)}
            className="mt-6"
          >
            Ver Horários Disponíveis
          </Button>
        </section>
      )}

      {step === 2 && (
        <section className="space-y-6 animate-in slide-in-from-right duration-300">
          <button onClick={() => setStep(1)} className="text-amber-500 flex items-center gap-2 text-sm mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            Voltar para serviços
          </button>
          
          <h2 className="text-xl font-semibold">3. Escolha um Horário</h2>
          <p className="text-sm text-slate-400">Disponibilidade para {new Date(selectedDate).toLocaleDateString('pt-BR')}</p>
          
          <div className="grid grid-cols-3 gap-3">
            {TIME_SLOTS.map(time => {
              const booked = isSlotBooked(time);
              return (
                <button
                  key={time}
                  disabled={booked}
                  onClick={() => setSelectedTime(time)}
                  className={`py-3 rounded-lg border-2 text-center transition-all relative overflow-hidden ${
                    selectedTime === time 
                      ? 'border-amber-500 bg-amber-500 text-slate-900 font-bold' 
                      : booked 
                        ? 'border-slate-800 bg-slate-900 text-slate-600 opacity-50 cursor-not-allowed line-through' 
                        : 'border-slate-800 bg-slate-800/50 text-slate-300'
                  }`}
                >
                  {time}
                </button>
              );
            })}
          </div>

          <Button 
            fullWidth 
            disabled={!selectedTime}
            onClick={() => setStep(3)}
          >
            Próximo: Seus Dados
          </Button>
        </section>
      )}

      {step === 3 && (
        <section className="space-y-6 animate-in slide-in-from-right duration-300">
          <button onClick={() => setStep(2)} className="text-amber-500 flex items-center gap-2 text-sm mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            Voltar para horários
          </button>

          <h2 className="text-xl font-semibold">4. Confirme seu Agendamento</h2>
          
          <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 space-y-4">
            <div className="flex justify-between border-b border-slate-700 pb-2">
              <span className="text-slate-400">Serviço:</span>
              <span className="font-semibold">{selectedService}</span>
            </div>
            <div className="flex justify-between border-b border-slate-700 pb-2">
              <span className="text-slate-400">Data:</span>
              <span className="font-semibold">{new Date(selectedDate).toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="flex justify-between border-b border-slate-700 pb-2">
              <span className="text-slate-400">Horário:</span>
              <span className="font-semibold text-amber-500">{selectedTime}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Nome Completo</label>
              <input 
                type="text" 
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ex: João Silva"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-amber-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Telefone / WhatsApp</label>
              <input 
                type="tel" 
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="(00) 00000-0000"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-amber-500 outline-none transition-all"
              />
            </div>
          </div>

          <Button 
            fullWidth 
            onClick={handleBooking}
            disabled={!clientName || !clientPhone}
          >
            Confirmar Reserva
          </Button>
        </section>
      )}
    </div>
  );
};
