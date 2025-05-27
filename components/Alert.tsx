
import React from 'react';

interface AlertProps {
  type: 'error' | 'warning' | 'info' | 'success';
  title?: string;
  children: React.ReactNode;
}

const Alert: React.FC<AlertProps> = ({ type, title, children }) => {
  const baseClasses = "p-4 rounded-lg shadow-md border-l-4";
  const typeClasses = {
    error: "bg-red-100 border-red-500 text-red-700",
    warning: "bg-yellow-100 border-yellow-500 text-yellow-700",
    info: "bg-blue-100 border-blue-500 text-blue-700",
    success: "bg-green-100 border-green-500 text-green-700",
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`} role="alert">
      {title && <h4 className="font-bold mb-1">{title}</h4>}
      <p className="text-sm">{children}</p>
    </div>
  );
};

export default Alert;
    