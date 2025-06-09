// frontend/views/components/LoadingSpinner.tsx
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  text?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  color = 'text-orange-600',
  text = 'Cargando...' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className={`animate-spin rounded-full border-4 border-gray-200 border-t-current ${sizeClasses[size]} ${color}`}></div>
      {text && (
        <p className={`mt-2 text-sm text-gray-600 ${color}`}>
          {text}
        </p>
      )}
    </div>
  );
}

export default LoadingSpinner;
