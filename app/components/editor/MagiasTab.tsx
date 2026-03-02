'use client';

import type { Character, AtributoEnum } from '@/app/lib/schema';
import { ATRIBUTOS_LIST } from '@/app/lib/schema';
import SectionCard from './SectionCard';

interface MagiasTabProps {
  character: Character;
  onChange: (patch: Partial<Character>) => void;
  onDeep: (path: string, value: unknown) => void;
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-[11px] font-medium uppercase tracking-wide text-slate-400">{children}</label>;
}

function TextInput({
  value,
  onChange,
  placeholder,
  className = '',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full rounded border border-slate-600 bg-slate-900 px-2 py-1.5 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500 ${className}`}
    />
  );
}

export default function MagiasTab({ character, onChange, onDeep }: MagiasTabProps) {
  const { magias, magia } = character;

  const addMagia = () => {
    onChange({
      magias: [
        ...magias,
        { nome: '', escola: '', execucao: '', alcance: '', area: '', duracao: '', resistencia: '', efeito: '' },
      ],
    });
  };

  const setMagia = (idx: number, field: string, value: string) => {
    const updated = [...magias];
    updated[idx] = { ...updated[idx], [field]: value };
    onChange({ magias: updated });
  };

  const removeMagia = (idx: number) => {
    onChange({ magias: magias.filter((_, i) => i !== idx) });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Spellcasting header */}
      <SectionCard title="Habilidade Mágica">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <Label>Atributo-Chave</Label>
            <select
              value={magia.atributoChave}
              onChange={(e) => onDeep('magia.atributoChave', e.target.value as AtributoEnum)}
              className="w-full rounded border border-slate-600 bg-slate-900 px-2 py-1.5 text-sm text-white outline-none focus:border-amber-500"
            >
              {ATRIBUTOS_LIST.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Mod Atributo</Label>
            <div className="flex h-[34px] items-center rounded bg-slate-700 px-2 text-sm text-slate-300">
              {magia.modAtributoChave >= 0 ? '+' : ''}{magia.modAtributoChave}
            </div>
          </div>
          <div>
            <Label>CD Resistência</Label>
            <div className="flex h-[34px] items-center justify-center rounded bg-amber-500/20 text-lg font-bold text-amber-400">
              {character.testeResistenciaMagia}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Spell list */}
      <SectionCard title="Lista de Magias">
        {magias.length === 0 && (
          <p className="text-xs text-slate-500">Nenhuma magia registrada.</p>
        )}
        {magias.map((m, i) => (
          <div key={i} className="mb-3 rounded border border-slate-700 bg-slate-900/50 p-3">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="sm:col-span-2">
                <Label>Nome</Label>
                <TextInput value={m.nome} onChange={(v) => setMagia(i, 'nome', v)} placeholder="Nome da magia" />
              </div>
              <div>
                <Label>Escola</Label>
                <TextInput value={m.escola} onChange={(v) => setMagia(i, 'escola', v)} />
              </div>
              <div>
                <Label>Execução</Label>
                <TextInput value={m.execucao} onChange={(v) => setMagia(i, 'execucao', v)} />
              </div>
              <div>
                <Label>Alcance</Label>
                <TextInput value={m.alcance} onChange={(v) => setMagia(i, 'alcance', v)} />
              </div>
              <div>
                <Label>Área</Label>
                <TextInput value={m.area} onChange={(v) => setMagia(i, 'area', v)} />
              </div>
              <div>
                <Label>Duração</Label>
                <TextInput value={m.duracao} onChange={(v) => setMagia(i, 'duracao', v)} />
              </div>
              <div>
                <Label>Resistência</Label>
                <TextInput value={m.resistencia} onChange={(v) => setMagia(i, 'resistencia', v)} />
              </div>
            </div>
            <div className="mt-2">
              <Label>Efeito</Label>
              <textarea
                value={m.efeito}
                onChange={(e) => setMagia(i, 'efeito', e.target.value)}
                rows={2}
                className="w-full resize-y rounded border border-slate-600 bg-slate-900 px-2 py-1.5 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500"
                placeholder="Descrição do efeito..."
              />
            </div>
            <button
              onClick={() => removeMagia(i)}
              className="mt-1 text-xs text-red-400 hover:text-red-300"
            >
              Remover magia
            </button>
          </div>
        ))}
        <button onClick={addMagia} className="text-xs font-medium text-amber-400 hover:text-amber-300">
          + Adicionar magia
        </button>
      </SectionCard>
    </div>
  );
}
