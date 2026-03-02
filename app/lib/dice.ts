// ============================================================
// Dice engine for Tormenta20
// Supports NdX+Y notation, multiple dice, attribute generation
// ============================================================

export interface SingleDie {
  faces: number;
  result: number;
}

export interface DiceRollResult {
  id: string;
  expression: string;       // original expression, e.g. "2d6+3"
  label?: string;           // contextual label, e.g. "Espada Longa - Dano"
  dice: SingleDie[];        // individual die results
  modifier: number;         // flat bonus/penalty
  total: number;
  dropped?: number[];       // indices of dropped dice (for 4d6kh3 etc.)
  isCritical?: boolean;     // natural 20 on a d20
  isFumble?: boolean;       // natural 1 on a d20
  timestamp: number;
}

// ---- Core random ----

/** Roll a single die with N faces (1..N) */
export function rollDie(faces: number): number {
  return Math.floor(Math.random() * faces) + 1;
}

// ---- Expression parser ----

export interface ParsedExpression {
  groups: { count: number; faces: number }[];
  modifier: number;
}

/**
 * Parse a dice expression like "2d6+3", "1d20-1", "4d6", "d8", "3d10+2d4+5"
 * Returns structured result for rolling.
 */
export function parseExpression(expr: string): ParsedExpression {
  const cleaned = expr.replace(/\s/g, '').toLowerCase();
  const groups: { count: number; faces: number }[] = [];
  let modifier = 0;

  // Split on + or -, keeping the sign
  const tokens = cleaned.match(/[+-]?[^+-]+/g);
  if (!tokens) throw new Error(`Expressão inválida: "${expr}"`);

  for (const token of tokens) {
    const diceMatch = token.match(/^([+-]?)(\d*)d(\d+)$/);
    if (diceMatch) {
      const sign = diceMatch[1] === '-' ? -1 : 1;
      const count = (diceMatch[2] ? parseInt(diceMatch[2], 10) : 1) * sign;
      const faces = parseInt(diceMatch[3], 10);
      if (faces < 1 || Math.abs(count) > 100) throw new Error(`Dado inválido: "${token}"`);
      groups.push({ count, faces });
    } else {
      const num = parseInt(token, 10);
      if (isNaN(num)) throw new Error(`Token inválido: "${token}"`);
      modifier += num;
    }
  }

  if (groups.length === 0 && modifier === 0) throw new Error(`Expressão vazia: "${expr}"`);
  return { groups, modifier };
}

/**
 * Roll a parsed expression and return the full result.
 */
export function rollExpression(expr: string, label?: string): DiceRollResult {
  const parsed = parseExpression(expr);
  const dice: SingleDie[] = [];

  for (const group of parsed.groups) {
    const count = Math.abs(group.count);
    const sign = group.count < 0 ? -1 : 1;
    for (let i = 0; i < count; i++) {
      const result = rollDie(group.faces) * sign;
      dice.push({ faces: group.faces, result });
    }
  }

  const diceSum = dice.reduce((sum, d) => sum + d.result, 0);
  const total = diceSum + parsed.modifier;

  // Detect crit/fumble on single d20 rolls
  const isD20 = dice.length === 1 && dice[0].faces === 20;
  const natural = isD20 ? Math.abs(dice[0].result) : undefined;

  return {
    id: crypto.randomUUID(),
    expression: expr,
    label,
    dice,
    modifier: parsed.modifier,
    total,
    isCritical: natural === 20,
    isFumble: natural === 1,
    timestamp: Date.now(),
  };
}

// ---- T20 Attribute Generation: 4d6 drop lowest ----

export interface AttrGenResult {
  dice: number[];      // 4 individual results
  dropped: number;     // the dropped die value
  kept: number[];      // 3 kept dice
  total: number;       // sum of kept
}

/** Roll 4d6, drop the lowest die */
export function roll4d6DropLowest(): AttrGenResult {
  const dice = Array.from({ length: 4 }, () => rollDie(6));
  const sorted = [...dice].sort((a, b) => a - b);
  const dropped = sorted[0];
  const kept = sorted.slice(1);
  return {
    dice,
    dropped,
    kept,
    total: kept.reduce((s, v) => s + v, 0),
  };
}

/** Generate a full set of 6 attributes using 4d6 drop lowest */
export function generateAttributes(): AttrGenResult[] {
  return Array.from({ length: 6 }, () => roll4d6DropLowest());
}

// ---- Common T20 quick rolls ----

export interface QuickRoll {
  label: string;
  expression: string;
  description: string;
  category: 'ataque' | 'dano' | 'teste' | 'outros';
}

export const T20_QUICK_ROLLS: QuickRoll[] = [
  // Attack rolls (d20)
  { label: 'd20', expression: '1d20', description: 'Teste genérico', category: 'teste' },
  { label: 'd20 Ataque', expression: '1d20', description: 'Teste de ataque', category: 'ataque' },
  { label: 'd20 Iniciativa', expression: '1d20', description: 'Rolagem de iniciativa', category: 'teste' },

  // Common damage dice in T20
  { label: '1d4', expression: '1d4', description: 'Adaga, dardo', category: 'dano' },
  { label: '1d6', expression: '1d6', description: 'Espada curta, maça', category: 'dano' },
  { label: '1d8', expression: '1d8', description: 'Espada longa, mangual', category: 'dano' },
  { label: '1d10', expression: '1d10', description: 'Espada bastarda, alabarda', category: 'dano' },
  { label: '1d12', expression: '1d12', description: 'Machado grande', category: 'dano' },
  { label: '2d6', expression: '2d6', description: 'Espada grande, montante', category: 'dano' },

  // Other common rolls
  { label: '1d100', expression: '1d100', description: 'Rolagem percentual', category: 'outros' },
  { label: '2d4', expression: '2d4', description: 'Mísseis mágicos', category: 'dano' },
  { label: '3d6', expression: '3d6', description: 'Bola de fogo (nível 1)', category: 'dano' },
  { label: '4d6', expression: '4d6', description: 'Bola de fogo (nível 2)', category: 'dano' },
  { label: '6d6', expression: '6d6', description: 'Bola de fogo (nível 3)', category: 'dano' },
  { label: '8d6', expression: '8d6', description: 'Bola de fogo (nível 5)', category: 'dano' },
  { label: '10d6', expression: '10d6', description: 'Bola de fogo (máximo)', category: 'dano' },
];

/** Build a roll expression for a skill check: 1d20 + total */
export function buildSkillCheckExpr(total: number): string {
  if (total >= 0) return `1d20+${total}`;
  return `1d20${total}`;
}

/** Build a roll expression for an attack: 1d20 + bonus string (parse number) */
export function buildAttackRollExpr(bonus: string): string {
  const num = parseInt(bonus, 10);
  if (isNaN(num)) return '1d20';
  if (num >= 0) return `1d20+${num}`;
  return `1d20${num}`;
}

// ---- Roll history manager (in-memory) ----

const MAX_HISTORY = 50;
let rollHistory: DiceRollResult[] = [];
let listeners: (() => void)[] = [];

export function getRollHistory(): DiceRollResult[] {
  return rollHistory;
}

export function addRoll(result: DiceRollResult): void {
  rollHistory = [result, ...rollHistory].slice(0, MAX_HISTORY);
  listeners.forEach((fn) => fn());
}

export function clearHistory(): void {
  rollHistory = [];
  listeners.forEach((fn) => fn());
}

export function subscribeHistory(fn: () => void): () => void {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}

/** Convenience: roll, add to history, return result */
export function rollAndRecord(expression: string, label?: string): DiceRollResult {
  const result = rollExpression(expression, label);
  addRoll(result);
  return result;
}
