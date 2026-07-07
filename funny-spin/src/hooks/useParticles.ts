'use client';
import { useState, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { PARTICLE_LIFETIME_MS } from '@/lib/gameConfig';
import type { Particle } from '@/types/game';

export function useParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const timerRefs = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const spawnParticle = useCallback((x: number, y: number) => {
    const id = uuidv4();
    const particle: Particle = { id, x, y, createdAt: Date.now() };
    setParticles(prev => [...prev, particle]);
    const timer = setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== id));
      timerRefs.current.delete(id);
    }, PARTICLE_LIFETIME_MS);
    timerRefs.current.set(id, timer);
  }, []);

  return { particles, spawnParticle };
}
