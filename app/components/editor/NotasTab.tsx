'use client';

import type { Character } from '@/app/lib/schema';
import SectionCard from './SectionCard';

interface NotasTabProps {
  character: Character;
  onChange: (patch: Partial<Character>) => void;
}

export default function NotasTab({ character, onChange }: NotasTabProps) {
  return (
    <div className="flex flex-col gap-4">
      <SectionCard title="Anotações">
        <textarea
          value={character.anotacoes}
          onChange={(e) => onChange({ anotacoes: e.target.value })}
          rows={12}
          className="w-full resize-y rounded border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-accent-500"
          placeholder="Anotações de sessão, lembretes, objetivos..."
        />
      </SectionCard>

      <SectionCard title="Tesouros">
        <textarea
          value={character.tesouros}
          onChange={(e) => onChange({ tesouros: e.target.value })}
          rows={6}
          className="w-full resize-y rounded border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-accent-500"
          placeholder="Tesouros especiais, itens mágicos, relíquias..."
        />
      </SectionCard>
    </div>
  );
}
