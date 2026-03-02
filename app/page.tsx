'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Character } from '@/app/lib/schema';
import { createDefaultCharacter } from '@/app/lib/schema';
import { recalculate } from '@/app/lib/compute';
import { getAllCharacters, saveCharacter } from '@/app/lib/storage';
import { importCharacterFromJson } from '@/app/lib/importExport';
import CharacterCard, { NewCharacterCard } from '@/app/components/CharacterCard';

type FilterKey = 'all' | 'nivel1-5' | 'nivel6-10' | 'nivel11-15' | 'nivel16-20';

const LEVEL_FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'nivel1-5', label: 'Nível 1-5' },
  { key: 'nivel6-10', label: 'Nível 6-10' },
  { key: 'nivel11-15', label: 'Nível 11-15' },
  { key: 'nivel16-20', label: 'Nível 16-20' },
];

function getNivelTotal(c: Character): number {
  return c.personagem.classes.reduce((s, cl) => s + (cl.nivel || 0), 0);
}

export default function HomePage() {
  const router = useRouter();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCharacters(getAllCharacters());
    setMounted(true);
  }, []);

  const filtered = characters.filter((c) => {
    // Search
    if (search) {
      const q = search.toLowerCase();
      const haystack = [
        c.personagem.nome,
        c.personagem.raca,
        c.personagem.origem,
        ...c.personagem.classes.map((cl) => cl.nome),
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    // Level filter
    if (filter !== 'all') {
      const nivel = getNivelTotal(c);
      if (filter === 'nivel1-5' && (nivel < 1 || nivel > 5)) return false;
      if (filter === 'nivel6-10' && (nivel < 6 || nivel > 10)) return false;
      if (filter === 'nivel11-15' && (nivel < 11 || nivel > 15)) return false;
      if (filter === 'nivel16-20' && (nivel < 16 || nivel > 20)) return false;
    }
    return true;
  });

  const handleNew = useCallback(() => {
    const char = recalculate(createDefaultCharacter());
    saveCharacter(char);
    router.push(`/characters/${char.id}`);
  }, [router]);

  const handleImport = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const char = await importCharacterFromJson(file);
      saveCharacter(char);
      setCharacters(getAllCharacters());
    } catch (err) {
      alert((err as Error).message);
    }
    e.target.value = '';
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Title + Search row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Todos os Personagens
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {characters.length} personagem{characters.length !== 1 ? 's' : ''} salvo{characters.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, classe, raça..."
              className="w-64 rounded-lg border border-slate-600 bg-slate-800 py-2 pl-9 pr-3 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:border-amber-500 hover:text-amber-400"
            title="Importar JSON"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>
      </div>

      {/* Filter chips */}
      <div className="mt-5 flex flex-wrap gap-2">
        {LEVEL_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-colors ${
              filter === f.key
                ? 'bg-amber-500 text-slate-900'
                : 'bg-slate-700/80 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <NewCharacterCard onClick={handleNew} />
        {filtered.map((c) => (
          <CharacterCard key={c.id} character={c} />
        ))}
      </div>

      {filtered.length === 0 && characters.length > 0 && (
        <p className="mt-12 text-center text-sm text-slate-500">Nenhum personagem encontrado com esses filtros.</p>
      )}
    </div>
  );
}
