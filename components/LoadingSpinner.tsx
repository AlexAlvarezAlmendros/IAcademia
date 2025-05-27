
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: string;
  inline?: boolean;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', color = 'border-indigo-500', inline = false, className = '' }) => {
  const sizeClasses = {
    xs: 'h-3 w-3 border-2',
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-4',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div className={`${inline ? 'inline-flex' : 'flex'} justify-center items-center ${className}`}>
      <div
        className={`animate-spin rounded-full ${sizeClasses[size]} ${color} border-t-transparent`}
      ></div>
    </div>
  );
};

export default LoadingSpinner;
    