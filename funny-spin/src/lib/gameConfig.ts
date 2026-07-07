import type { CatType, CatTypeConfig, FacilityType, FacilityTypeConfig, GameState } from '@/types/game';

export const CAT_CONFIGS: Record<CatType, CatTypeConfig> = {
  tabby: {
    id: 'tabby', emoji: '🐱', name: 'Tabby', color: 'bg-orange-100',
    baseFishPerSec: 0.1, adoptCost: 10, levelUpCostBase: 8, unlockAt: 0,
    description: '사랑스러운 줄무늬 고양이',
  },
  siamese: {
    id: 'siamese', emoji: '😸', name: 'Siamese', color: 'bg-blue-100',
    baseFishPerSec: 0.5, adoptCost: 100, levelUpCostBase: 40, unlockAt: 50,
    description: '수다스럽고 부지런한 고양이',
  },
  persian: {
    id: 'persian', emoji: '😻', name: 'Persian', color: 'bg-purple-100',
    baseFishPerSec: 2.0, adoptCost: 500, levelUpCostBase: 200, unlockAt: 200,
    description: '고귀한 페르시안 귀족',
  },
  maine_coon: {
    id: 'maine_coon', emoji: '🦁', name: 'Maine Coon', color: 'bg-amber-100',
    baseFishPerSec: 8.0, adoptCost: 2000, levelUpCostBase: 800, unlockAt: 1000,
    description: '거대하고 온순한 숲의 고양이',
  },
  sphynx: {
    id: 'sphynx', emoji: '🐈', name: 'Sphynx', color: 'bg-slate-100',
    baseFishPerSec: 25.0, adoptCost: 10000, levelUpCostBase: 4000, unlockAt: 5000,
    description: '신비로운 무모 고양이',
  },
  ragdoll: {
    id: 'ragdoll', emoji: '💜', name: 'Ragdoll', color: 'bg-pink-100',
    baseFishPerSec: 80.0, adoptCost: 50000, levelUpCostBase: 20000, unlockAt: 20000,
    description: '안기면 녹아내리는 고양이',
  },
  bengal: {
    id: 'bengal', emoji: '🐆', name: 'Bengal', color: 'bg-green-100',
    baseFishPerSec: 250.0, adoptCost: 200000, levelUpCostBase: 80000, unlockAt: 100000,
    description: '야생의 심장을 가진 고양이',
  },
};

export const CAT_TYPE_ORDER: CatType[] = [
  'tabby', 'siamese', 'persian', 'maine_coon', 'sphynx', 'ragdoll', 'bengal',
];

export const FACILITY_CONFIGS: Record<FacilityType, FacilityTypeConfig> = {
  food_bowl: {
    id: 'food_bowl', emoji: '🥣', name: '밥그릇',
    description: '레벨당 전체 생산 +8%',
    baseCost: 50, maxLevel: 5, bonusType: 'global_production_pct', bonusPerLevel: 0.08,
  },
  scratcher: {
    id: 'scratcher', emoji: '🪵', name: '스크래처',
    description: '레벨당 클릭 생선 +2',
    baseCost: 200, maxLevel: 5, bonusType: 'click_fish_flat', bonusPerLevel: 2,
  },
  cat_tower: {
    id: 'cat_tower', emoji: '🏯', name: '캣타워',
    description: '레벨당 최대 고양이 +1',
    baseCost: 500, maxLevel: 5, bonusType: 'cat_capacity_flat', bonusPerLevel: 1,
  },
  catnip_garden: {
    id: 'catnip_garden', emoji: '🌿', name: '캣닢 정원',
    description: '레벨당 전체 생산 +15%',
    baseCost: 2000, maxLevel: 5, bonusType: 'global_production_pct', bonusPerLevel: 0.15,
  },
  cozy_bed: {
    id: 'cozy_bed', emoji: '🛏️', name: '아늑한 침대',
    description: '레벨당 전체 생산 +20%',
    baseCost: 8000, maxLevel: 5, bonusType: 'global_production_pct', bonusPerLevel: 0.20,
  },
};

export const FACILITY_TYPE_ORDER: FacilityType[] = [
  'food_bowl', 'scratcher', 'cat_tower', 'catnip_garden', 'cozy_bed',
];

export const BASE_MAX_CATS = 5;
export const CAT_MAX_LEVEL = 20;
export const PARTICLE_LIFETIME_MS = 900;
export const AUTOSAVE_INTERVAL_MS = 30_000;
export const OFFLINE_CAP_HOURS = 8;
export const SAVE_KEY = 'funny-spin-v1';
export const SAVE_VERSION = 1;

export const CAT_NAMES = [
  '냥이', '야옹이', '나비', '뭉치', '복실이', '솜이', '까망이', '하양이',
  '꼬마', '얼룩이', '호랑이', '삼색이', '줄무늬', '보들이', '포슬이',
  '달이', '별이', '구름이', '바람이', '눈꽃이',
];

export function createInitialState(): GameState {
  return {
    fish: 0,
    totalFishEarned: 0,
    cats: [],
    facilities: FACILITY_TYPE_ORDER.map(t => ({ type: t, level: 0 })),
    lastTickTime: Date.now(),
    lastSaveTime: Date.now(),
    version: SAVE_VERSION,
    settings: { particlesEnabled: true },
  };
}
