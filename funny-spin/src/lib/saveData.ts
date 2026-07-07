import { SAVE_KEY, SAVE_VERSION, createInitialState } from './gameConfig';
import type { GameState } from '@/types/game';

export function loadFromStorage(): GameState | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as GameState;
    if (!parsed.version || parsed.version < SAVE_VERSION) {
      const fresh = createInitialState();
      return { ...fresh, ...parsed, version: SAVE_VERSION };
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveToStorage(state: GameState): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SAVE_KEY, JSON.stringify({ ...state, lastSaveTime: Date.now() }));
}

export function clearStorage(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SAVE_KEY);
}
