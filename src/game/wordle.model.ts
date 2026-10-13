/** Reglas y tipos del juego. Aquí no hay Angular: sólo lógica pura y testeable. */

export const WORD_LENGTH = 5;
export const MAX_ATTEMPTS = 6;

/** Estado de una letra: vacía, escrita (sin evaluar) o ya evaluada. */
export type LetterState = 'empty' | 'filled' | 'absent' | 'present' | 'correct';

export type GameStatus = 'playing' | 'won' | 'lost';

/** Diaria = una palabra al día (la misma para todo el mundo); libre = aleatoria. */
export type GameMode = 'daily' | 'free';

export interface Tile {
  letter: string;
  state: LetterState;
}

export interface GameStats {
  played: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
  /** distribution[0] = partidas ganadas en 1 intento, etc. */
  distribution: number[];
}

export type StatsByMode = Record<GameMode, GameStats>;

export function emptyStats(): GameStats {
  return {
    played: 0,
    wins: 0,
    currentStreak: 0,
    maxStreak: 0,
    distribution: Array.from({ length: MAX_ATTEMPTS }, () => 0),
  };
}

/**
 * Normaliza para comparar: sin acentos, sin diéresis, ñ -> n y en mayúsculas.
 * Así "árbol" y "ARBOL" son la misma palabra.
 */
export function normalize(word: string): string {
  return word
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();
}

/** ¿Es una letra válida del alfabeto (incluye la Ñ)? */
export function isLetter(char: string): boolean {
  return /^[A-ZÑ]$/.test(normalize(char));
}

export function createEmptyGrid(): Tile[][] {
  return Array.from({ length: MAX_ATTEMPTS }, () =>
    Array.from({ length: WORD_LENGTH }, () => ({ letter: '', state: 'empty' as LetterState })),
  );
}

/**
 * Compara un intento con la solución y devuelve el estado de cada letra.
 * Se hace en dos pasadas para que las letras repetidas se comporten como en
 * el Wordle original: primero las verdes, y sólo después las amarillas que
 * aún "quedan" por emparejar.
 */
export function evaluateGuess(guess: string, answer: string): LetterState[] {
  const g = [...normalize(guess)];
  const a = [...normalize(answer)];
  const result: LetterState[] = g.map(() => 'absent');
  const pending = new Map<string, number>();

  a.forEach((letter, i) => {
    if (i >= g.length) return;
    if (g[i] === letter) {
      result[i] = 'correct';
    } else {
      pending.set(letter, (pending.get(letter) ?? 0) + 1);
    }
  });

  g.forEach((letter, i) => {
    if (result[i] === 'correct') return;
    const left = pending.get(letter) ?? 0;
    if (left > 0) {
      result[i] = 'present';
      pending.set(letter, left - 1);
    }
  });

  return result;
}

/** Retraso de la animación de giro de cada casilla (en ms). */
export const FLIP_STEP_MS = 300;
export const FLIP_DURATION = WORD_LENGTH * FLIP_STEP_MS + 300;
