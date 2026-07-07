import type { FacilityTypeConfig, Facility, GameAction } from '@/types/game';
import { facilityCost, formatFish } from '@/lib/gameLogic';
import ProgressBar from './ProgressBar';

interface FacilityCardProps {
  config: FacilityTypeConfig;
  facility: Facility;
  fish: number;
  dispatch: React.Dispatch<GameAction>;
}

export default function FacilityCard({ config, facility, fish, dispatch }: FacilityCardProps) {
  const cost = facilityCost(facility);
  const isMax = facility.level >= config.maxLevel;
  const canAfford = fish >= cost;

  return (
    <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{config.emoji}</span>
          <div>
            <div className="font-bold text-gray-700 text-sm leading-tight">{config.name}</div>
            <div className="text-xs text-gray-500 leading-tight">{config.description}</div>
          </div>
        </div>
        <button
          onClick={() => dispatch({ type: 'UPGRADE_FACILITY', facilityType: config.id })}
          disabled={isMax || !canAfford}
          className={`ml-2 px-2 py-1 rounded-lg text-xs font-bold transition-all flex-shrink-0 ${
            isMax
              ? 'bg-purple-200 text-purple-600 cursor-default'
              : canAfford
                ? 'bg-blue-400 text-white hover:bg-blue-500 active:scale-95 shadow-sm'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isMax
            ? 'MAX'
            : facility.level === 0
              ? `🐟${formatFish(cost)}`
              : `▲🐟${formatFish(cost)}`}
        </button>
      </div>
      <ProgressBar current={facility.level} max={config.maxLevel} colorClass="bg-blue-400" />
    </div>
  );
}
