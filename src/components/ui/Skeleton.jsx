import React from 'react';

export function Skeleton({ className = '', theme = 'dark' }) {
  return (
    <div
      className={`animate-pulse rounded ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'} ${className}`}
    />
  );
}

export function SkeletonText({ lines = 3, theme = 'dark', className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div 
          key={i}
          className={`h-4 animate-pulse rounded ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`}
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ theme = 'dark', className = '' }) {
  return (
    <div className={`rounded-2xl p-5 ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-white border border-slate-200'} ${className}`}>
      <div className="flex items-center gap-4 mb-4">
        <div className={`h-12 w-12 animate-pulse rounded-full ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`} />
        <div className="flex-1 space-y-2">
          <div className={`h-4 w-24 animate-pulse rounded ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`} />
          <div className={`h-3 w-16 animate-pulse rounded ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`} />
        </div>
      </div>
      <SkeletonText lines={2} theme={theme} />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4, theme = 'dark', className = '' }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex gap-4">
          {Array.from({ length: cols }).map((_, colIdx) => (
            <div
              key={colIdx}
              className={`h-8 animate-pulse rounded flex-1 ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`}
              style={{ flex: colIdx === 0 ? 2 : 1 }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonAvatar({ size = 'md', theme = 'dark', className = '' }) {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };
  
  return (
    <div 
      className={`animate-pulse rounded-full ${sizes[size]} ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'} ${className}`} 
    />
  );
}

export function SkeletonButton({ theme = 'dark', className = '' }) {
  return (
    <div 
      className={`h-10 w-24 animate-pulse rounded-xl ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'} ${className}`} 
    />
  );
}

export default Skeleton;
