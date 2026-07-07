import type { FacilityType } from '@/types/game';
import { FACILITY_CONFIGS } from '@/lib/gameConfig';

interface FacilitySpriteProps {
  facilityType: FacilityType;
  level: number;
  position: { x: number; y: number };
}

export default function FacilitySprite({ facilityType, level, position }: FacilitySpriteProps) {
  const cfg = FACILITY_CONFIGS[facilityType];

  return (
    <div
      className="absolute pointer-events-none flex flex-col items-center"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div className="facility-active drop-shadow-sm">
        <span className="text-3xl">{cfg.emoji}</span>
      </div>
      <div className="flex gap-0.5 mt-0.5">
        {Array.from({ length: level }, (_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm" />
        ))}
      </div>
    </div>
  );
}
