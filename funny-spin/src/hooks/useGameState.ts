'use client';
import { useReducer, useMemo, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { computeStats, catLevelUpCost, facilityCost, calcOfflineFish } from '@/lib/gameLogic';
import { CAT_CONFIGS, FACILITY_CONFIGS, CAT_MAX_LEVEL, createInitialState, OFFLINE_CAP_HOURS } from '@/lib/gameConfig';
import { randomWanderTarget, randomWanderParams, randomStatusDuration, nextRandomStatus, randomCatName } from '@/lib/catWander';
import type { GameState, GameAction, Cat, CatType } from '@/types/game';

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'TICK': {
      const { fishPerSec } = computeStats(state.cats, state.facilities);
      const gained = (fishPerSec * action.deltaMs) / 1000;
      return {
        ...state,
        fish: state.fish + gained,
        totalFishEarned: state.totalFishEarned + gained,
        lastTickTime: state.lastTickTime + action.deltaMs,
      };
    }

    case 'CLICK_AREA': {
      const { fishPerClick } = computeStats(state.cats, state.facilities);
      return {
        ...state,
        fish: state.fish + fishPerClick,
        totalFishEarned: state.totalFishEarned + fishPerClick,
      };
    }

    case 'ADOPT_CAT': {
      const cfg = CAT_CONFIGS[action.catType];
      const cost = state.cats.length === 0 ? 0 : cfg.adoptCost;
      if (state.fish < cost) return state;
      const startPos = randomWanderTarget();
      const params = randomWanderParams();
      const newCat: Cat = {
        id: uuidv4(),
        type: action.catType,
        level: 1,
        status: 'happy',
        position: startPos,
        wanderTarget: params.target,
        wanderDurationMs: params.durationMs,
        nextWanderAt: params.nextAt,
        statusChangesAt: randomStatusDuration(Date.now()),
        animationSeed: Math.floor(Math.random() * 4),
        name: randomCatName(),
      };
      return {
        ...state,
        fish: state.fish - cost,
        cats: [...state.cats, newCat],
      };
    }

    case 'LEVEL_UP_CAT': {
      const cat = state.cats.find(c => c.id === action.catId);
      if (!cat || cat.level >= CAT_MAX_LEVEL) return state;
      const cost = catLevelUpCost(cat);
      if (state.fish < cost) return state;
      return {
        ...state,
        fish: state.fish - cost,
        cats: state.cats.map(c =>
          c.id === action.catId ? { ...c, level: c.level + 1 } : c
        ),
      };
    }

    case 'UPGRADE_FACILITY': {
      const facility = state.facilities.find(f => f.type === action.facilityType);
      if (!facility) return state;
      const cfg = FACILITY_CONFIGS[action.facilityType];
      if (facility.level >= cfg.maxLevel) return state;
      const cost = facilityCost(facility);
      if (state.fish < cost) return state;
      return {
        ...state,
        fish: state.fish - cost,
        facilities: state.facilities.map(f =>
          f.type === action.facilityType ? { ...f, level: f.level + 1 } : f
        ),
      };
    }

    case 'WANDER_CAT':
      return {
        ...state,
        cats: state.cats.map(c =>
          c.id === action.catId
            ? {
                ...c,
                position: c.wanderTarget,
                wanderTarget: action.target,
                wanderDurationMs: action.durationMs,
                nextWanderAt: action.nextAt,
              }
            : c
        ),
      };

    case 'CHANGE_CAT_STATUS':
      return {
        ...state,
        cats: state.cats.map(c =>
          c.id === action.catId
            ? { ...c, status: action.status, statusChangesAt: action.nextAt }
            : c
        ),
      };

    case 'LOAD_SAVE': {
      const nowMs = Date.now();
      const offlineFish = calcOfflineFish(action.state, nowMs, OFFLINE_CAP_HOURS);
      const updatedCats = action.state.cats.map(cat => ({
        ...cat,
        nextWanderAt: nowMs + 1000 + Math.random() * 3000,
        statusChangesAt: nowMs + 3000 + Math.random() * 10000,
      }));
      return {
        ...action.state,
        cats: updatedCats,
        fish: action.state.fish + offlineFish,
        totalFishEarned: action.state.totalFishEarned + offlineFish,
        lastTickTime: nowMs,
      };
    }

    case 'TOGGLE_PARTICLES':
      return {
        ...state,
        settings: { ...state.settings, particlesEnabled: !state.settings.particlesEnabled },
      };

    default:
      return state;
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, createInitialState());

  const computed = useMemo(
    () => computeStats(state.cats, state.facilities),
    [state.cats, state.facilities]
  );

  const adoptCat = useCallback((catType: CatType) => {
    dispatch({ type: 'ADOPT_CAT', catType });
  }, []);

  const clickArea = useCallback(() => {
    dispatch({ type: 'CLICK_AREA' });
  }, []);

  return { state, dispatch, computed, adoptCat, clickArea };
}
