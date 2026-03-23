import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md';
}

export function Button({
  children,
  className = '',
  variant = 'secondary',
  size = 'md',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`button button-${variant} ${size === 'sm' ? 'button-sm' : ''} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
