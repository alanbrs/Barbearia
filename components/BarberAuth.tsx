
import React, { useState } from 'react';
import { Button } from './Button';

interface BarberAuthProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const BarberAuth: React.FC<BarberAuthProps> = ({ onSuccess, onCancel }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const CORRECT_PIN = '1234'; // PIN de exemplo

  const handleNumberClick = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setError(false);
      
      if (newPin === CORRECT_PIN) {
        setTimeout(onSuccess, 300);
      } else if (newPin.length === 4) {
        setTimeout(() => {
          setError(true);
          setPin('');
        }, 300);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 z-[60] flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="w-full max-w-xs text-center">
        <div className="w-20 h-20 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/20">
          <svg className="w-10 h-10 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-oswald font-bold mb-2 uppercase tracking-wider">Acesso Restrito</h2>
        <p className="text-slate-400 mb-8">Digite seu PIN de acesso</p>

        {/* PIN Indicators */}
        <div className="flex justify-center gap-4 mb-10">
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                pin.length >= i ? 'bg-amber-500 border-amber-500 scale-110' : 'border-slate-700'
              } ${error ? 'border-red-500 bg-red-500 animate-bounce' : ''}`}
            />
          ))}
        </div>

        {/* Keyboard */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((btn, idx) => {
            if (btn === '') return <div key={idx} />;
            return (
              <button
                key={idx}
                onClick={() => btn === '⌫' ? setPin(pin.slice(0, -1)) : handleNumberClick(btn)}
                className="h-16 w-16 rounded-full bg-slate-800 hover:bg-slate-700 text-xl font-bold transition-colors flex items-center justify-center border border-slate-700"
              >
                {btn}
              </button>
            );
          })}
        </div>

        <button 
          onClick={onCancel}
          className="text-slate-500 hover:text-white transition-colors text-sm font-semibold uppercase tracking-widest"
        >
          Cancelar e Voltar
        </button>
      </div>
    </div>
  );
};
