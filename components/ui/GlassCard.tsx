import React, { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  action?: ReactNode;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', title, action }) => {
  return (
    <div className={`bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl overflow-hidden ${className}`}>
      {(title || action) && (
        <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5">
          {title && <h3 className="text-lg font-semibold text-white tracking-wide">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};