'use client';

import Link from 'next/link';
import type { Character } from '@/app/lib/schema';

function getInitials(name: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

function getNivelTotal(c: Character): number {
  return c.personagem.classes.reduce((s, cl) => s + (cl.nivel || 0), 0);
}

function getClasseLabel(c: Character): string {
  return c.personagem.classes.filter((cl) => cl.nome).map((cl) => `${cl.nome} ${cl.nivel}`).join(' / ') || 'Sem classe';
}

const AVATAR_COLORS = [
  'from-amber-500 to-orange-600',
  'from-emerald-500 to-teal-600',
  'from-violet-500 to-purple-600',
  'from-rose-500 to-pink-600',
  'from-sky-500 to-blue-600',
  'from-lime-500 to-green-600',
];

function colorForId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function CharacterCard({ character }: { character: Character }) {
  const nome = character.personagem.nome || 'Sem Nome';
  const nivel = getNivelTotal(character);

  return (
    <Link
      href={`/characters/${character.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border-2 border-slate-700 bg-slate-800 transition-all hover:border-amber-500/60 hover:shadow-lg hover:shadow-amber-500/10"
    >
      {/* Avatar area */}
      <div className={`flex h-32 items-center justify-center bg-gradient-to-br ${colorForId(character.id)}`}>
        <span className="text-4xl font-extrabold text-white/90 drop-shadow">{getInitials(nome)}</span>
      </div>
      {/* Info */}
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h3 className="truncate text-base font-bold text-white group-hover:text-amber-400 transition-colors">
          {nome}
        </h3>
        <p className="truncate text-xs text-slate-400">{getClasseLabel(character)}</p>
        <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
          {character.personagem.raca && (
            <span className="rounded-full bg-slate-700 px-2 py-0.5 text-[10px] font-medium text-slate-300">
              {character.personagem.raca}
            </span>
          )}
          <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
            Nível {nivel}
          </span>
          {character.personagem.origem && (
            <span className="rounded-full bg-slate-700 px-2 py-0.5 text-[10px] font-medium text-slate-300">
              {character.personagem.origem}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function NewCharacterCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-600 bg-slate-800/50 p-6 transition-all hover:border-amber-500 hover:bg-slate-800"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 transition-colors group-hover:bg-amber-500/30">
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </div>
      <span className="text-sm font-semibold text-slate-300 group-hover:text-amber-400 transition-colors">
        Novo Personagem
      </span>
    </button>
  );
}
