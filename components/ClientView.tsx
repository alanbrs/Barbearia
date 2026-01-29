
import React, { useState, useEffect } from 'react';
import { SERVICES, TIME_SLOTS, DAYS_TO_SHOW } from '../constants';
import { ServiceType, Appointment } from '../types';
import { Button } from './Button';

interface ClientViewProps {
  appointments: Appointment[];
  onBook: (newAppointment: Omit<Appointment, 'id' | 'createdAt' | 'status'>) => Promise<boolean>;
}

export const ClientView: React.FC<ClientViewProps> = ({ appointments, onBook }) => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);

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

  const handleBooking = async () => {
    if (!selectedService || !selectedTime || !clientName || !clientPhone) return;
    
    const success = await onBook({
      clientName,
      clientPhone,
      service: selectedService,
      date: selectedDate,
      time: selectedTime
    });

    if (success) {
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-xl mx-auto p-6 pt-20 text-center animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="text-3xl font-oswald font-bold mb-2">AGENDADO COM SUCESSO!</h2>
        <p className="text-slate-400 mb-8">Tudo certo, {clientName.split(' ')[0]}.<br/>Esperamos você no dia {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR')} às {selectedTime}.</p>
        <Button fullWidth onClick={() => {
          setIsSuccess(false);
          setStep(1);
          setSelectedService(null);
          setSelectedTime(null);
          setClientName('');
          setClientPhone('');
        }}>Fazer outro agendamento</Button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-4 pb-24">
      <header className="mb-8">
        <h1 className="text-3xl font-oswald font-bold text-amber-500 uppercase tracking-wider">Reserve seu Horário</h1>
        <p className="text-slate-400">Escolha o melhor momento para cuidar do seu visual.</p>
      </header>

      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map(s => (
          <div key={s} className={`h-1 flex-1 rounded-full transition-colors duration-500 ${step >= s ? 'bg-amber-500' : 'bg-slate-700'}`} />
        ))}
      </div>

      {step === 1 && (
        <section className="space-y-6 animate-in fade-in duration-300">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span className="w-6 h-6 bg-amber-500/10 text-amber-500 text-xs rounded-full flex items-center justify-center border border-amber-500/20">1</span>
            Escolha a Data
          </h2>
          <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
            {dates.map(d => (
              <button
                key={d.iso}
                onClick={() => setSelectedDate(d.iso)}
                className={`flex-shrink-0 w-16 h-20 flex flex-col items-center justify-center rounded-2xl border-2 transition-all ${
                  selectedDate === d.iso ? 'border-amber-500 bg-amber-500/10 text-amber-500' : 'border-slate-800 bg-slate-800/50 text-slate-400'
                }`}
              >
                <span className="text-[10px] uppercase font-black tracking-tighter">{d.day}</span>
                <span className="text-2xl font-oswald font-bold leading-none mt-1">{d.num}</span>
              </button>
            ))}
          </div>

          <h2 className="text-xl font-semibold pt-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-amber-500/10 text-amber-500 text-xs rounded-full flex items-center justify-center border border-amber-500/20">2</span>
            Selecione o Serviço
          </h2>
          <div className="grid gap-3">
            {SERVICES.map(service => (
              <button
                key={service.id}
                onClick={() => setSelectedService(service.name)}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  selectedService === service.name ? 'border-amber-500 bg-amber-500/5' : 'border-slate-800 bg-slate-800/50'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className={`font-bold text-lg ${selectedService === service.name ? 'text-amber-500' : ''}`}>{service.name}</h3>
                  <span className="text-amber-500 font-black">R$ {service.price}</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{service.description}</p>
                <div className="mt-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {service.duration} minutos
                </div>
              </button>
            ))}
          </div>

          <Button 
            fullWidth 
            disabled={!selectedService}
            onClick={() => { setStep(2); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="mt-4"
          >
            Ver Horários Disponíveis
          </Button>
        </section>
      )}

      {step === 2 && (
        <section className="space-y-6 animate-in slide-in-from-right duration-300">
          <button onClick={() => setStep(1)} className="text-amber-500 flex items-center gap-2 text-sm font-bold uppercase tracking-tighter">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
            Voltar
          </button>
          
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span className="w-6 h-6 bg-amber-500/10 text-amber-500 text-xs rounded-full flex items-center justify-center border border-amber-500/20">3</span>
            Escolha um Horário
          </h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
            Disponível para {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR')}
          </p>
          
          <div className="grid grid-cols-3 gap-2">
            {TIME_SLOTS.map(time => {
              const booked = isSlotBooked(time);
              return (
                <button
                  key={time}
                  disabled={booked}
                  onClick={() => setSelectedTime(time)}
                  className={`py-4 rounded-xl border-2 text-center transition-all font-oswald text-lg ${
                    selectedTime === time 
                      ? 'border-amber-500 bg-amber-500 text-slate-900 font-bold' 
                      : booked 
                        ? 'border-slate-800 bg-slate-900 text-slate-700 opacity-40 cursor-not-allowed line-through' 
                        : 'border-slate-800 bg-slate-800/50 text-slate-300 hover:border-slate-600'
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
            onClick={() => { setStep(3); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          >
            Próximo: Seus Dados
          </Button>
        </section>
      )}

      {step === 3 && (
        <section className="space-y-6 animate-in slide-in-from-right duration-300">
          <button onClick={() => setStep(2)} className="text-amber-500 flex items-center gap-2 text-sm font-bold uppercase tracking-tighter">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
            Voltar
          </button>

          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span className="w-6 h-6 bg-amber-500/10 text-amber-500 text-xs rounded-full flex items-center justify-center border border-amber-500/20">4</span>
            Finalizar Reserva
          </h2>
          
          <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-700/50 pb-3">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Serviço</span>
              <span className="font-bold text-slate-200">{selectedService}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-700/50 pb-3">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Data</span>
              <span className="font-bold text-slate-200">{new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Horário</span>
              <span className="font-oswald text-xl font-bold text-amber-500">{selectedTime}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Seu Nome</label>
              <input 
                type="text" 
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ex: João Silva"
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 focus:border-amber-500 focus:ring-1 ring-amber-500/20 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">WhatsApp</label>
              <input 
                type="tel" 
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="(00) 00000-0000"
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 focus:border-amber-500 focus:ring-1 ring-amber-500/20 outline-none transition-all"
              />
            </div>
          </div>

          <Button 
            fullWidth 
            onClick={handleBooking}
            disabled={!clientName.trim() || !clientPhone.trim()}
            className="h-16 text-lg uppercase tracking-widest font-black"
          >
            Confirmar Reserva
          </Button>
        </section>
      )}
    </div>
  );
};
