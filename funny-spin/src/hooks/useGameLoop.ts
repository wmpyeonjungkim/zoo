'use client';
import { useEffect, useRef } from 'react';
import { AUTOSAVE_INTERVAL_MS } from '@/lib/gameConfig';
import { randomWanderParams, randomStatusDuration, nextRandomStatus } from '@/lib/catWander';
import { saveToStorage } from '@/lib/saveData';
import type { GameState, GameAction } from '@/types/game';

export function useGameLoop(state: GameState, dispatch: React.Dispatch<GameAction>) {
  const stateRef = useRef(state);
  stateRef.current = state;

  const lastSaveRef = useRef(Date.now());
  const rafRef = useRef<number>(0);

  useEffect(() => {
    let lastTime = performance.now();

    function tick(now: number) {
      const deltaMs = Math.min(now - lastTime, 1000);
      lastTime = now;

      dispatch({ type: 'TICK', deltaMs });

      const nowMs = Date.now();
      const currentState = stateRef.current;

      for (const cat of currentState.cats) {
        if (nowMs >= cat.nextWanderAt) {
          const params = randomWanderParams();
          dispatch({
            type: 'WANDER_CAT',
            catId: cat.id,
            target: params.target,
            durationMs: params.durationMs,
            nextAt: params.nextAt,
          });
        }
        if (nowMs >= cat.statusChangesAt) {
          dispatch({
            type: 'CHANGE_CAT_STATUS',
            catId: cat.id,
            status: nextRandomStatus(cat.status),
            nextAt: randomStatusDuration(nowMs),
          });
        }
      }

      if (nowMs - lastSaveRef.current >= AUTOSAVE_INTERVAL_MS) {
        saveToStorage(currentState);
        lastSaveRef.current = nowMs;
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveToStorage(stateRef.current);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelAnimationFrame(rafRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [dispatch]);
}
