/**
 * characters.ts — The 4 selectable player characters.
 *
 * There is one base hero spritesheet; each character is a hue-shifted recolor of it.
 * The SAME CSS/canvas filter string is used for the selection preview (CSS `filter`)
 * AND the in-game render (canvas `ctx.filter`), so what you pick is what you get.
 * Character 0 is the original (no filter). Stored per-player on the server (`characterId`).
 */
export interface CharacterDef {
  id: number;
  name: string;
  /** CSS/canvas filter applied to the hero sprite. '' = original colors. */
  filter: string;
  /** Swatch color for the picker chip. */
  swatch: string;
}

export const CHARACTERS: CharacterDef[] = [
  { id: 0, name: 'Crimson',  filter: '',                                swatch: '#c0392b' },
  { id: 1, name: 'Verdant',  filter: 'hue-rotate(135deg) saturate(1.15)', swatch: '#5c8e32' },
  { id: 2, name: 'Azure',    filter: 'hue-rotate(215deg) saturate(1.1)',  swatch: '#3b6bdb' },
  { id: 3, name: 'Violet',   filter: 'hue-rotate(300deg) saturate(1.2)',  swatch: '#9b4ddb' },
];

export const CHARACTER_COUNT = CHARACTERS.length;

export function clampCharacterId(id: number | undefined | null): number {
  const n = Number(id) || 0;
  return n >= 0 && n < CHARACTER_COUNT ? Math.floor(n) : 0;
}

/** Canvas/CSS filter for a character id ('' for none). */
export function characterFilter(id: number | undefined | null): string {
  return CHARACTERS[clampCharacterId(id)].filter;
}
