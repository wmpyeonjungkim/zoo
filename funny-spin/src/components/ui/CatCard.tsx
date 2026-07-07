import type { CatTypeConfig, Cat, GameAction } from '@/types/game';
import { catLevelUpCost, formatFish } from '@/lib/gameLogic';
import { CAT_MAX_LEVEL } from '@/lib/gameConfig';

interface CatCardProps {
  config: CatTypeConfig;
  ownedCats: Cat[];
  fish: number;
  totalFishEarned: number;
  maxCats: number;
  totalCats: number;
  dispatch: React.Dispatch<GameAction>;
}

export default function CatCard({
  config, ownedCats, fish, totalFishEarned, maxCats, totalCats, dispatch,
}: CatCardProps) {
  const isUnlocked = totalFishEarned >= config.unlockAt || config.unlockAt === 0;

  if (!isUnlocked && ownedCats.length === 0) {
    return (
      <div className="bg-gray-100 rounded-xl p-3 border border-gray-200 opacity-60">
        <div className="flex items-center gap-2">
          <span className="text-2xl grayscale">❓</span>
          <div>
            <div className="font-bold text-gray-400 text-sm">??? 고양이</div>
            <div className="text-xs text-gray-400">
              🐟 {formatFish(config.unlockAt)} 획득 시 해금
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isFull = totalCats >= maxCats;
  const canAfford = fish >= config.adoptCost;
  const canAdopt = canAfford && !isFull;

  return (
    <div className={`${config.color} rounded-xl p-3 border border-white/60 shadow-sm`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{config.emoji}</span>
          <div>
            <div className="font-bold text-gray-700 text-sm leading-tight">{config.name}</div>
            <div className="text-xs text-gray-500 leading-tight">{config.description}</div>
          </div>
        </div>
        <button
          onClick={() => dispatch({ type: 'ADOPT_CAT', catType: config.id })}
          disabled={!canAdopt}
          className={`ml-2 px-2 py-1 rounded-lg text-xs font-bold transition-all flex-shrink-0 ${
            isFull
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : canAdopt
                ? 'bg-amber-400 text-white hover:bg-amber-500 active:scale-95 shadow-sm'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isFull ? '만석' : `🐟${formatFish(config.adoptCost)}`}
        </button>
      </div>

      <div className="text-xs text-gray-500 mb-2">
        생산량: 🐟{config.baseFishPerSec}/초·레벨
      </div>

      {/* Owned cats */}
      {ownedCats.length > 0 && (
        <div className="space-y-1.5 border-t border-white/60 pt-2">
          {ownedCats.map(cat => {
            const levelCost = catLevelUpCost(cat);
            const atMax = cat.level >= CAT_MAX_LEVEL;
            const canLevel = !atMax && fish >= levelCost;
            return (
              <div key={cat.id} className="flex items-center justify-between">
                <div className="text-xs text-gray-600 flex-1 min-w-0">
                  <span className="font-medium truncate">{cat.name}</span>
                  <span className="text-gray-400 ml-1">Lv{cat.level}</span>
                </div>
                <button
                  onClick={() => dispatch({ type: 'LEVEL_UP_CAT', catId: cat.id })}
                  disabled={!canLevel}
                  className={`ml-2 px-2 py-0.5 rounded text-xs font-medium transition-all flex-shrink-0 ${
                    atMax
                      ? 'bg-purple-200 text-purple-600 cursor-default'
                      : canLevel
                        ? 'bg-green-400 text-white hover:bg-green-500 active:scale-95'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {atMax ? 'MAX' : `🐟${formatFish(levelCost)}`}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
