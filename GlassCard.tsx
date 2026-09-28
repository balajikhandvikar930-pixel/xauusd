import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function GlassCard({ children, className = '', onClick }: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg shadow-black/20 ${className}`}
    >
      {children}
    </div>
  );
}
