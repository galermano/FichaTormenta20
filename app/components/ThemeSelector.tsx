'use client';

import { useState, useRef, useEffect } from 'react';
import { THEME_PRESETS } from '@/app/lib/themes';
import { useTheme } from './ThemeProvider';

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg border border-slate-600 bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-accent-500 hover:text-accent-400"
        title="Personalizar cor"
      >
        <span
          className="h-3.5 w-3.5 rounded-full border border-slate-500"
          style={{ backgroundColor: theme.colors[500] }}
        />
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-slate-700 bg-slate-800 p-3 shadow-xl">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-slate-500">Tema de Cor</p>
          <div className="grid grid-cols-4 gap-2">
            {THEME_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => { setTheme(preset.id); setOpen(false); }}
                title={preset.name}
                className={`group flex flex-col items-center gap-1 rounded-lg p-1.5 transition-colors ${
                  theme.id === preset.id ? 'bg-slate-700' : 'hover:bg-slate-700/50'
                }`}
              >
                <span
                  className={`h-6 w-6 rounded-full border-2 transition-transform group-hover:scale-110 ${
                    theme.id === preset.id ? 'border-white scale-110' : 'border-slate-600'
                  }`}
                  style={{ backgroundColor: preset.colors[500] }}
                />
                <span className="text-[9px] text-slate-400">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
