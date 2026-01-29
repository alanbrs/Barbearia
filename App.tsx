
import React, { useState, useEffect } from 'react';
import { Appointment, UserRole } from './types';
import { ClientView } from './components/ClientView';
import { BarberView } from './components/BarberView';
import { BarberAuth } from './components/BarberAuth';
import { storageService } from './services/storageService';

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>('client');
  const [isBarberAuthenticated, setIsBarberAuthenticated] = useState(false);
  const [showAuthScreen, setShowAuthScreen] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const data = await storageService.getAppointments();
      setAppointments(data);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleBook = async (data: Omit<Appointment, 'id' | 'createdAt' | 'status'>) => {
    setIsLoading(true);
    try {
      await storageService.saveAppointment(data);
      await loadData(); 
      return true;
    } catch (error) {
      console.error(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, status: Appointment['status']) => {
    try {
      await storageService.updateAppointmentStatus(id, status);
      setAppointments(prev => prev.map(app => 
        app.id === id ? { ...app, status } : app
      ));
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      loadData();
    }
  };

  const handleRoleChange = (newRole: UserRole) => {
    if (newRole === 'barber' && !isBarberAuthenticated) {
      setShowAuthScreen(true);
    } else {
      setRole(newRole);
      setShowAuthScreen(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-obsidian-950 text-slate-200 pb-20">
      {isLoading && appointments.length === 0 && (
        <div className="fixed inset-0 z-[100] bg-obsidian-950 flex items-center justify-center">
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="w-16 h-16 border-2 border-gold-500/20 rounded-full"></div>
              <div className="w-16 h-16 border-t-2 border-gold-500 rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
            <div className="flex flex-col items-center">
               <span className="font-oswald text-2xl font-light tracking-[0.3em] text-gold-500">BARBERFLOW</span>
               <span className="text-[10px] font-medium tracking-[0.5em] text-gold-500/50 uppercase mt-1">Premium Grooming</span>
            </div>
          </div>
        </div>
      )}

      {showAuthScreen && (
        <BarberAuth 
          onSuccess={() => {
            setIsBarberAuthenticated(true);
            setRole('barber');
            setShowAuthScreen(false);
            loadData();
          }}
          onCancel={() => {
            setShowAuthScreen(false);
            setRole('client');
          }}
        />
      )}

      <nav className="bg-obsidian-900/80 backdrop-blur-xl sticky top-0 z-50 border-b border-gold-500/10 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 gold-gradient rounded flex items-center justify-center rotate-45">
            <div className="-rotate-45">
              <svg className="w-5 h-5 text-obsidian-950" fill="currentColor" viewBox="0 0 24 24">
                 <path d="M12,2L4.5,20.29L5.21,21L12,18L18.79,21L19.5,20.29L12,2Z"/>
              </svg>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-oswald text-lg font-bold tracking-widest leading-tight">BARBER<span className="text-gold-500 font-light">FLOW</span></span>
          </div>
        </div>
        
        <div className="bg-obsidian-950 p-1 rounded-xl flex border border-white/5">
          <button 
            onClick={() => handleRoleChange('client')}
            className={`px-4 py-1.5 rounded-lg text-[9px] font-bold tracking-[0.2em] transition-all uppercase ${role === 'client' && !showAuthScreen ? 'bg-gold-500 text-obsidian-900' : 'text-zinc-500'}`}
          >
            Cliente
          </button>
          <button 
            onClick={() => handleRoleChange('barber')}
            className={`px-4 py-1.5 rounded-lg text-[9px] font-bold tracking-[0.2em] transition-all uppercase ${role === 'barber' || showAuthScreen ? 'bg-gold-500 text-obsidian-900' : 'text-zinc-500'}`}
          >
            Barbeiro
          </button>
        </div>
      </nav>

      <main className="flex-1">
        {role === 'client' ? (
          <ClientView appointments={appointments} onBook={handleBook} />
        ) : (
          <BarberView appointments={appointments} onUpdateStatus={updateStatus} />
        )}
      </main>

      {/* Luxury Footer Nav */}
      <div className="fixed bottom-0 left-0 right-0 glass-panel border-t border-gold-500/10 py-4 px-10 flex justify-around items-center md:hidden z-40">
        <button 
          className={`flex flex-col items-center gap-1 transition-all ${role === 'client' && !showAuthScreen ? 'text-gold-500 scale-110' : 'text-zinc-600'}`} 
          onClick={() => handleRoleChange('client')}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          <span className="text-[8px] font-bold uppercase tracking-widest">Reserva</span>
        </button>
        <button 
          className={`flex flex-col items-center gap-1 transition-all ${role === 'barber' || showAuthScreen ? 'text-gold-500 scale-110' : 'text-zinc-600'}`} 
          onClick={() => handleRoleChange('barber')}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          <span className="text-[8px] font-bold uppercase tracking-widest">Gestão</span>
        </button>
      </div>
    </div>
  );
};

export default App;
