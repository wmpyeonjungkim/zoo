import { CAT_NAMES } from './gameConfig';
import type { CatStatus } from '@/types/game';

const MARGIN = 8;

export function randomWanderTarget(): { x: number; y: number } {
  return {
    x: MARGIN + Math.random() * (90 - MARGIN * 2),
    y: MARGIN + Math.random() * (78 - MARGIN * 2),
  };
}

export function randomWanderParams(): { target: { x: number; y: number }; durationMs: number; nextAt: number } {
  const durationMs = 2000 + Math.random() * 3000;
  const pauseMs = 2000 + Math.random() * 4000;
  return {
    target: randomWanderTarget(),
    durationMs,
    nextAt: Date.now() + durationMs + pauseMs,
  };
}

export function randomStatusDuration(nowMs: number): number {
  return nowMs + 5000 + Math.random() * 25000;
}

export function nextRandomStatus(current: CatStatus): CatStatus {
  const pool: CatStatus[] = ['happy', 'happy', 'happy', 'sleeping', 'playing', 'eating', 'grooming'];
  const filtered = pool.filter(s => s !== current);
  return filtered[Math.floor(Math.random() * filtered.length)];
}

export function randomCatName(): string {
  return CAT_NAMES[Math.floor(Math.random() * CAT_NAMES.length)];
}

export const STATUS_EMOJI: Record<CatStatus, string> = {
  happy: '😊',
  sleeping: '💤',
  playing: '🎾',
  eating: '🍽️',
  grooming: '✨',
};
