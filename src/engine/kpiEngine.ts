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
  
  // OPSI B: Hybrid Metric & Salary Structure Explanation Rules
  closing_amount: number;
  target_closing_amount: number;
  is_nominal_omset_met: boolean;
  explanation_reason?: string;
  payroll_impact_explanation?: string;
}

export class KPIEngine {
  public static calculateScorecard(actuals: {
    prospek: number;
    followup: number;
    discovery: number;
    demo: number;
    proposal: number;
    closing: number;
    closing_amount?: number;
    target_closing_amount?: number;
    points?: number;
  }): KPIOverallScorecard {
    const targets = configEngine.getKPITargets();
    const actualClosingAmount = actuals.closing_amount || 0;
    // Default Target Nominal Omset Per Sales: Rp 50.000.000 / bulan
    const targetClosingAmount = actuals.target_closing_amount || 50000000;

    const calcCard = (key: string, label: string, actual: number, target: number): KPICardScore => {
      const pct = target > 0 ? Math.round((actual / target) * 100) : 0;
      let status: 'OVERACHIEVEMENT' | 'MEETS_STANDARD' | 'BELOW_STANDARD' = 'BELOW_STANDARD';
      if (pct > 100) status = 'OVERACHIEVEMENT';
      else if (pct >= 100) status = 'MEETS_STANDARD';
      return { key, label, actual, target, achievementPct: pct, status };
    };

    const cards: Record<string, KPICardScore> = {
      prospek: calcCard('prospek', 'Prospek Berkualitas', actuals.prospek, targets.monthly_prospect),
      followup: calcCard('followup', 'Follow-up Activities', actuals.followup, targets.monthly_prospect * 3),
      discovery: calcCard('discovery', 'Discovery Meeting', actuals.discovery, targets.monthly_discovery),
      demo: calcCard('demo', 'Demo Produk SOP', actuals.demo, targets.monthly_demo),
      proposal: calcCard('proposal', 'Proposal Terkirim', actuals.proposal, targets.monthly_proposal),
      closing: calcCard('closing', 'Closing Pelanggan Baru', actuals.closing, targets.monthly_closing),
    };

    // Calculate weighted average
    const weights = { prospek: 0.15, followup: 0.10, discovery: 0.15, demo: 0.15, proposal: 0.15, closing: 0.30 };
    let weightedSum = 0;
    Object.entries(weights).forEach(([k, w]) => {
      const cardPct = cards[k]?.achievementPct || 0;
      weightedSum += cardPct * w;
    });

    let overallPct = Math.round(weightedSum);
    let { zone, grade } = configEngine.calculateGradeAndZone(overallPct);
    
    const isNominalOmsetMet = actualClosingAmount >= targetClosingAmount;
    let explanationReason = undefined;
    let payrollImpactExplanation = undefined;

    // OPSI B IMPLEMENTATION:
    // Jika Closing Count sudah 10 tetapi Nilai Nominal Omset (Rp) belum mencapai Target Minimal (Rp 50 Juta):
    // Lampu TETAP KUNING (NEAR_STANDARD / Grade B) dengan penjelasan transparan.
    if (actuals.closing >= targets.monthly_closing && !isNominalOmsetMet) {
      zone = 'NEAR_STANDARD';
      grade = 'B';
      if (overallPct >= 100) {
        overallPct = 95; // Down-adjust overall % to reflect warning state
      }

      explanationReason = `⚠️ Lampu Tetap Kuning: Kuota ${actuals.closing} Closing tercapai, namun total omset (Rp ${actualClosingAmount.toLocaleString('id-ID')}) belum memenuhi target minimal nominal Rp ${targetClosingAmount.toLocaleString('id-ID')}. Diperlukan Upselling paket produk.`;
      
      payrollImpactExplanation = `💰 Dampak Struktur Gaji: Gaji Pokok & Transport Harian cair 100%. Komisi Insentif Deal cair proporsional sesuai nominal omset riil (Rp ${actualClosingAmount.toLocaleString('id-ID')}), komisi penuh terkunci s/d target nominal terpenuhi.`;
    } else if (zone === 'OVERACHIEVEMENT' || zone === 'MEETS_STANDARD') {
      explanationReason = `🟢 Lampu Hijau: Kuota Closing (${actuals.closing}/10) dan Nominal Omset (Rp ${actualClosingAmount.toLocaleString('id-ID')}) telah memenuhi standar baseline.`;
      payrollImpactExplanation = `💰 Dampak Struktur Gaji: Gaji Pokok, Uang Transport, dan 100% Komisi Reward Eligible cair utuh.`;
    } else {
      explanationReason = `🔴 Zona Kritis Kinerja: Capaian di bawah standar. Diperlukan Sesi Coaching dengan Manager/Owner.`;
      payrollImpactExplanation = `💰 Dampak Struktur Gaji: Gaji Pokok & Transport tetap dibayarkan via presensi valid. Komisi terkunci s/d perbaikan kinerja & closing.`;
    }

    return {
      cards,
      overallAchievementPct: overallPct,
      zone,
      grade,
      totalPoints: actuals.points || 0,
      isOverachiever: overallPct > 100 && isNominalOmsetMet,
      isStandardMet: overallPct >= 100 && isNominalOmsetMet,
      closing_amount: actualClosingAmount,
      target_closing_amount: targetClosingAmount,
      is_nominal_omset_met: isNominalOmsetMet,
      explanation_reason: explanationReason,
      payroll_impact_explanation: payrollImpactExplanation
    };
  }
}
