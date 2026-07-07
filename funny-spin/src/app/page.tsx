'use client';
import { useEffect, useRef } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { useGameLoop } from '@/hooks/useGameLoop';
import { useParticles } from '@/hooks/useParticles';
import { loadFromStorage } from '@/lib/saveData';
import GameArea from '@/components/game/GameArea';
import ResourceBar from '@/components/ui/ResourceBar';
import ShopPanel from '@/components/ui/ShopPanel';

export default function Home() {
  const { state, dispatch, computed, clickArea } = useGameState();
  const { particles, spawnParticle } = useParticles();

  useGameLoop(state, dispatch);

  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const saved = loadFromStorage();
    if (saved && saved.cats.length > 0) {
      dispatch({ type: 'LOAD_SAVE', state: saved });
    } else {
      // First play — give free tabby
      dispatch({ type: 'ADOPT_CAT', catType: 'tabby' });
    }
  }, [dispatch]);

  const handleAreaClick = (x: number, y: number) => {
    clickArea();
    if (state.settings.particlesEnabled) {
      spawnParticle(x, y);
    }
  };

  return (
    <main className="flex flex-col h-screen overflow-hidden">
      <ResourceBar
        fish={state.fish}
        fishPerSec={computed.fishPerSec}
        fishPerClick={computed.fishPerClick}
        totalFishEarned={state.totalFishEarned}
      />
      <div className="flex flex-1 overflow-hidden">
        <GameArea
          cats={state.cats}
          facilities={state.facilities}
          particles={particles}
          particlesEnabled={state.settings.particlesEnabled}
          onAreaClick={handleAreaClick}
        />
        <ShopPanel
          state={state}
          computed={computed}
          dispatch={dispatch}
        />
      </div>
    </main>
  );
}
