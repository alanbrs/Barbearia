
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "px-6 py-4 rounded-xl font-oswald font-medium transition-all duration-300 flex items-center justify-center disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed uppercase tracking-widest text-sm";
  
  const variants = {
    primary: "gold-gradient text-obsidian-900 shadow-[0_10px_20px_-5px_rgba(197,160,89,0.3)] hover:scale-[1.02] active:scale-[0.98]",
    secondary: "bg-obsidian-800 hover:bg-zinc-800 text-white border border-zinc-800",
    danger: "bg-red-950/30 hover:bg-red-900/50 text-red-500 border border-red-900/30",
    ghost: "bg-transparent hover:bg-gold-500/10 text-gold-500 border border-gold-500/20"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
