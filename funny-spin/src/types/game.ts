export type CatType =
  | 'tabby' | 'siamese' | 'persian' | 'maine_coon'
  | 'sphynx' | 'ragdoll' | 'bengal';

export type CatStatus = 'happy' | 'sleeping' | 'playing' | 'eating' | 'grooming';

export type FacilityType =
  | 'food_bowl' | 'scratcher' | 'cat_tower'
  | 'catnip_garden' | 'cozy_bed';

export interface CatTypeConfig {
  id: CatType;
  name: string;
  emoji: string;
  baseFishPerSec: number;
  adoptCost: number;
  levelUpCostBase: number;
  unlockAt: number;
  description: string;
  color: string;
}

export interface FacilityTypeConfig {
  id: FacilityType;
  name: string;
  emoji: string;
  description: string;
  baseCost: number;
  maxLevel: number;
  bonusType: 'global_production_pct' | 'click_fish_flat' | 'cat_capacity_flat';
  bonusPerLevel: number;
}

export interface Cat {
  id: string;
  type: CatType;
  level: number;
  status: CatStatus;
  position: { x: number; y: number };
  wanderTarget: { x: number; y: number };
  wanderDurationMs: number;
  nextWanderAt: number;
  statusChangesAt: number;
  animationSeed: number;
  name: string;
}

export interface Facility {
  type: FacilityType;
  level: number;
}

export interface GameState {
  fish: number;
  totalFishEarned: number;
  cats: Cat[];
  facilities: Facility[];
  lastTickTime: number;
  lastSaveTime: number;
  version: number;
  settings: {
    particlesEnabled: boolean;
  };
}

export interface ComputedStats {
  fishPerSec: number;
  fishPerClick: number;
  maxCats: number;
  facilityMultiplier: number;
}

export type GameAction =
  | { type: 'TICK'; deltaMs: number }
  | { type: 'CLICK_AREA' }
  | { type: 'ADOPT_CAT'; catType: CatType }
  | { type: 'LEVEL_UP_CAT'; catId: string }
  | { type: 'UPGRADE_FACILITY'; facilityType: FacilityType }
  | { type: 'WANDER_CAT'; catId: string; target: { x: number; y: number }; durationMs: number; nextAt: number }
  | { type: 'CHANGE_CAT_STATUS'; catId: string; status: CatStatus; nextAt: number }
  | { type: 'LOAD_SAVE'; state: GameState }
  | { type: 'TOGGLE_PARTICLES' };

export interface Particle {
  id: string;
  x: number;
  y: number;
  createdAt: number;
}
