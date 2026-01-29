
import React, { useState } from 'react';
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
    const success = await onBook({ clientName, clientPhone, service: selectedService, date: selectedDate, time: selectedTime });
    if (success) {
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-xl mx-auto p-8 pt-24 text-center animate-in zoom-in duration-700">
        <div className="w-20 h-20 bg-gold-500/10 text-gold-500 rounded-full flex items-center justify-center mx-auto mb-8 border border-gold-500/30">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="text-4xl font-oswald font-light tracking-[0.2em] mb-4 uppercase">Reserva Confirmada</h2>
        <p className="text-zinc-500 font-light mb-12 max-w-xs mx-auto">Sua experiência premium está garantida para o dia {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR')} às {selectedTime}.</p>
        <Button fullWidth variant="ghost" onClick={() => {
          setIsSuccess(false);
          setStep(1);
          setSelectedService(null);
          setSelectedTime(null);
          setClientName('');
          setClientPhone('');
        }}>Novo Agendamento</Button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6 pb-24">
      <header className="mb-12 text-center">
        <span className="text-gold-500 text-[10px] font-bold tracking-[0.4em] uppercase mb-2 block">Experiência Exclusiva</span>
        <h1 className="text-4xl font-oswald font-light tracking-[0.1em] uppercase">Agende seu Estilo</h1>
      </header>

      {/* Steps Indicator */}
      <div className="flex justify-between mb-12 px-4 relative">
        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-zinc-800 -translate-y-1/2 z-0"></div>
        {[1, 2, 3].map(s => (
          <div key={s} className={`relative z-10 w-8 h-8 rounded-full border flex items-center justify-center text-[10px] font-bold transition-all duration-500 ${
            step === s ? 'bg-gold-500 border-gold-500 text-obsidian-900 scale-125' : 
            step > s ? 'bg-zinc-800 border-zinc-700 text-gold-500' : 'bg-obsidian-900 border-zinc-800 text-zinc-600'
          }`}>
            {s}
          </div>
        ))}
      </div>

      {step === 1 && (
        <section className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-4 block text-center">Data da Visita</label>
            <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
              {dates.map(d => (
                <button
                  key={d.iso}
                  onClick={() => setSelectedDate(d.iso)}
                  className={`flex-shrink-0 w-20 h-24 flex flex-col items-center justify-center rounded-xl border transition-all ${
                    selectedDate === d.iso ? 'border-gold-500 bg-gold-500/5' : 'border-zinc-800 bg-obsidian-800/30'
                  }`}
                >
                  <span className={`text-[9px] uppercase font-bold tracking-widest ${selectedDate === d.iso ? 'text-gold-500' : 'text-zinc-600'}`}>{d.day}</span>
                  <span className={`text-3xl font-oswald font-light mt-1 ${selectedDate === d.iso ? 'text-gold-500' : 'text-white'}`}>{d.num}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-6 block text-center">Nossos Serviços</label>
            <div className="grid gap-4">
              {SERVICES.map(service => (
                <button
                  key={service.id}
                  onClick={() => setSelectedService(service.name)}
                  className={`p-6 rounded-2xl border transition-all text-left relative overflow-hidden group ${
                    selectedService === service.name ? 'border-gold-500 bg-gold-500/5' : 'border-zinc-800 bg-obsidian-800/40'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`font-oswald text-xl font-light tracking-wide ${selectedService === service.name ? 'text-gold-500' : 'text-white'}`}>{service.name}</h3>
                    <span className="text-gold-500 font-medium">R$ {service.price}</span>
                  </div>
                  <p className="text-xs text-zinc-500 font-light leading-relaxed pr-8">{service.description}</p>
                  <div className="mt-4 flex items-center gap-3 text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{service.duration} MIN</span>
                  </div>
                  {selectedService === service.name && (
                    <div className="absolute top-4 right-4 text-gold-500">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <Button 
            fullWidth 
            disabled={!selectedService}
            onClick={() => { setStep(2); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          >
            Escolher Horário
          </Button>
        </section>
      )}

      {step === 2 && (
        <section className="space-y-10 animate-in slide-in-from-right duration-500">
          <button onClick={() => setStep(1)} className="text-zinc-500 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            Voltar aos Serviços
          </button>
          
          <div className="text-center">
             <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-4 block">Horários Disponíveis</label>
             <p className="text-xs text-gold-500 font-light italic mb-8 uppercase tracking-widest">
              Agenda de {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR')}
            </p>
            
            <div className="grid grid-cols-3 gap-3">
              {TIME_SLOTS.map(time => {
                const booked = isSlotBooked(time);
                return (
                  <button
                    key={time}
                    disabled={booked}
                    onClick={() => setSelectedTime(time)}
                    className={`py-5 rounded-xl border transition-all font-oswald text-xl ${
                      selectedTime === time 
                        ? 'border-gold-500 bg-gold-500 text-obsidian-950 font-medium' 
                        : booked 
                          ? 'border-zinc-900 bg-obsidian-950 text-zinc-800 cursor-not-allowed opacity-30' 
                          : 'border-zinc-800 bg-obsidian-800/30 text-zinc-400 hover:border-zinc-600'
                    }`}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          </div>

          <Button 
            fullWidth 
            disabled={!selectedTime}
            onClick={() => { setStep(3); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          >
            Confirmar Detalhes
          </Button>
        </section>
      )}

      {step === 3 && (
        <section className="space-y-10 animate-in slide-in-from-right duration-500">
          <button onClick={() => setStep(2)} className="text-zinc-500 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            Voltar aos Horários
          </button>

          <div className="space-y-8">
            <div className="bg-obsidian-800/40 p-8 rounded-3xl border border-zinc-800 space-y-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Serviço</span>
                <span className="font-oswald text-lg text-white">{selectedService}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Data & Hora</span>
                <div className="text-right">
                  <div className="text-white font-medium">{new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR')}</div>
                  <div className="text-gold-500 font-oswald text-xl">{selectedTime}</div>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="relative group">
                <input 
                  type="text" 
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="NOME COMPLETO"
                  className="w-full bg-obsidian-900 border border-zinc-800 rounded-2xl px-6 py-5 focus:border-gold-500 outline-none transition-all placeholder:text-zinc-700 text-sm uppercase tracking-widest font-medium"
                />
              </div>
              <div className="relative group">
                <input 
                  type="tel" 
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="WHATSAPP (DDD)"
                  className="w-full bg-obsidian-900 border border-zinc-800 rounded-2xl px-6 py-5 focus:border-gold-500 outline-none transition-all placeholder:text-zinc-700 text-sm uppercase tracking-widest font-medium"
                />
              </div>
            </div>

            <Button 
              fullWidth 
              onClick={handleBooking}
              disabled={!clientName.trim() || !clientPhone.trim()}
              className="py-6"
            >
              Finalizar Agendamento
            </Button>
          </div>
        </section>
      )}
    </div>
  );
};
