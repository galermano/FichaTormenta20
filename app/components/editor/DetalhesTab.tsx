'use client';

import type { Character } from '@/app/lib/schema';
import SectionCard from './SectionCard';

interface DetalhesTabProps {
  character: Character;
  onChange: (patch: Partial<Character>) => void;
  onDeep: (path: string, value: unknown) => void;
}

function TextArea({
  value,
  onChange,
  placeholder,
  rows = 6,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      className="w-full resize-y rounded border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-accent-500"
    />
  );
}

export default function DetalhesTab({ character, onChange, onDeep }: DetalhesTabProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="flex flex-col gap-4">
        <SectionCard title="Descrição do Personagem">
          <TextArea
            value={character.descricao}
            onChange={(v) => onChange({ descricao: v })}
            placeholder="Aparência, personalidade, história..."
            rows={8}
          />
        </SectionCard>

        <SectionCard title="Habilidades de Raça e Origem">
          <TextArea
            value={character.habilidades.racaEOrigem}
            onChange={(v) => onDeep('habilidades.racaEOrigem', v)}
            placeholder="Habilidades raciais, poderes de origem..."
            rows={8}
          />
        </SectionCard>
      </div>

      <div className="flex flex-col gap-4">
        <SectionCard title="Habilidades de Classe e Poderes">
          <TextArea
            value={character.habilidades.classeEPoderes}
            onChange={(v) => onDeep('habilidades.classeEPoderes', v)}
            placeholder="Habilidades de classe, poderes concedidos..."
            rows={8}
          />
        </SectionCard>

        <SectionCard title="Histórico, Aliados e Tesouros">
          <TextArea
            value={character.historicoAliadosTesouros}
            onChange={(v) => onChange({ historicoAliadosTesouros: v })}
            placeholder="História de fundo, aliados, tesouros especiais..."
            rows={8}
          />
        </SectionCard>
      </div>
    </div>
  );
}
