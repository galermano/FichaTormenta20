'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Character } from '@/app/lib/schema';
import { recalculate } from '@/app/lib/compute';
import { getCharacter, saveCharacter, deleteCharacter, duplicateCharacter } from '@/app/lib/storage';
import { exportCharacterToJson, importCharacterFromJson } from '@/app/lib/importExport';
import ConfirmDialog from '@/app/components/ConfirmDialog';
import DiceRoller, { DiceRollerToggle } from '@/app/components/DiceRoller';
import FichaTab from '@/app/components/editor/FichaTab';
import DetalhesTab from '@/app/components/editor/DetalhesTab';
import MagiasTab from '@/app/components/editor/MagiasTab';
import NotasTab from '@/app/components/editor/NotasTab';

type TabKey = 'ficha' | 'detalhes' | 'magias' | 'notas';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'ficha', label: 'Ficha' },
  { key: 'detalhes', label: 'Detalhes' },
  { key: 'magias', label: 'Magias' },
  { key: 'notas', label: 'Notas' },
];

/** Set a deeply nested value by dot-path on a cloned object */
function setDeepValue<T>(obj: T, path: string, value: unknown): T {
  const clone = JSON.parse(JSON.stringify(obj)) as Record<string, unknown>;
  const keys = path.split('.');
  let current: Record<string, unknown> = clone;
  for (let i = 0; i < keys.length - 1; i++) {
    if (current[keys[i]] === undefined || current[keys[i]] === null) {
      current[keys[i]] = {};
    }
    current = current[keys[i]] as Record<string, unknown>;
  }
  current[keys[keys.length - 1]] = value;
  return clone as T;
}

export default function CharacterEditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [character, setCharacter] = useState<Character | null>(null);
  const [tab, setTab] = useState<TabKey>('ficha');
  const [mounted, setMounted] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDiceRoller, setShowDiceRoller] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load character
  useEffect(() => {
    const c = getCharacter(id);
    if (c) {
      setCharacter(recalculate(c));
    }
    setMounted(true);
  }, [id]);

  // Debounced autosave
  const autosave = useCallback(
    (updated: Character) => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      setSaveStatus('saving');
      saveTimeoutRef.current = setTimeout(() => {
        saveCharacter(updated);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 1500);
      }, 400);
    },
    [],
  );

  // Shallow merge update
  const handleChange = useCallback(
    (patch: Partial<Character>) => {
      setCharacter((prev) => {
        if (!prev) return prev;
        const updated = recalculate({ ...prev, ...patch });
        autosave(updated);
        return updated;
      });
    },
    [autosave],
  );

  // Deep path update
  const handleDeep = useCallback(
    (path: string, value: unknown) => {
      setCharacter((prev) => {
        if (!prev) return prev;
        const updated = recalculate(setDeepValue(prev, path, value));
        autosave(updated);
        return updated;
      });
    },
    [autosave],
  );

  const handleExport = () => {
    if (character) exportCharacterToJson(character);
  };

  const handleDuplicate = () => {
    if (!character) return;
    const dup = duplicateCharacter(character);
    router.push(`/characters/${dup.id}`);
  };

  const handleDelete = () => {
    deleteCharacter(id);
    router.push('/');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importCharacterFromJson(file);
      // Replace current character's data but keep the same ID
      const merged = recalculate({ ...imported, id });
      saveCharacter(merged);
      setCharacter(merged);
    } catch (err) {
      alert((err as Error).message);
    }
    e.target.value = '';
  };

  if (!mounted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
      </div>
    );
  }

  if (!character) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-slate-400">Personagem não encontrado.</p>
        <Link href="/" className="text-sm text-amber-400 hover:text-amber-300">
          Voltar para lista
        </Link>
      </div>
    );
  }

  const nome = character.personagem.nome || 'Sem Nome';
  const nivelTotal = character.personagem.classes.reduce((s, c) => s + (c.nivel || 0), 0);

  return (
    <div className={`mx-auto max-w-7xl px-4 py-6 ${showDiceRoller ? 'sm:mr-96' : ''} transition-all`}>
      {/* Top bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-600 text-slate-400 transition-colors hover:border-amber-500 hover:text-amber-400"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-white sm:text-2xl">{nome}</h1>
            <p className="text-xs text-slate-400">
              Nível {nivelTotal}
              {character.personagem.raca && ` \u2022 ${character.personagem.raca}`}
              {character.personagem.classes.filter((c) => c.nome).length > 0 &&
                ` \u2022 ${character.personagem.classes.filter((c) => c.nome).map((c) => c.nome).join('/')}`}
            </p>
          </div>
          {saveStatus === 'saving' && (
            <span className="ml-2 rounded bg-slate-700 px-2 py-0.5 text-[10px] text-slate-400">Salvando...</span>
          )}
          {saveStatus === 'saved' && (
            <span className="ml-2 rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-400">Salvo</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-amber-500 hover:text-amber-400"
          >
            Importar JSON
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          <button
            onClick={handleExport}
            className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-amber-500 hover:text-amber-400"
          >
            Exportar JSON
          </button>
          <button
            onClick={handleDuplicate}
            className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-amber-500 hover:text-amber-400"
          >
            Duplicar
          </button>
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="rounded-lg border border-red-800/50 bg-red-900/30 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-900/50"
          >
            Excluir
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-slate-700">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
              tab === t.key
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'ficha' && <FichaTab character={character} onChange={handleChange} onDeep={handleDeep} />}
      {tab === 'detalhes' && <DetalhesTab character={character} onChange={handleChange} onDeep={handleDeep} />}
      {tab === 'magias' && <MagiasTab character={character} onChange={handleChange} onDeep={handleDeep} />}
      {tab === 'notas' && <NotasTab character={character} onChange={handleChange} />}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={showDeleteDialog}
        title="Excluir Personagem"
        message={`Tem certeza que deseja excluir "${nome}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        danger
      />

      {/* Dice Roller */}
      <DiceRoller open={showDiceRoller} onClose={() => setShowDiceRoller(false)} />
      {!showDiceRoller && <DiceRollerToggle onClick={() => setShowDiceRoller(true)} />}
    </div>
  );
}
