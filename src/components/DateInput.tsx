import React from 'react';

interface DateInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  className?: string;
}

export function DateInput({ label, className = '', ...props }: DateInputProps) {
  return (
    <label className={`field ${className}`.trim()}>
      <span>{label}</span>
      <input type="date" className="date-input" {...props} />
    </label>
  );
}
