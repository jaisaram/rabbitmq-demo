'use client';

import React from 'react';

export const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={`glass rounded-2xl overflow-hidden ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, title, subtitle }: { children?: React.ReactNode, title?: string, subtitle?: string }) => {
  return (
    <div className="px-6 py-5 border-b border-slate-100/80">
      {title && <h3 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h3>}
      {subtitle && <p className="text-sm text-slate-500 font-medium">{subtitle}</p>}
      {children}
    </div>
  );
};

export const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={`px-6 py-6 ${className}`}>
      {children}
    </div>
  );
};
