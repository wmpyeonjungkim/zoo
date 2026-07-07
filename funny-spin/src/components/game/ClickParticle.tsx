import type { Particle } from '@/types/game';

interface ClickParticleProps {
  particle: Particle;
}

export default function ClickParticle({ particle }: ClickParticleProps) {
  return (
    <div
      className="particle-fish absolute text-2xl pointer-events-none z-50"
      style={{ left: particle.x - 12, top: particle.y - 12 }}
    >
      🐟
    </div>
  );
}
