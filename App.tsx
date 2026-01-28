
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
    setIsLoading(true);
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
    // Opcional: Polling simples para atualizar a agenda a cada 30 segundos
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleBook = async (data: Omit<Appointment, 'id' | 'createdAt' | 'status'>) => {
    setIsLoading(true);
    try {
      await storageService.saveAppointment(data);
      await loadData(); // Recarrega para obter o ID gerado pelo banco
    } catch (error) {
      alert("Erro ao salvar agendamento. Verifique sua conexão.");
      console.error(error);
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
      if (newRole === 'barber') loadData();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100 pb-16">
      {isLoading && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-amber-500 font-bold text-xs uppercase tracking-widest">Sincronizando Banco de Dados...</p>
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

      <nav className="bg-slate-800/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-700 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
               <path d="M12.67,3.58C11,1.91,8.33,1.91,6.67,3.58S4.99,7.91,6.66,9.58s5-1,5-1L12.67,3.58z M9.67,9.08c-0.83,0-1.5-0.67-1.5-1.5 s0.67-1.5,1.5-1.5s1.5,0.67,1.5,1.5S10.5,9.08,9.67,9.08z M12,14c-2.21,0-4,1.79-4,4v2h8v-2C16,15.79,14.21,14,12,14z"/>
            </svg>
          </div>
          <span className="font-oswald text-xl font-bold tracking-tight uppercase">Barber<span className="text-amber-500">Flow</span></span>
        </div>
        
        <div className="bg-slate-900/50 p-1 rounded-full flex border border-slate-700">
          <button 
            onClick={() => handleRoleChange('client')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${role === 'client' && !showAuthScreen ? 'bg-amber-500 text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            CLIENTE
          </button>
          <button 
            onClick={() => handleRoleChange('barber')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${role === 'barber' || showAuthScreen ? 'bg-amber-500 text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            BARBEIRO
          </button>
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto">
        {role === 'client' ? (
          <ClientView appointments={appointments} onBook={handleBook} />
        ) : (
          <BarberView appointments={appointments} onUpdateStatus={updateStatus} />
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-slate-800/90 backdrop-blur-md border-t border-slate-700 py-3 px-6 flex justify-around items-center md:hidden z-40">
        <button 
          className={`flex flex-col items-center gap-1 ${role === 'client' && !showAuthScreen ? 'text-amber-500' : 'text-slate-500'}`} 
          onClick={() => handleRoleChange('client')}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          <span className="text-[10px] font-bold uppercase">Agendar</span>
        </button>
        <button 
          className={`flex flex-col items-center gap-1 ${role === 'barber' || showAuthScreen ? 'text-amber-500' : 'text-slate-500'}`} 
          onClick={() => handleRoleChange('barber')}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          <span className="text-[10px] font-bold uppercase">Painel</span>
        </button>
      </div>
    </div>
  );
};

export default App;
