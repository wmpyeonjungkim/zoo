'use client';
import { useRef } from 'react';
import type { Cat, Facility, Particle } from '@/types/game';
import CatSprite from './CatSprite';
import ClickParticle from './ClickParticle';
import FacilitySprite from './FacilitySprite';

const FACILITY_POSITIONS: Record<string, { x: number; y: number }> = {
  food_bowl:     { x: 7,  y: 72 },
  scratcher:     { x: 80, y: 62 },
  cat_tower:     { x: 45, y: 8  },
  catnip_garden: { x: 8,  y: 38 },
  cozy_bed:      { x: 76, y: 78 },
};

interface GameAreaProps {
  cats: Cat[];
  facilities: Facility[];
  particles: Particle[];
  particlesEnabled: boolean;
  onAreaClick: (x: number, y: number) => void;
}

export default function GameArea({ cats, facilities, particles, particlesEnabled, onAreaClick }: GameAreaProps) {
  const areaRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!areaRef.current) return;
    const rect = areaRef.current.getBoundingClientRect();
    onAreaClick(e.clientX - rect.left, e.clientY - rect.top);
  };

  return (
    <div
      ref={areaRef}
      onClick={handleClick}
      className="relative flex-1 overflow-hidden cursor-pointer select-none"
      style={{
        background: 'linear-gradient(to bottom, #e0f2fe 0%, #bae6fd 30%, #d1fae5 70%, #86efac 100%)',
      }}
    >
      {/* Decorative sky elements */}
      <div className="absolute top-6 left-10 text-5xl opacity-30 pointer-events-none">☁️</div>
      <div className="absolute top-14 right-14 text-4xl opacity-20 pointer-events-none">☁️</div>
      <div className="absolute top-3 left-1/3 text-3xl opacity-15 pointer-events-none">☁️</div>

      {/* Ground strip */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-green-300/40 rounded-t-3xl pointer-events-none" />

      {/* Facilities */}
      {facilities.map(facility =>
        facility.level > 0 ? (
          <FacilitySprite
            key={facility.type}
            facilityType={facility.type}
            level={facility.level}
            position={FACILITY_POSITIONS[facility.type] ?? { x: 50, y: 50 }}
          />
        ) : null
      )}

      {/* Cats */}
      {cats.map(cat => (
        <CatSprite key={cat.id} cat={cat} />
      ))}

      {/* Click particles */}
      {particlesEnabled && particles.map(particle => (
        <ClickParticle key={particle.id} particle={particle} />
      ))}

      {/* Empty state */}
      {cats.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-gray-400">
            <div className="text-4xl mb-2">🐱</div>
            <p className="text-sm font-medium">고양이가 오고 있어요...</p>
          </div>
        </div>
      )}

      {/* Click hint */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-gray-400/70 pointer-events-none whitespace-nowrap">
        화면을 클릭해서 생선을 획득하세요! 🐟
      </div>
    </div>
  );
}
