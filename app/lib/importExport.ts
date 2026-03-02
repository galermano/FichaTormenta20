import type { Character } from './schema';
import { CURRENT_SCHEMA_VERSION } from './schema';

export function exportCharacterToJson(character: Character): void {
  const payload = {
    ...character,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
  };
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeName = character.personagem.nome.replace(/[^a-zA-Z0-9À-ÿ ]/g, '').trim() || 'personagem';
  a.download = `${safeName}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importCharacterFromJson(file: File): Promise<Character> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        // Basic validation
        if (!data.personagem || !data.atributos || !data.pericias) {
          reject(new Error('JSON inválido: campos obrigatórios ausentes (personagem, atributos, pericias).'));
          return;
        }
        // Assign a new ID to avoid collisions
        data.id = crypto.randomUUID();
        data.updatedAt = new Date().toISOString();
        resolve(data as Character);
      } catch (err) {
        reject(new Error(`Erro ao ler JSON: ${(err as Error).message}`));
      }
    };
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo.'));
    reader.readAsText(file);
  });
}
