'use client';

import { useState } from 'react';
import type { Character, AtributoEnum } from '@/app/lib/schema';
import { ATRIBUTOS_LIST, ATRIBUTO_NAMES, TAMANHOS, PERICIAS_DEFAULT } from '@/app/lib/schema';
import { generateAttributes, buildSkillCheckExpr, buildAttackRollExpr, type AttrGenResult } from '@/app/lib/dice';
import DiceButton from '@/app/components/DiceButton';
import SectionCard from './SectionCard';

interface FichaTabProps {
  character: Character;
  onChange: (patch: Partial<Character>) => void;
  onDeep: (path: string, value: unknown) => void;
}

// Helper: controlled number input that allows empty string while editing
function NumInput({
  value,
  onChange,
  className = '',
  min,
}: {
  value: number;
  onChange: (v: number) => void;
  className?: string;
  min?: number;
}) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
      className={`w-full rounded border border-slate-600 bg-slate-900 px-2 py-1 text-sm text-white outline-none focus:border-amber-500 ${className}`}
    />
  );
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

function Label({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <label className={`block text-[11px] font-medium uppercase tracking-wide text-slate-400 ${className}`}>{children}</label>;
}

// ---- Attribute Generation Modal ----
function AttrGenModal({
  open,
  onClose,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  onApply: (values: number[]) => void;
}) {
  const [results, setResults] = useState<AttrGenResult[] | null>(null);

  const handleRoll = () => {
    setResults(generateAttributes());
  };

  const handleApply = () => {
    if (!results) return;
    onApply(results.map((r) => r.total));
    onClose();
    setResults(null);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-xl border border-slate-700 bg-slate-800 p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-white">Gerar Atributos</h3>
        <p className="mt-1 text-xs text-slate-400">
          Método: <strong className="text-amber-400">4d6</strong> descartando o menor dado para cada atributo (padrão Tormenta20).
        </p>

        <div className="mt-4 flex justify-center">
          <button
            onClick={handleRoll}
            className="rounded-lg bg-amber-600 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-amber-500"
          >
            {results ? 'Rolar Novamente' : 'Rolar 4d6 (6x)'}
          </button>
        </div>

        {results && (
          <div className="mt-5 space-y-2">
            {ATRIBUTOS_LIST.map((attr, i) => {
              const r = results[i];
              return (
                <div key={attr} className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2">
                  <div className="w-12">
                    <span className="text-xs font-bold text-amber-400">{attr}</span>
                    <p className="text-[9px] text-slate-500">{ATRIBUTO_NAMES[attr]}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {r.dice.map((d, di) => {
                      const isDropped = d === r.dropped && di === r.dice.indexOf(r.dropped);
                      // Find the first occurrence of the dropped die
                      const droppedIdx = r.dice.indexOf(r.dropped);
                      const isThisDropped = d === r.dropped && di === droppedIdx;
                      return (
                        <span
                          key={di}
                          className={`inline-flex h-7 w-7 items-center justify-center rounded text-xs font-semibold ${
                            isThisDropped
                              ? 'bg-red-500/20 text-red-400 line-through'
                              : 'bg-slate-700 text-slate-200'
                          }`}
                        >
                          {d}
                        </span>
                      );
                    })}
                  </div>
                  <span className="ml-auto text-lg font-extrabold text-white">{r.total}</span>
                </div>
              );
            })}
            <p className="text-center text-[10px] text-slate-500">
              Total: {results.reduce((s, r) => s + r.total, 0)} pontos
            </p>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => { onClose(); setResults(null); }}
            className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700"
          >
            Cancelar
          </button>
          <button
            onClick={handleApply}
            disabled={!results}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Aplicar na Ficha
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FichaTab({ character, onChange, onDeep }: FichaTabProps) {
  const { personagem, atributos, pv, pm, defesa, pericias, ataques, equipamento } = character;
  const [showAttrGen, setShowAttrGen] = useState(false);

  // -- Helpers to update nested objects --
  const setPersonagem = (field: string, value: unknown) => {
    onDeep(`personagem.${field}`, value);
  };

  const setClasse = (idx: number, field: string, value: unknown) => {
    const updated = [...personagem.classes];
    updated[idx] = { ...updated[idx], [field]: value };
    setPersonagem('classes', updated);
  };

  const addClasse = () => {
    setPersonagem('classes', [...personagem.classes, { nome: '', nivel: 1 }]);
  };

  const removeClasse = (idx: number) => {
    if (personagem.classes.length <= 1) return;
    setPersonagem('classes', personagem.classes.filter((_, i) => i !== idx));
  };

  const setAtributo = (attr: AtributoEnum, value: number) => {
    onDeep(`atributos.${attr}.valorBase`, value);
  };

  const setDefesa = (field: string, value: unknown) => {
    onDeep(`defesa.${field}`, value);
  };

  const setPericia = (nome: string, field: string, value: unknown) => {
    onDeep(`pericias.${nome}.${field}`, value);
  };

  // Apply generated attributes
  const handleApplyGenerated = (values: number[]) => {
    ATRIBUTOS_LIST.forEach((attr, i) => {
      onDeep(`atributos.${attr}.valorBase`, values[i]);
    });
  };

  // -- Attacks --
  const addAtaque = () => {
    onChange({
      ataques: [...ataques, { nome: '', bonusTesteAtaque: '', dano: '', critico: '', tipo: '', alcance: '' }],
    });
  };

  const setAtaque = (idx: number, field: string, value: string) => {
    const updated = [...ataques];
    updated[idx] = { ...updated[idx], [field]: value };
    onChange({ ataques: updated });
  };

  const removeAtaque = (idx: number) => {
    onChange({ ataques: ataques.filter((_, i) => i !== idx) });
  };

  // -- Equipment --
  const addItem = () => {
    onDeep('equipamento.itens', [...equipamento.itens, { nome: '', qtdSlots: 1 }]);
  };

  const setItem = (idx: number, field: string, value: unknown) => {
    const updated = [...equipamento.itens];
    updated[idx] = { ...updated[idx], [field]: value };
    onDeep('equipamento.itens', updated);
  };

  const removeItem = (idx: number) => {
    onDeep('equipamento.itens', equipamento.itens.filter((_, i) => i !== idx));
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* === LEFT COLUMN === */}
      <div className="flex flex-col gap-4">
        {/* Identity */}
        <SectionCard title="Identidade">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Nome do Personagem</Label>
              <TextInput value={personagem.nome} onChange={(v) => setPersonagem('nome', v)} placeholder="Nome" />
            </div>
            <div>
              <Label>Jogador</Label>
              <TextInput value={personagem.jogador} onChange={(v) => setPersonagem('jogador', v)} placeholder="Jogador" />
            </div>
            <div>
              <Label>Raça</Label>
              <TextInput value={personagem.raca} onChange={(v) => setPersonagem('raca', v)} placeholder="Raça" />
            </div>
            <div>
              <Label>Origem</Label>
              <TextInput value={personagem.origem} onChange={(v) => setPersonagem('origem', v)} placeholder="Origem" />
            </div>
            <div>
              <Label>Divindade</Label>
              <TextInput value={personagem.divindade} onChange={(v) => setPersonagem('divindade', v)} placeholder="Divindade" />
            </div>
            <div>
              <Label>Tamanho</Label>
              <select
                value={character.tamanho}
                onChange={(e) => onChange({ tamanho: e.target.value as Character['tamanho'] })}
                className="w-full rounded border border-slate-600 bg-slate-900 px-2 py-1.5 text-sm text-white outline-none focus:border-amber-500"
              >
                {TAMANHOS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          {/* Classes */}
          <div className="mt-3">
            <Label>Classes</Label>
            {personagem.classes.map((cl, i) => (
              <div key={i} className="mt-1.5 flex gap-2">
                <TextInput
                  value={cl.nome}
                  onChange={(v) => setClasse(i, 'nome', v)}
                  placeholder="Classe"
                  className="flex-1"
                />
                <NumInput value={cl.nivel} onChange={(v) => setClasse(i, 'nivel', v)} className="w-16" min={1} />
                {personagem.classes.length > 1 && (
                  <button
                    onClick={() => removeClasse(i)}
                    className="rounded px-2 text-xs text-red-400 hover:bg-red-400/10"
                    title="Remover classe"
                  >
                    &times;
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addClasse}
              className="mt-2 text-xs font-medium text-amber-400 hover:text-amber-300"
            >
              + Adicionar classe
            </button>
          </div>
        </SectionCard>

        {/* Attributes */}
        <SectionCard title="Atributos">
          <div className="mb-3 flex items-center justify-end">
            <button
              onClick={() => setShowAttrGen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-400 transition-colors hover:bg-amber-500/20"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <rect x="2" y="2" width="20" height="20" rx="3" />
                <circle cx="8" cy="8" r="1.2" fill="currentColor" stroke="none" />
                <circle cx="16" cy="8" r="1.2" fill="currentColor" stroke="none" />
                <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
                <circle cx="8" cy="16" r="1.2" fill="currentColor" stroke="none" />
                <circle cx="16" cy="16" r="1.2" fill="currentColor" stroke="none" />
              </svg>
              Rolar 4d6 (Gerar Atributos)
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {ATRIBUTOS_LIST.map((attr) => (
              <div key={attr} className="text-center">
                <Label className="text-center">{attr}</Label>
                <p className="text-[10px] text-slate-500">{ATRIBUTO_NAMES[attr]}</p>
                <NumInput
                  value={atributos[attr].valorBase}
                  onChange={(v) => setAtributo(attr, v)}
                  className="mt-1 text-center"
                />
                <div className="mt-1 flex h-8 items-center justify-center gap-1 rounded bg-slate-700 text-sm font-bold text-amber-400">
                  <span>{atributos[attr].modificador >= 0 ? '+' : ''}{atributos[attr].modificador}</span>
                  <DiceButton
                    expression={`1d20${atributos[attr].modificador >= 0 ? '+' : ''}${atributos[attr].modificador}`}
                    label={`Teste de ${ATRIBUTO_NAMES[attr]}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* PV / PM / Movement */}
        <SectionCard title="Pontos de Vida, Mana e Movimento">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <Label>PV Máx</Label>
              <NumInput value={pv.max} onChange={(v) => onDeep('pv.max', v)} />
            </div>
            <div>
              <Label>PV Atual</Label>
              <NumInput value={pv.atual} onChange={(v) => onDeep('pv.atual', v)} />
            </div>
            <div>
              <Label>PM Máx</Label>
              <NumInput value={pm.max} onChange={(v) => onDeep('pm.max', v)} />
            </div>
            <div>
              <Label>PM Atual</Label>
              <NumInput value={pm.atual} onChange={(v) => onDeep('pm.atual', v)} />
            </div>
            <div>
              <Label>Deslocamento</Label>
              <NumInput value={character.deslocamento} onChange={(v) => onChange({ deslocamento: v })} />
            </div>
            <div>
              <Label>Experiência</Label>
              <NumInput value={character.experiencia} onChange={(v) => onChange({ experiencia: v })} min={0} />
            </div>
          </div>
        </SectionCard>

        {/* Defense */}
        <SectionCard title="Defesa">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <Label>Base (CA)</Label>
              <NumInput value={defesa.baseCA} onChange={(v) => setDefesa('baseCA', v)} />
            </div>
            <div>
              <Label>Atributo</Label>
              <select
                value={defesa.atributoDefesa}
                onChange={(e) => setDefesa('atributoDefesa', e.target.value)}
                className="w-full rounded border border-slate-600 bg-slate-900 px-2 py-1 text-sm text-white outline-none focus:border-amber-500"
              >
                {ATRIBUTOS_LIST.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Mod Atributo</Label>
              <div className="flex h-[30px] items-center rounded bg-slate-700 px-2 text-sm text-slate-300">
                {defesa.modAtributoDefesa >= 0 ? '+' : ''}{defesa.modAtributoDefesa}
              </div>
            </div>
            <div>
              <Label>Armadura</Label>
              <NumInput value={defesa.bonusArmadura} onChange={(v) => setDefesa('bonusArmadura', v)} />
            </div>
            <div>
              <Label>Escudo</Label>
              <NumInput value={defesa.bonusEscudo} onChange={(v) => setDefesa('bonusEscudo', v)} />
            </div>
            <div>
              <Label>Outros</Label>
              <NumInput value={defesa.outrosBonus} onChange={(v) => setDefesa('outrosBonus', v)} />
            </div>
            <div>
              <Label>Penalidade</Label>
              <NumInput value={defesa.penalidadeTotalArmadura} onChange={(v) => setDefesa('penalidadeTotalArmadura', v)} />
            </div>
            <div>
              <Label>Total</Label>
              <div className="flex h-[30px] items-center justify-center rounded bg-amber-500/20 px-2 text-lg font-bold text-amber-400">
                {defesa.total}
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Attacks */}
        <SectionCard title="Ataques">
          {ataques.length === 0 && (
            <p className="text-xs text-slate-500">Nenhum ataque registrado.</p>
          )}
          {ataques.map((atk, i) => (
            <div key={i} className="mb-3 rounded border border-slate-700 bg-slate-900/50 p-2">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <div>
                  <Label>Nome</Label>
                  <TextInput value={atk.nome} onChange={(v) => setAtaque(i, 'nome', v)} />
                </div>
                <div>
                  <Label>Teste Ataque</Label>
                  <div className="flex gap-1">
                    <TextInput value={atk.bonusTesteAtaque} onChange={(v) => setAtaque(i, 'bonusTesteAtaque', v)} className="flex-1" />
                    <DiceButton
                      expression={buildAttackRollExpr(atk.bonusTesteAtaque)}
                      label={`${atk.nome || 'Ataque'} - Teste`}
                      size="sm"
                    />
                  </div>
                </div>
                <div>
                  <Label>Dano</Label>
                  <div className="flex gap-1">
                    <TextInput value={atk.dano} onChange={(v) => setAtaque(i, 'dano', v)} className="flex-1" />
                    {atk.dano && (
                      <DiceButton
                        expression={atk.dano}
                        label={`${atk.nome || 'Ataque'} - Dano`}
                        size="sm"
                      />
                    )}
                  </div>
                </div>
                <div>
                  <Label>Crítico</Label>
                  <TextInput value={atk.critico} onChange={(v) => setAtaque(i, 'critico', v)} />
                </div>
                <div>
                  <Label>Tipo</Label>
                  <TextInput value={atk.tipo} onChange={(v) => setAtaque(i, 'tipo', v)} />
                </div>
                <div>
                  <Label>Alcance</Label>
                  <TextInput value={atk.alcance} onChange={(v) => setAtaque(i, 'alcance', v)} />
                </div>
              </div>
              <button
                onClick={() => removeAtaque(i)}
                className="mt-1 text-xs text-red-400 hover:text-red-300"
              >
                Remover ataque
              </button>
            </div>
          ))}
          <button onClick={addAtaque} className="text-xs font-medium text-amber-400 hover:text-amber-300">
            + Adicionar ataque
          </button>
        </SectionCard>
      </div>

      {/* === RIGHT COLUMN === */}
      <div className="flex flex-col gap-4">
        {/* Skills */}
        <SectionCard title="Perícias">
          <div className="max-h-[600px] overflow-y-auto pr-1">
            <div className="mb-1 grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-x-2 text-[10px] font-medium uppercase text-slate-500">
              <span>Perícia</span>
              <span className="w-8 text-center">Tr</span>
              <span className="w-10 text-center">Attr</span>
              <span className="w-12 text-center">Out</span>
              <span className="w-10 text-center">Tot</span>
              <span className="w-5"></span>
            </div>
            {PERICIAS_DEFAULT.map(({ nome }) => {
              const p = pericias[nome];
              if (!p) return null;
              return (
                <div key={nome} className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] items-center gap-x-2 border-t border-slate-700/50 py-1">
                  <span className="truncate text-xs text-slate-300">{nome}</span>
                  <input
                    type="checkbox"
                    checked={p.treinado}
                    onChange={(e) => setPericia(nome, 'treinado', e.target.checked)}
                    className="h-3.5 w-8 accent-amber-500"
                  />
                  <span className="w-10 text-center text-xs text-slate-400">{p.atributo}</span>
                  <input
                    type="number"
                    value={p.outros}
                    onChange={(e) => setPericia(nome, 'outros', e.target.value === '' ? 0 : Number(e.target.value))}
                    className="w-12 rounded border border-slate-600 bg-slate-900 px-1 py-0.5 text-center text-xs text-white outline-none focus:border-amber-500"
                  />
                  <span className={`w-10 text-center text-xs font-semibold ${p.total >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {p.total >= 0 ? '+' : ''}{p.total}
                  </span>
                  <DiceButton
                    expression={buildSkillCheckExpr(p.total)}
                    label={nome}
                  />
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* Equipment */}
        <SectionCard title="Equipamento">
          <div className="mb-2 grid grid-cols-3 gap-2 text-xs">
            <div>
              <Label>Carga Usada</Label>
              <NumInput value={character.carga.usada} onChange={(v) => onDeep('carga.usada', v)} />
            </div>
            <div>
              <Label>Limite Carga</Label>
              <div className="flex h-[30px] items-center rounded bg-slate-700 px-2 text-sm text-slate-300">
                {character.carga.limite}
              </div>
            </div>
            <div>
              <Label>T$ (Dinheiro)</Label>
              <NumInput value={character.dinheiro} onChange={(v) => onChange({ dinheiro: v })} min={0} />
            </div>
          </div>
          {equipamento.itens.map((item, i) => (
            <div key={i} className="mt-1.5 flex gap-2">
              <TextInput
                value={item.nome}
                onChange={(v) => setItem(i, 'nome', v)}
                placeholder="Item"
                className="flex-1"
              />
              <NumInput
                value={item.qtdSlots}
                onChange={(v) => setItem(i, 'qtdSlots', v)}
                className="w-14"
                min={0}
              />
              <button
                onClick={() => removeItem(i)}
                className="rounded px-2 text-xs text-red-400 hover:bg-red-400/10"
              >
                &times;
              </button>
            </div>
          ))}
          <button onClick={addItem} className="mt-2 text-xs font-medium text-amber-400 hover:text-amber-300">
            + Adicionar item
          </button>
        </SectionCard>

        {/* Proficiencies */}
        <SectionCard title="Proficiências e Características">
          <textarea
            value={character.proficienciasECaracteristicas}
            onChange={(e) => onChange({ proficienciasECaracteristicas: e.target.value })}
            rows={5}
            className="w-full resize-y rounded border border-slate-600 bg-slate-900 px-2 py-1.5 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500"
            placeholder="Proficiências com armas, armaduras, características de raça, classe..."
          />
        </SectionCard>
      </div>

      {/* Attribute Generation Modal */}
      <AttrGenModal
        open={showAttrGen}
        onClose={() => setShowAttrGen(false)}
        onApply={handleApplyGenerated}
      />
    </div>
  );
}
