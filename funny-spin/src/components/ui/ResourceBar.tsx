import { formatFish } from '@/lib/gameLogic';

interface ResourceBarProps {
  fish: number;
  fishPerSec: number;
  fishPerClick: number;
  totalFishEarned: number;
}

export default function ResourceBar({ fish, fishPerSec, fishPerClick, totalFishEarned }: ResourceBarProps) {
  return (
    <div className="flex items-center justify-between px-4 h-16 bg-gradient-to-r from-amber-400 to-orange-400 shadow-md z-10 flex-shrink-0">
      {/* Main fish count */}
      <div className="flex items-center gap-2">
        <span className="text-3xl drop-shadow-sm">🐟</span>
        <div>
          <div className="text-xl font-bold text-white leading-none drop-shadow-sm">
            {formatFish(fish)}
          </div>
          <div className="text-xs text-amber-100">생선</div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="text-center">
          <div className="text-sm font-bold text-white">{formatFish(fishPerSec)}/초</div>
          <div className="text-xs text-amber-100">자동생산</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-bold text-white">+{formatFish(fishPerClick)}</div>
          <div className="text-xs text-amber-100">클릭당</div>
        </div>
        <div className="text-center hidden sm:block">
          <div className="text-sm font-bold text-white">{formatFish(totalFishEarned)}</div>
          <div className="text-xs text-amber-100">누적 생선</div>
        </div>
      </div>

      <div className="text-2xl">🐾</div>
    </div>
  );
}
