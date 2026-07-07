'use client';
import { useState } from 'react';
import type { GameState, GameAction, ComputedStats } from '@/types/game';
import { CAT_TYPE_ORDER, CAT_CONFIGS, FACILITY_TYPE_ORDER, FACILITY_CONFIGS } from '@/lib/gameConfig';
import CatCard from './CatCard';
import FacilityCard from './FacilityCard';

interface ShopPanelProps {
  state: GameState;
  computed: ComputedStats;
  dispatch: React.Dispatch<GameAction>;
}

export default function ShopPanel({ state, computed, dispatch }: ShopPanelProps) {
  const [activeTab, setActiveTab] = useState<'cats' | 'facilities'>('cats');

  return (
    <div className="w-72 bg-white border-l border-gray-200 flex flex-col flex-shrink-0 shadow-xl">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 flex-shrink-0">
        <button
          onClick={() => setActiveTab('cats')}
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'cats'
              ? 'text-amber-600 border-b-2 border-amber-500 bg-amber-50'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          🐱 고양이 ({state.cats.length}/{computed.maxCats})
        </button>
        <button
          onClick={() => setActiveTab('facilities')}
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'facilities'
              ? 'text-blue-600 border-b-2 border-blue-500 bg-blue-50'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          🏠 시설
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {activeTab === 'cats' ? (
          CAT_TYPE_ORDER.map(catType => {
            const config = CAT_CONFIGS[catType];
            const ownedCats = state.cats.filter(c => c.type === catType);
            return (
              <CatCard
                key={catType}
                config={config}
                ownedCats={ownedCats}
                fish={state.fish}
                totalFishEarned={state.totalFishEarned}
                maxCats={computed.maxCats}
                totalCats={state.cats.length}
                dispatch={dispatch}
              />
            );
          })
        ) : (
          FACILITY_TYPE_ORDER.map(facilityType => {
            const config = FACILITY_CONFIGS[facilityType];
            const facility = state.facilities.find(f => f.type === facilityType)!;
            return (
              <FacilityCard
                key={facilityType}
                config={config}
                facility={facility}
                fish={state.fish}
                dispatch={dispatch}
              />
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 p-3 bg-gray-50 flex-shrink-0">
        <div className="text-xs text-gray-400 text-center">
          30초마다 자동저장 · 탭 닫아도 저장됨 💾
        </div>
      </div>
    </div>
  );
}
