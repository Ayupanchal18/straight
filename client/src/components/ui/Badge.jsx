import React from 'react';

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full';

  const variants = {
    default: 'bg-slate-700/60 text-slate-300 border border-slate-600/40',
    live: 'bg-rose-500/15 text-rose-400 border border-rose-500/30 font-semibold',
    success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    info: 'bg-sky-500/15 text-sky-400 border border-sky-500/30',
    warning: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    primary: 'bg-cricket-500/20 text-cricket-400 border border-cricket-500/40',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2',
  };

  const dotColors = {
    default: 'bg-slate-400',
    live: 'bg-rose-500 animate-ping',
    success: 'bg-emerald-400',
    info: 'bg-sky-400',
    warning: 'bg-amber-400',
    primary: 'bg-cricket-400',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}>
      {dot && (
        <span className="relative flex h-2 w-2">
          <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColors[variant]}`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${variant === 'live' ? 'bg-rose-500' : dotColors[variant]}`}></span>
        </span>
      )}
      {children}
    </span>
  );
};
