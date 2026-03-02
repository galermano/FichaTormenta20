import type { Character, AtributoEnum } from './schema';

/** Classic D20: modifier = floor((base - 10) / 2) */
export function calcModificador(valorBase: number): number {
  return Math.floor((valorBase - 10) / 2);
}

/** Sum of all class levels */
export function calcNivelTotal(character: Character): number {
  return character.personagem.classes.reduce((sum, c) => sum + (c.nivel || 0), 0);
}

/** Carry limit: 10 + 2*FOR mod (minimum 2) as per T20 rules */
export function calcLimiteCarga(forMod: number): number {
  const limit = 10 + 2 * forMod;
  return Math.max(limit, 2);
}

/** Defense total = baseCA + modAtributoDefesa + bonusArmadura + bonusEscudo + outrosBonus */
export function calcDefesaTotal(character: Character): number {
  const d = character.defesa;
  return d.baseCA + d.modAtributoDefesa + d.bonusArmadura + d.bonusEscudo + d.outrosBonus;
}

/** Skill total = (treinado ? bonusTreino : 0) + modAtributo + outros */
export function calcPericiaTotal(treinado: boolean, modAtributo: number, outros: number, bonusTreino: number = 2): number {
  return (treinado ? bonusTreino : 0) + modAtributo + outros;
}

/** Spell DC = 10 + half total level + key ability modifier */
export function calcTesteResistenciaMagia(nivelTotal: number, modAtributoChave: number): number {
  return 10 + Math.floor(nivelTotal / 2) + modAtributoChave;
}

/** Recalculate all derived fields on a character (mutates in place and returns it) */
export function recalculate(character: Character): Character {
  // Attribute modifiers
  for (const key of ['FOR', 'DES', 'CON', 'INT', 'SAB', 'CAR'] as AtributoEnum[]) {
    character.atributos[key].modificador = calcModificador(character.atributos[key].valorBase);
  }

  // Defense attribute modifier
  const defAttr = character.defesa.atributoDefesa;
  character.defesa.modAtributoDefesa = character.atributos[defAttr].modificador;
  character.defesa.total = calcDefesaTotal(character);

  // Carry limit
  character.carga.limite = calcLimiteCarga(character.atributos.FOR.modificador);

  // Skill modifiers and totals
  const nivelTotal = calcNivelTotal(character);
  const bonusTreino = Math.max(2, Math.floor(nivelTotal / 2));
  for (const [, pericia] of Object.entries(character.pericias)) {
    pericia.modAtributo = character.atributos[pericia.atributo].modificador;
    pericia.total = calcPericiaTotal(pericia.treinado, pericia.modAtributo, pericia.outros, bonusTreino);
  }

  // Spell DC
  character.magia.modAtributoChave = character.atributos[character.magia.atributoChave].modificador;
  character.testeResistenciaMagia = calcTesteResistenciaMagia(nivelTotal, character.magia.modAtributoChave);

  character.updatedAt = new Date().toISOString();
  return character;
}
