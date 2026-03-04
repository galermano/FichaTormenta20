'use client';

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import {
  T20_QUICK_ROLLS,
  rollAndRecord,
  getRollHistory,
  clearHistory,
  subscribeHistory,
  type DiceRollResult,
  type QuickRoll,
} from '@/app/lib/dice';

// ---- Hook to subscribe to roll history ----
function useRollHistory(): DiceRollResult[] {
  return useSyncExternalStore(subscribeHistory, getRollHistory, getRollHistory);
}

// ---- Category tabs ----
type Category = 'teste' | 'dano' | 'ataque' | 'outros';
const CATEGORIES: { key: Category; label: string }[] = [
  { key: 'teste', label: 'Testes' },
  { key: 'ataque', label: 'Ataque' },
  { key: 'dano', label: 'Dano' },
  { key: 'outros', label: 'Outros' },
];

// ---- Dice icon SVG ----
function DiceIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="3" />
      <circle cx="8" cy="8" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="16" cy="8" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="8" cy="16" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="16" cy="16" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

// ---- Format timestamp ----
function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// ---- Single roll result display ----
function RollResultCard({ result }: { result: DiceRollResult }) {
  const isCrit = result.isCritical;
  const isFumble = result.isFumble;

  return (
    <div
      className={`rounded-lg border p-2.5 transition-colors ${
        isCrit
          ? 'border-accent-500/60 bg-accent-500/10'
          : isFumble
            ? 'border-red-500/60 bg-red-500/10'
            : 'border-slate-700 bg-slate-800/80'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          {result.label && (
            <p className="truncate text-[11px] font-medium text-slate-400">{result.label}</p>
          )}
          <div className="flex items-baseline gap-2">
            <span
              className={`text-xl font-extrabold ${
                isCrit ? 'text-accent-400' : isFumble ? 'text-red-400' : 'text-white'
              }`}
            >
              {result.total}
            </span>
            {isCrit && <span className="text-[10px] font-bold uppercase text-accent-400">Crítico!</span>}
            {isFumble && <span className="text-[10px] font-bold uppercase text-red-400">Falha Crítica!</span>}
          </div>
        </div>
        <span className="whitespace-nowrap text-[10px] text-slate-500">{formatTime(result.timestamp)}</span>
      </div>
      {/* Dice breakdown */}
      <div className="mt-1.5 flex flex-wrap items-center gap-1">
        {result.dice.map((die, i) => {
          const isDropped = result.dropped?.includes(i);
          const isMax = die.result === die.faces;
          const isMin = die.result === 1;
          return (
            <span
              key={i}
              className={`inline-flex h-6 min-w-[24px] items-center justify-center rounded px-1 text-xs font-semibold ${
                isDropped
                  ? 'bg-slate-700 text-slate-500 line-through'
                  : isMax
                    ? 'bg-accent-500/25 text-accent-300'
                    : isMin
                      ? 'bg-red-500/25 text-red-300'
                      : 'bg-slate-700 text-slate-300'
              }`}
              title={`d${die.faces}`}
            >
              {Math.abs(die.result)}
            </span>
          );
        })}
        {result.modifier !== 0 && (
          <span className="text-xs text-slate-400">
            {result.modifier > 0 ? '+' : ''}{result.modifier}
          </span>
        )}
        <span className="ml-auto text-[10px] text-slate-500">{result.expression}</span>
      </div>
    </div>
  );
}

// ---- Main DiceRoller panel ----
interface DiceRollerProps {
  open: boolean;
  onClose: () => void;
}

export default function DiceRoller({ open, onClose }: DiceRollerProps) {
  const history = useRollHistory();
  const [customExpr, setCustomExpr] = useState('');
  const [customLabel, setCustomLabel] = useState('');
  const [category, setCategory] = useState<Category>('teste');
  const [lastResult, setLastResult] = useState<DiceRollResult | null>(null);
  const [shakeKey, setShakeKey] = useState(0);

  const doRoll = useCallback((expression: string, label?: string) => {
    try {
      const result = rollAndRecord(expression, label);
      setLastResult(result);
      setShakeKey((k) => k + 1);
    } catch (err) {
      alert((err as Error).message);
    }
  }, []);

  const handleCustomRoll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customExpr.trim()) return;
    doRoll(customExpr.trim(), customLabel.trim() || undefined);
    setCustomExpr('');
    setCustomLabel('');
  };

  const filteredQuickRolls = T20_QUICK_ROLLS.filter((r) => r.category === category);

  if (!open) return null;

  return (
    <div className="fixed bottom-0 right-0 z-50 flex h-full max-h-[100dvh] w-full flex-col border-l border-slate-700 bg-slate-900 shadow-2xl sm:w-96 sm:max-w-[100vw]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
        <div className="flex items-center gap-2">
          <DiceIcon className="h-5 w-5 text-accent-400" />
          <h2 className="text-sm font-bold text-white">Rolagem de Dados</h2>
        </div>
        <button
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Custom roll form */}
      <div className="border-b border-slate-700 px-4 py-3">
        <form onSubmit={handleCustomRoll} className="flex gap-2">
          <div className="flex flex-1 flex-col gap-1.5">
            <input
              type="text"
              value={customExpr}
              onChange={(e) => setCustomExpr(e.target.value)}
              placeholder="Ex: 2d6+3, 1d20+5, 4d8-2"
              className="w-full rounded border border-slate-600 bg-slate-800 px-2.5 py-1.5 text-sm text-white placeholder-slate-500 outline-none focus:border-accent-500"
            />
            <input
              type="text"
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              placeholder="Descrição (opcional)"
              className="w-full rounded border border-slate-600 bg-slate-800 px-2.5 py-1 text-xs text-white placeholder-slate-500 outline-none focus:border-accent-500"
            />
          </div>
          <button
            type="submit"
            className="self-start rounded-lg bg-accent-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-accent-500"
          >
            Rolar
          </button>
        </form>
      </div>

      {/* Quick roll category tabs */}
      <div className="flex border-b border-slate-700">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setCategory(cat.key)}
            className={`flex-1 py-2 text-xs font-semibold transition-colors ${
              category === cat.key
                ? 'border-b-2 border-accent-400 text-accent-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Quick roll buttons */}
      <div className="flex flex-wrap gap-1.5 border-b border-slate-700 px-4 py-3">
        {filteredQuickRolls.map((qr) => (
          <button
            key={qr.label + qr.expression}
            onClick={() => doRoll(qr.expression, qr.description)}
            title={qr.description}
            className="rounded-lg border border-slate-600 bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:border-accent-500 hover:text-accent-400"
          >
            {qr.label}
          </button>
        ))}
      </div>

      {/* Latest roll highlight */}
      {lastResult && (
        <div key={shakeKey} className="animate-dice-pop border-b border-slate-700 px-4 py-3">
          <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-slate-500">Último resultado</p>
          <RollResultCard result={lastResult} />
        </div>
      )}

      {/* Roll history */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
            Histórico ({history.length})
          </p>
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="text-[10px] text-slate-500 hover:text-red-400"
            >
              Limpar
            </button>
          )}
        </div>
        {history.length === 0 && (
          <p className="py-8 text-center text-xs text-slate-600">
            Nenhuma rolagem ainda. Use os botões acima ou digite uma expressão.
          </p>
        )}
        <div className="flex flex-col gap-1.5">
          {history.map((r) => (
            <RollResultCard key={r.id} result={r} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ---- Floating toggle button (used outside the panel) ----
export function DiceRollerToggle({ onClick, hasNew }: { onClick: () => void; hasNew?: boolean }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent-600 text-white shadow-lg shadow-accent-600/30 transition-all hover:bg-accent-500 hover:scale-105 active:scale-95"
      title="Rolar Dados"
    >
      <DiceIcon className="h-7 w-7" />
      {hasNew && (
        <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-red-500 ring-2 ring-slate-900" />
      )}
    </button>
  );
}
