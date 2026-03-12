'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = ({ label, error, className = '', ...props }: InputProps) => {
  return (
    <div className="w-full space-y-1.5">
      {label && <label className="block text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">{label}</label>}
      <input
        className={`w-full bg-white/60 backdrop-blur-sm border ${error ? 'border-red-500' : 'border-slate-200'} rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all ${className}`}
        {...props}
        value={props.value ?? ''}
      />
      {error && <p className="text-[10px] text-red-400 ml-1">{error}</p>}
    </div>
  );
};
