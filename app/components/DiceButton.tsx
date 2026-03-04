'use client';

import { useState } from 'react';
import { rollAndRecord, type DiceRollResult } from '@/app/lib/dice';

interface DiceButtonProps {
  expression: string;
  label?: string;
  size?: 'sm' | 'xs';
  className?: string;
}

/**
 * Small inline button that rolls dice and shows a brief tooltip with the result.
 * Used next to attack rows, skill rows, etc.
 */
export default function DiceButton({ expression, label, size = 'xs', className = '' }: DiceButtonProps) {
  const [result, setResult] = useState<DiceRollResult | null>(null);
  const [visible, setVisible] = useState(false);

  const handleClick = () => {
    try {
      const r = rollAndRecord(expression, label);
      setResult(r);
      setVisible(true);
      setTimeout(() => setVisible(false), 2500);
    } catch {
      // ignore invalid expression
    }
  };

  const sizeClasses = size === 'sm'
    ? 'h-7 w-7 text-xs'
    : 'h-5 w-5 text-[10px]';

  return (
    <span className={`relative inline-flex ${className}`}>
      <button
        type="button"
        onClick={handleClick}
        title={`Rolar ${expression}${label ? ` (${label})` : ''}`}
        className={`inline-flex items-center justify-center rounded border border-slate-600 bg-slate-800 font-bold text-accent-400 transition-all hover:border-accent-500 hover:bg-slate-700 active:scale-90 ${sizeClasses}`}
      >
        <svg className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-3 w-3'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="3" />
          <circle cx="8" cy="8" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="16" cy="16" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      </button>
      {/* Tooltip with result */}
      {visible && result && (
        <span
          className={`absolute bottom-full left-1/2 z-50 mb-1 -translate-x-1/2 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-bold shadow-lg ${
            result.isCritical
              ? 'bg-accent-500 text-slate-900'
              : result.isFumble
                ? 'bg-red-600 text-white'
                : 'bg-slate-700 text-white'
          }`}
        >
          <span className="text-sm">{result.total}</span>
          <span className="ml-1.5 text-[10px] font-normal opacity-80">
            [{result.dice.map((d) => Math.abs(d.result)).join(', ')}]
            {result.modifier !== 0 && (
              <>{result.modifier > 0 ? '+' : ''}{result.modifier}</>
            )}
          </span>
          {result.isCritical && <span className="ml-1">CRIT!</span>}
          {result.isFumble && <span className="ml-1">FALHA!</span>}
          {/* Arrow */}
          <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-slate-700" />
        </span>
      )}
    </span>
  );
}
