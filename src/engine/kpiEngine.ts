import { configEngine } from './configEngine';
import type { Grade, PerformanceZone } from '../types/database';

export interface KPICardScore {
  key: string;
  label: string;
  actual: number;
  target: number;
  achievementPct: number;
  status: 'OVERACHIEVEMENT' | 'MEETS_STANDARD' | 'BELOW_STANDARD';
}

export interface KPIOverallScorecard {
  cards: Record<string, KPICardScore>;
  overallAchievementPct: number;
  zone: PerformanceZone;
  grade: Grade;
  totalPoints: number;
  isOverachiever: boolean;
  isStandardMet: boolean;
}

export class KPIEngine {
  public static calculateScorecard(actuals: {
    prospek: number;
    followup: number;
    discovery: number;
    demo: number;
    proposal: number;
    closing: number;
    points?: number;
  }): KPIOverallScorecard {
    const targets = configEngine.getKPITargets();

    const calcCard = (key: string, label: string, actual: number, target: number): KPICardScore => {
      const pct = target > 0 ? Math.round((actual / target) * 100) : 0;
      let status: 'OVERACHIEVEMENT' | 'MEETS_STANDARD' | 'BELOW_STANDARD' = 'BELOW_STANDARD';
      if (pct > 100) status = 'OVERACHIEVEMENT';
      else if (pct >= 100) status = 'MEETS_STANDARD';
      return { key, label, actual, target, achievementPct: pct, status };
    };

    const cards: Record<string, KPICardScore> = {
      prospek: calcCard('prospek', 'Prospek Berkualitas', actuals.prospek, targets.monthly_prospect),
      followup: calcCard('followup', 'Follow-up Activities', actuals.followup, targets.monthly_prospect * 3), // e.g. 150
      discovery: calcCard('discovery', 'Discovery Meeting', actuals.discovery, targets.monthly_discovery),
      demo: calcCard('demo', 'Demo Produk SOP', actuals.demo, targets.monthly_demo),
      proposal: calcCard('proposal', 'Proposal Terkirim', actuals.proposal, targets.monthly_proposal),
      closing: calcCard('closing', 'Closing Pelanggan Baru', actuals.closing, targets.monthly_closing),
    };

    // Calculate weighted average (Closing has highest weight as per Minara spec)
    const weights = { prospek: 0.15, followup: 0.10, discovery: 0.15, demo: 0.15, proposal: 0.15, closing: 0.30 };
    let weightedSum = 0;
    Object.entries(weights).forEach(([k, w]) => {
      const cardPct = cards[k]?.achievementPct || 0;
      weightedSum += cardPct * w;
    });

    const overallPct = Math.round(weightedSum);
    const { zone, grade } = configEngine.calculateGradeAndZone(overallPct);

    return {
      cards,
      overallAchievementPct: overallPct,
      zone,
      grade,
      totalPoints: actuals.points || 0,
      isOverachiever: overallPct > 100,
      isStandardMet: overallPct >= 100
    };
  }
}
