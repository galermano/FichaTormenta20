'use client';

import { ReactNode } from 'react';

interface SectionCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export default function SectionCard({ title, children, className = '' }: SectionCardProps) {
  return (
    <div className={`rounded-xl border-2 border-slate-700 bg-slate-800 p-4 ${className}`}>
      <h3 className="mb-3 border-b border-slate-700 pb-2 text-sm font-bold uppercase tracking-wider text-accent-400">
        {title}
      </h3>
      {children}
    </div>
  );
}
