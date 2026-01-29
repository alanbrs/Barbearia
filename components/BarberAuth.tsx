
import React, { useState } from 'react';

interface BarberAuthProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const BarberAuth: React.FC<BarberAuthProps> = ({ onSuccess, onCancel }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const CORRECT_PIN = '1234';

  const handleNumberClick = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setError(false);
      if (newPin === CORRECT_PIN) {
        setTimeout(onSuccess, 400);
      } else if (newPin.length === 4) {
        setTimeout(() => { setError(true); setPin(''); }, 400);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-obsidian-950 z-[100] flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
      <div className="w-full max-w-xs text-center">
        <div className="w-20 h-20 gold-gradient rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-gold-500/20 rotate-12 group-hover:rotate-0 transition-transform">
          <svg className="w-10 h-10 text-obsidian-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        
        <h2 className="text-3xl font-oswald font-light mb-2 uppercase tracking-[0.2em] text-white">Security Check</h2>
        <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.3em] mb-12">Authorized Personnel Only</p>

        <div className="flex justify-center gap-6 mb-16">
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i}
              className={`w-3 h-3 rounded-full border transition-all duration-300 ${
                pin.length >= i ? 'bg-gold-500 border-gold-500 scale-125 shadow-[0_0_10px_rgba(197,160,89,0.5)]' : 'border-zinc-800'
              } ${error ? 'border-red-900 bg-red-900 animate-pulse' : ''}`}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6 mb-12">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((btn, idx) => {
            if (btn === '') return <div key={idx} />;
            return (
              <button
                key={idx}
                onClick={() => btn === '⌫' ? setPin(pin.slice(0, -1)) : handleNumberClick(btn)}
                className="h-16 w-16 rounded-2xl glass-panel text-lg font-oswald font-medium transition-all flex items-center justify-center border border-zinc-800 active:bg-gold-500 active:text-obsidian-900 active:scale-95"
              >
                {btn}
              </button>
            );
          })}
        </div>

        <button 
          onClick={onCancel}
          className="text-zinc-600 hover:text-gold-500 transition-colors text-[9px] font-bold uppercase tracking-[0.4em]"
        >
          Exit System
        </button>
      </div>
    </div>
  );
};
