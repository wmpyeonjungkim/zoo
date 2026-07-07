import { CAT_CONFIGS, FACILITY_CONFIGS, BASE_MAX_CATS, CAT_MAX_LEVEL } from './gameConfig';
import type { Cat, CatType, Facility, ComputedStats, GameState } from '@/types/game';

export function computeStats(cats: Cat[], facilities: Facility[]): ComputedStats {
  let productionMultiplier = 1;
  let clickFishFlat = 1;
  let maxCats = BASE_MAX_CATS;

  for (const f of facilities) {
    if (f.level === 0) continue;
    const cfg = FACILITY_CONFIGS[f.type];
    if (cfg.bonusType === 'global_production_pct') {
      productionMultiplier += cfg.bonusPerLevel * f.level;
    } else if (cfg.bonusType === 'click_fish_flat') {
      clickFishFlat += cfg.bonusPerLevel * f.level;
    } else if (cfg.bonusType === 'cat_capacity_flat') {
      maxCats += cfg.bonusPerLevel * f.level;
    }
  }

  let fishPerSec = 0;
  for (const cat of cats) {
    fishPerSec += CAT_CONFIGS[cat.type].baseFishPerSec * cat.level;
  }
  fishPerSec *= productionMultiplier;

  return { fishPerSec, fishPerClick: clickFishFlat, maxCats, facilityMultiplier: productionMultiplier };
}

export function catLevelUpCost(cat: Cat): number {
  return Math.round(CAT_CONFIGS[cat.type].levelUpCostBase * Math.pow(cat.level, 1.6));
}

export function facilityCost(facility: Facility): number {
  const cfg = FACILITY_CONFIGS[facility.type];
  return Math.round(cfg.baseCost * Math.pow(2, facility.level));
}

export function canAdoptCat(fish: number, catType: CatType, totalCats: number, maxCats: number): boolean {
  return totalCats < maxCats && fish >= CAT_CONFIGS[catType].adoptCost;
}

export function canLevelUpCat(fish: number, cat: Cat): boolean {
  return cat.level < CAT_MAX_LEVEL && fish >= catLevelUpCost(cat);
}

export function canUpgradeFacility(fish: number, facility: Facility): boolean {
  return facility.level < FACILITY_CONFIGS[facility.type].maxLevel && fish >= facilityCost(facility);
}

export function calcOfflineFish(state: GameState, nowMs: number, capHours: number): number {
  const gapSec = Math.min((nowMs - state.lastTickTime) / 1000, capHours * 3600);
  if (gapSec <= 0) return 0;
  const { fishPerSec } = computeStats(state.cats, state.facilities);
  return fishPerSec * gapSec * 0.5;
}

export function formatFish(n: number): string {
  if (n < 1000) return n.toFixed(1);
  if (n < 1_000_000) return (n / 1000).toFixed(1) + 'K';
  if (n < 1_000_000_000) return (n / 1_000_000).toFixed(2) + 'M';
  return (n / 1_000_000_000).toFixed(2) + 'B';
}
