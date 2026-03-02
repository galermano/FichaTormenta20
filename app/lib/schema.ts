export type AtributoEnum = 'FOR' | 'DES' | 'CON' | 'INT' | 'SAB' | 'CAR';

export type TamanhoEnum = 'Minúsculo' | 'Pequeno' | 'Médio' | 'Grande' | 'Enorme' | 'Colossal';

export interface AtributoValue {
  valorBase: number;
  modificador: number;
}

export interface ClasseEntry {
  nome: string;
  nivel: number;
}

export interface AtaqueEntry {
  nome: string;
  bonusTesteAtaque: string;
  dano: string;
  critico: string;
  tipo: string;
  alcance: string;
}

export interface ItemEntry {
  nome: string;
  qtdSlots: number;
}

export interface PericiaValue {
  treinado: boolean;
  atributo: AtributoEnum;
  modAtributo: number;
  outros: number;
  total: number;
}

export interface MagiaEntry {
  nome: string;
  escola: string;
  execucao: string;
  alcance: string;
  area: string;
  duracao: string;
  resistencia: string;
  efeito: string;
}

export interface Character {
  id: string;
  schemaVersion: number;
  createdAt: string;
  updatedAt: string;

  // A) Header
  personagem: {
    nome: string;
    jogador: string;
    raca: string;
    origem: string;
    classes: ClasseEntry[];
    divindade: string;
  };

  // B) Attributes
  atributos: {
    FOR: AtributoValue;
    DES: AtributoValue;
    CON: AtributoValue;
    INT: AtributoValue;
    SAB: AtributoValue;
    CAR: AtributoValue;
  };

  // C) Points & movement
  pv: { max: number; atual: number };
  pm: { max: number; atual: number };
  deslocamento: number;
  tamanho: TamanhoEnum;
  experiencia: number;

  // D) Defense
  defesa: {
    baseCA: number;
    atributoDefesa: AtributoEnum;
    modAtributoDefesa: number;
    bonusArmadura: number;
    bonusEscudo: number;
    outrosBonus: number;
    penalidadeTotalArmadura: number;
    total: number;
  };

  // E) Skills
  pericias: Record<string, PericiaValue>;

  // F) Attacks
  ataques: AtaqueEntry[];

  // G) Proficiencies
  proficienciasECaracteristicas: string;

  // H) Equipment
  equipamento: {
    itens: ItemEntry[];
  };
  tesouros: string;
  carga: { limite: number; usada: number };
  dinheiro: number;

  // I) Text fields (page 2)
  descricao: string;
  habilidades: {
    racaEOrigem: string;
    classeEPoderes: string;
  };
  anotacoes: string;
  historicoAliadosTesouros: string;

  // J) Spells
  magia: {
    atributoChave: AtributoEnum;
    modAtributoChave: number;
  };
  magias: MagiaEntry[];
  testeResistenciaMagia: number;
}

// Skills with their default attribute
export const PERICIAS_DEFAULT: { nome: string; atributo: AtributoEnum }[] = [
  { nome: 'Acrobacia', atributo: 'DES' },
  { nome: 'Adestramento', atributo: 'CAR' },
  { nome: 'Atletismo', atributo: 'FOR' },
  { nome: 'Atuação', atributo: 'CAR' },
  { nome: 'Cavalgar', atributo: 'DES' },
  { nome: 'Conhecimento', atributo: 'INT' },
  { nome: 'Cura', atributo: 'SAB' },
  { nome: 'Diplomacia', atributo: 'CAR' },
  { nome: 'Enganação', atributo: 'CAR' },
  { nome: 'Fortitude', atributo: 'CON' },
  { nome: 'Furtividade', atributo: 'DES' },
  { nome: 'Guerra', atributo: 'INT' },
  { nome: 'Iniciativa', atributo: 'DES' },
  { nome: 'Intimidação', atributo: 'CAR' },
  { nome: 'Intuição', atributo: 'SAB' },
  { nome: 'Investigação', atributo: 'INT' },
  { nome: 'Jogatina', atributo: 'CAR' },
  { nome: 'Ladinagem', atributo: 'DES' },
  { nome: 'Luta', atributo: 'FOR' },
  { nome: 'Misticismo', atributo: 'INT' },
  { nome: 'Nobreza', atributo: 'INT' },
  { nome: 'Ofício (1)', atributo: 'INT' },
  { nome: 'Ofício (2)', atributo: 'INT' },
  { nome: 'Percepção', atributo: 'SAB' },
  { nome: 'Pilotagem', atributo: 'DES' },
  { nome: 'Pontaria', atributo: 'DES' },
  { nome: 'Reflexos', atributo: 'DES' },
  { nome: 'Religião', atributo: 'SAB' },
  { nome: 'Sobrevivência', atributo: 'SAB' },
  { nome: 'Vontade', atributo: 'SAB' },
];

export const ATRIBUTOS_LIST: AtributoEnum[] = ['FOR', 'DES', 'CON', 'INT', 'SAB', 'CAR'];

export const ATRIBUTO_NAMES: Record<AtributoEnum, string> = {
  FOR: 'Força',
  DES: 'Destreza',
  CON: 'Constituição',
  INT: 'Inteligência',
  SAB: 'Sabedoria',
  CAR: 'Carisma',
};

export const TAMANHOS: TamanhoEnum[] = ['Minúsculo', 'Pequeno', 'Médio', 'Grande', 'Enorme', 'Colossal'];

export function createDefaultPericias(): Record<string, PericiaValue> {
  const pericias: Record<string, PericiaValue> = {};
  for (const p of PERICIAS_DEFAULT) {
    pericias[p.nome] = {
      treinado: false,
      atributo: p.atributo,
      modAtributo: 0,
      outros: 0,
      total: 0,
    };
  }
  return pericias;
}

export function createDefaultCharacter(): Character {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    schemaVersion: 1,
    createdAt: now,
    updatedAt: now,

    personagem: {
      nome: '',
      jogador: '',
      raca: '',
      origem: '',
      classes: [{ nome: '', nivel: 1 }],
      divindade: '',
    },

    atributos: {
      FOR: { valorBase: 10, modificador: 0 },
      DES: { valorBase: 10, modificador: 0 },
      CON: { valorBase: 10, modificador: 0 },
      INT: { valorBase: 10, modificador: 0 },
      SAB: { valorBase: 10, modificador: 0 },
      CAR: { valorBase: 10, modificador: 0 },
    },

    pv: { max: 0, atual: 0 },
    pm: { max: 0, atual: 0 },
    deslocamento: 9,
    tamanho: 'Médio',
    experiencia: 0,

    defesa: {
      baseCA: 10,
      atributoDefesa: 'DES',
      modAtributoDefesa: 0,
      bonusArmadura: 0,
      bonusEscudo: 0,
      outrosBonus: 0,
      penalidadeTotalArmadura: 0,
      total: 10,
    },

    pericias: createDefaultPericias(),

    ataques: [],

    proficienciasECaracteristicas: '',

    equipamento: { itens: [] },
    tesouros: '',
    carga: { limite: 10, usada: 0 },
    dinheiro: 0,

    descricao: '',
    habilidades: {
      racaEOrigem: '',
      classeEPoderes: '',
    },
    anotacoes: '',
    historicoAliadosTesouros: '',

    magia: {
      atributoChave: 'INT',
      modAtributoChave: 0,
    },
    magias: [],
    testeResistenciaMagia: 10,
  };
}

export const CURRENT_SCHEMA_VERSION = 1;
