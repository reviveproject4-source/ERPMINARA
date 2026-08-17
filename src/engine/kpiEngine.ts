import { configEngine } from './configEngine';
import type { Grade, PerformanceZone, SalesLevel, ProductCommissionBreakdown } from '../types/database';

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
  sales_level: SalesLevel;
  totalPoints: number;
  isOverachiever: boolean;
  isStandardMet: boolean;
  
  // Product-Specific Commission Breakdown (PILIN, CeritaAnanda, Kabarsantri)
  product_commissions: ProductCommissionBreakdown[];
  total_closing_commission_5pct: number;
  total_subscription_commission_2pct: number;
  total_renewal_commission_2pct: number;
  total_commission_all_products: number;

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
    sales_level?: SalesLevel;
    
    // Product-Specific Deal Amounts & Counts
    pilin_amount?: number;
    ceritaananda_amount?: number;
    ceritaananda_count?: number;
    kabarsantri_initial_amount?: number;
    kabarsantri_subscription_month2_6_amount?: number;
    kabarsantri_renewal_month7_amount?: number;

    closing_amount?: number;
    target_closing_amount?: number;
    points?: number;
  }): KPIOverallScorecard {
    const level: SalesLevel = actuals.sales_level || 'MID_LEVEL';
    const targets = configEngine.getKPITargets(level);

    const pilinAmt = actuals.pilin_amount || 0;
    const caTotalAmt = actuals.ceritaananda_amount || 0;
    const caCount = actuals.ceritaananda_count || (caTotalAmt > 0 ? Math.max(1, Math.floor(caTotalAmt / 3500000)) : 0);

    // CERITAANANDA FIXED RULE:
    // Biaya Implementasi = Rp 1.000.000 / TK
    // Biaya Subscription = Sisa Total Deal (caTotalAmt - caImplementationAmt)
    const caImplementationAmt = caCount * 1000000; 
    const caSubscriptionAmt = Math.max(0, caTotalAmt - caImplementationAmt);

    const ksInitialAmt = actuals.kabarsantri_initial_amount || 0;
    const ksSubMonth2_6Amt = actuals.kabarsantri_subscription_month2_6_amount || 0;
    const ksRenewalMonth7Amt = actuals.kabarsantri_renewal_month7_amount || 0;

    const totalClosingAmount = actuals.closing_amount || (pilinAmt + caTotalAmt + ksInitialAmt + ksSubMonth2_6Amt + ksRenewalMonth7Amt);
    const targetClosingAmount = actuals.target_closing_amount || targets.target_closing_amount;

    // PRODUCT-SPECIFIC COMMISSION CALCULATIONS (Minara Rules):
    // 1. PILIN: TIDAK ADA Implementasi ($0). HANYA Subscription (Komisi 5% dari Subscription).
    const pilinComm: ProductCommissionBreakdown = {
      product: 'Pilin',
      implementation_amount: 0,
      subscription_amount: pilinAmt,
      implementation_commission_5pct: 0,
      subscription_commission_2pct: pilinAmt * 0.05, // 5% dari Subscription PILIN
      renewal_commission_2pct: 0,
      total_commission: pilinAmt * 0.05
    };

    // 2. CeritaAnanda: Implementasi Fixed Rp 1 Juta/TK. Sales dapat 5% Implementasi + 5% Subscription.
    const caComm: ProductCommissionBreakdown = {
      product: 'CeritaAnanda',
      implementation_amount: caImplementationAmt,
      subscription_amount: caSubscriptionAmt,
      implementation_commission_5pct: caImplementationAmt * 0.05, // 5% x Rp 1 Juta = Rp 50.000 / TK
      subscription_commission_2pct: caSubscriptionAmt * 0.05,     // 5% x Biaya Subscription
      renewal_commission_2pct: 0,
      total_commission: (caImplementationAmt * 0.05) + (caSubscriptionAmt * 0.05)
    };

    // 3. Kabarsantri: 5% Aktivasi Initial (Bulan 1) + 2% Subscription (Bulan 2-6) + 2% Perpanjangan (Bulan 7+)
    const ksComm: ProductCommissionBreakdown = {
      product: 'Kabarsantri',
      implementation_amount: ksInitialAmt,
      subscription_amount: ksSubMonth2_6Amt + ksRenewalMonth7Amt,
      implementation_commission_5pct: ksInitialAmt * 0.05,
      subscription_commission_2pct: ksSubMonth2_6Amt * 0.02,
      renewal_commission_2pct: ksRenewalMonth7Amt * 0.02,
      total_commission: (ksInitialAmt * 0.05) + (ksSubMonth2_6Amt * 0.02) + (ksRenewalMonth7Amt * 0.02)
    };

    const productCommissions = [pilinComm, caComm, ksComm];
    const totalClosingComm = caComm.implementation_commission_5pct + ksComm.implementation_commission_5pct;
    const totalSubComm = pilinComm.subscription_commission_2pct + caComm.subscription_commission_2pct + ksComm.subscription_commission_2pct;
    const totalRenewalComm = ksComm.renewal_commission_2pct;
    const totalCommissionAll = totalClosingComm + totalSubComm + totalRenewalComm;

    const calcCard = (key: string, label: string, actual: number, target: number): KPICardScore => {
      const pct = target > 0 ? Math.round((actual / target) * 100) : 0;
      let status: 'OVERACHIEVEMENT' | 'MEETS_STANDARD' | 'BELOW_STANDARD' = 'BELOW_STANDARD';
      if (pct > 100) status = 'OVERACHIEVEMENT';
      else if (pct >= 100) status = 'MEETS_STANDARD';
      return { key, label, actual, target, achievementPct: pct, status };
    };

    const cards: Record<string, KPICardScore> = {
      prospek: calcCard('prospek', 'Data Prospek (10%)', actuals.prospek, targets.monthly_prospect),
      discovery: calcCard('discovery', 'Discovery (10%)', actuals.discovery, targets.monthly_discovery),
      demo: calcCard('demo', 'Demo SOP (15%)', actuals.demo, targets.monthly_demo),
      proposal: calcCard('proposal', 'Proposal SLA (15%)', actuals.proposal, targets.monthly_proposal),
      closing: calcCard('closing', 'Closing Deal (50%)', actuals.closing, targets.monthly_closing),
    };

    // MINARA BIBLE WEIGHTS DISTRIBUTION (TOTAL 100%):
    // Data Prospek (10%) - Discovery (10%) - Demo (15%) - Proposal (15%) - Closing (50%)
    const weights = { 
      prospek: 0.10, 
      discovery: 0.10, 
      demo: 0.15, 
      proposal: 0.15, 
      closing: 0.50 
    };

    let weightedSum = 0;
    Object.entries(weights).forEach(([k, w]) => {
      const cardPct = cards[k]?.achievementPct || 0;
      weightedSum += cardPct * w;
    });

    let overallPct = Math.round(weightedSum);
    let { zone, grade } = configEngine.calculateGradeAndZone(overallPct);
    
    const isNominalOmsetMet = totalClosingAmount >= targetClosingAmount;
    let explanationReason = undefined;
    let payrollImpactExplanation = undefined;

    // OPSI B & MINARA BIBLE IMPLEMENTATION:
    if (actuals.closing >= targets.monthly_closing && !isNominalOmsetMet) {
      zone = 'NEAR_STANDARD';
      grade = 'B';
      if (overallPct >= 100) {
        overallPct = 95;
      }

      explanationReason = `⚠️ Lampu Tetap Kuning (${level} Level): Kuota ${actuals.closing}/${targets.monthly_closing} Closing tercapai, namun total omset (Rp ${totalClosingAmount.toLocaleString('id-ID')}) belum mencapai target nominal Rp ${targetClosingAmount.toLocaleString('id-ID')}. Diperlukan Upselling.`;
      
      payrollImpactExplanation = `💰 Dampak Struktur Gaji Divisi Keuangan: Gaji Pokok & Transport Harian cair 100%. Komisi PILIN 5% Subscription, CeritaAnanda 5% (Implementasi Rp 1Jt + Subscription), & Kabarsantri (5%/2%/2%) total Rp ${totalCommissionAll.toLocaleString('id-ID')} cair dari omset riil.`;
    } else if (zone === 'OVERACHIEVEMENT' || zone === 'MEETS_STANDARD') {
      explanationReason = `🟢 Lampu Hijau (${level} Level): Kuota Closing (${actuals.closing}/${targets.monthly_closing}) dan Omset Nominal (Rp ${totalClosingAmount.toLocaleString('id-ID')}) telah memenuhi standar.`;
      payrollImpactExplanation = `💰 Dampak Struktur Gaji Divisi Keuangan: Gaji Pokok, Uang Transport, & Total Komisi Produk (Rp ${totalCommissionAll.toLocaleString('id-ID')}) cair utuh.`;
    } else {
      explanationReason = `🔴 Zona Kritis Kinerja (${level} Level): Capaian di bawah standar. Diperlukan Sesi Coaching.`;
      payrollImpactExplanation = `💰 Dampak Struktur Gaji Divisi Keuangan: Gaji Pokok & Transport dibayarkan via presensi valid. Komisi terkunci s/d perbaikan kinerja & closing.`;
    }

    return {
      cards,
      overallAchievementPct: overallPct,
      zone,
      grade,
      sales_level: level,
      totalPoints: actuals.points || 0,
      isOverachiever: overallPct > 100 && isNominalOmsetMet,
      isStandardMet: overallPct >= 100 && isNominalOmsetMet,
      product_commissions: productCommissions,
      total_closing_commission_5pct: totalClosingComm,
      total_subscription_commission_2pct: totalSubComm,
      total_renewal_commission_2pct: totalRenewalComm,
      total_commission_all_products: totalCommissionAll,
      closing_amount: totalClosingAmount,
      target_closing_amount: targetClosingAmount,
      is_nominal_omset_met: isNominalOmsetMet,
      explanation_reason: explanationReason,
      payroll_impact_explanation: payrollImpactExplanation
    };
  }
}
