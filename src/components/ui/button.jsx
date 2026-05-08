import React from 'react';

export function Button({ className = '', variant, children, ...props }) {
  const base = 'inline-flex items-center justify-center font-semibold transition px-4 py-2';
  const variantStyles = variant === 'outline' ? 'bg-transparent border' : '';
  return (
    <button className={`${base} ${variantStyles} ${className}`} {...props}>
      {children}
    </button>
  );
}
