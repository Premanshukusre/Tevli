import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'slate' | 'indigo' | 'emerald' | 'amber' | 'red';
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'slate', 
  className = '', 
  ...props 
}) => {
  const variants = {
    slate: 'bg-slate-50 text-slate-600 border border-slate-200',
    indigo: 'bg-primary-50 text-primary-700 border border-primary-200',
    emerald: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border border-amber-200',
    red: 'bg-red-50 text-red-700 border border-red-200',
  };

  return (
    <span 
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium uppercase tracking-wider ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
