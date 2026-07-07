import type { Cat } from '@/types/game';
import { CAT_CONFIGS } from '@/lib/gameConfig';
import { STATUS_EMOJI } from '@/lib/catWander';

function getAnimClass(cat: Cat): string {
  switch (cat.status) {
    case 'sleeping': return `cat-sleep-${cat.animationSeed}`;
    case 'playing':  return 'cat-play';
    case 'eating':   return 'cat-eat';
    case 'grooming': return 'cat-groom';
    default:         return `cat-bob-${cat.animationSeed}`;
  }
}

function catFontSize(level: number): number {
  return Math.min(24 + level * 1.2, 42);
}

interface CatSpriteProps {
  cat: Cat;
}

export default function CatSprite({ cat }: CatSpriteProps) {
  const cfg = CAT_CONFIGS[cat.type];

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${cat.position.x}%`,
        top: `${cat.position.y}%`,
        transition: `left ${cat.wanderDurationMs}ms ease-in-out, top ${cat.wanderDurationMs}ms ease-in-out`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Status bubble */}
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-0.5 whitespace-nowrap">
        <span className="text-sm drop-shadow-sm">{STATUS_EMOJI[cat.status]}</span>
        {cat.status === 'sleeping' && (
          <span className="zzz-bubble text-blue-400 font-bold">z</span>
        )}
      </div>

      {/* Cat emoji */}
      <div className={getAnimClass(cat)}>
        <span
          className="drop-shadow-sm select-none"
          style={{ fontSize: `${catFontSize(cat.level)}px` }}
        >
          {cfg.emoji}
        </span>
      </div>

      {/* Name and level */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 flex flex-col items-center gap-0.5">
        <span className="text-[9px] text-gray-500 whitespace-nowrap bg-white/80 px-1 rounded-sm leading-tight">
          {cat.name}
        </span>
        <span className="text-[8px] bg-white/90 text-gray-600 rounded-full px-1.5 py-px shadow-sm font-bold leading-tight">
          Lv{cat.level}
        </span>
      </div>
    </div>
  );
}
