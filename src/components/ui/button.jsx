import React from 'react';

export function Button({ className = '', variant, children, onClick, disabled, ...props }) {
  const base = 'inline-flex items-center justify-center font-semibold transition-all duration-200 px-4 py-3 md:py-2 min-h-[48px] touch-manipulation select-none active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';
  const variantStyles = variant === 'outline' ? 'bg-transparent border border-white/20 hover:bg-white/10' : '';
  return (
    <button 
      className={`${base} ${variantStyles} ${className}`} 
      onClick={onClick}
      disabled={disabled}
      style={{ WebkitTapHighlightColor: 'transparent' }}
      {...props}
    >
      {children}
    </button>
  );
}
