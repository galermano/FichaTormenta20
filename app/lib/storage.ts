import type { Character } from './schema';

const STORAGE_KEY = 't20_characters';

// In-memory fallback when localStorage is not available
let memoryStore: Character[] = [];

function isLocalStorageAvailable(): boolean {
  try {
    const test = '__ls_test__';
    localStorage.setItem(test, '1');
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

export function getAllCharacters(): Character[] {
  if (!isLocalStorageAvailable()) return [...memoryStore];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Character[];
  } catch {
    return [];
  }
}

export function getCharacter(id: string): Character | undefined {
  return getAllCharacters().find((c) => c.id === id);
}

export function saveCharacter(character: Character): void {
  const all = getAllCharacters();
  const idx = all.findIndex((c) => c.id === character.id);
  if (idx >= 0) {
    all[idx] = character;
  } else {
    all.push(character);
  }
  persist(all);
}

export function deleteCharacter(id: string): void {
  const all = getAllCharacters().filter((c) => c.id !== id);
  persist(all);
}

export function duplicateCharacter(character: Character): Character {
  const dup: Character = JSON.parse(JSON.stringify(character));
  dup.id = crypto.randomUUID();
  dup.personagem.nome = `${character.personagem.nome} (Cópia)`;
  dup.createdAt = new Date().toISOString();
  dup.updatedAt = new Date().toISOString();
  saveCharacter(dup);
  return dup;
}

function persist(characters: Character[]): void {
  if (isLocalStorageAvailable()) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
    } catch {
      memoryStore = characters;
    }
  } else {
    memoryStore = characters;
  }
}
