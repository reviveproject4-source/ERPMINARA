import { configEngine } from './configEngine';
import type { Grade, PerformanceZone, SalesLevel, ProductCommissionBreakdown, PilinCommercialBreakdown } from '../types/database';
import { PILIN_COMMERCIAL_RULES } from '../types/database';

export interface KPICardScore {
  key: string;
  label: string;
  actual: number;
  target: number;
  achievementPct: number;
  status: 'OVERACHIEVEMENT' | 'MEETS_STANDARD' | 'BELOW_STANDARD';
}

export interface Management12Answers {
  q1_valid_contacts: number;
  q2_qualified_leads: number;
  q3_discovery_count: number;
  q4_demo_count: number;
  q5_activated_customers: number;
  q6_activation_revenue: number;
  q7_feature_revenue: number;
  q8_expansion_revenue: number;
  q9_deposit_collected: number;
  q10_wa_usage_generated: number;
  q11_commission_payable: number;
  q12_conversion_rates: {
    prospect_to_qualified_pct: number;
    qualified_to_discovery_pct: number;
    discovery_to_demo_pct: number;
    demo_to_proposal_pct: number;
    proposal_to_activated_pct: number;
    overall_funnel_conversion_pct: number;
  };
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
  pilin_breakdown: PilinCommercialBreakdown;
  
  // MINARA V1 Authoritative Calculations
  activation_sales: number;
  feature_sales: number;
  expansion_sales: number;
  deposit_collected: number;
  wa_usage_generated: number;
  total_cash_collected: number;
  commissionable_revenue: number;
  total_commission_payable: number;
  total_commission_all_products: number;

  management_12_answers: Management12Answers;

  closing_amount: number;
  target_closing_amount: number;
  is_nominal_omset_met: boolean;
  explanation_reason?: string;
  payroll_impact_explanation?: string;
}

export class KPIEngine {
  public static calculateScorecard(actuals: {
    prospek: number;
    qualified?: number;
    followup: number;
    discovery: number;
    demo: number;
    proposal: number;
    closing: number; // Activated Customers count
    sales_level?: SalesLevel;
    
    // PILIN Commercial V1 Inputs
    activated_customers_count?: number;
    feature_subscriptions_amount?: number;
    expansion_sales_amount?: number;
    deposit_collected_amount?: number;
    wa_messages_count?: number;

    // Product-Specific Deal Amounts
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

    const validContacts = actuals.prospek;
    const qualifiedLeads = actuals.qualified || Math.round(actuals.prospek * 0.5);
    const activatedCustomers = actuals.activated_customers_count || actuals.closing;

    // ==========================================
    // MINARA V1 AUTHORITATIVE REVENUE CALCULATION
    // ==========================================
    // 1. Activation Fee: Rp 1,000,000 per Activated Customer
    const activationSales = activatedCustomers * PILIN_COMMERCIAL_RULES.ACTIVATION_FEE;
    const activationCommission = activationSales * PILIN_COMMERCIAL_RULES.COMMISSION_RATE; // 5% = Rp 50k per customer

    // 2. Feature Subscription Sales & Expansion Sales
    const featureSales = actuals.feature_subscriptions_amount || (actuals.pilin_amount ? actuals.pilin_amount * 0.4 : 0);
    const featureCommission = featureSales * PILIN_COMMERCIAL_RULES.COMMISSION_RATE; // 5%

    const expansionSales = actuals.expansion_sales_amount || 0;
    const expansionCommission = expansionSales * PILIN_COMMERCIAL_RULES.COMMISSION_RATE; // 5%

    // 3. Excluded Revenue Items (0% Commission)
    const depositCollected = actuals.deposit_collected_amount || (activatedCustomers * PILIN_COMMERCIAL_RULES.MIN_DEPOSIT_SALDO);
    const depositCommission = 0; // Strictly Rp 0

    const waMessagesCount = actuals.wa_messages_count || 0;
    const waUsageAmount = waMessagesCount * PILIN_COMMERCIAL_RULES.WA_MESSAGE_PRICE;
    const waUsageCommission = 0; // Strictly Rp 0

    // 4. Totals
    const totalCashCollected = activationSales + featureSales + depositCollected;
    const commissionableRevenue = activationSales + featureSales + expansionSales;
    const totalCommissionPayable = activationCommission + featureCommission + expansionCommission;

    const pilinBreakdown: PilinCommercialBreakdown = {
      activation_fee: activationSales,
      activation_commission: activationCommission,
      feature_subscription_total: featureSales,
      feature_commission: featureCommission,
      expansion_sales_total: expansionSales,
      expansion_commission: expansionCommission,
      deposit_collected: depositCollected,
      deposit_commission: depositCommission,
      wa_usage_amount: waUsageAmount,
      wa_usage_commission: waUsageCommission,
      total_cash_collected: totalCashCollected,
      commissionable_revenue: commissionableRevenue,
      total_commission_payable: totalCommissionPayable
    };

    // Other Product Breakdown
    const caTotalAmt = actuals.ceritaananda_amount || 0;
    const caCount = actuals.ceritaananda_count || (caTotalAmt > 0 ? Math.max(1, Math.floor(caTotalAmt / 3500000)) : 0);
    const caImplementationAmt = caCount * 1000000;
    const caSubscriptionAmt = Math.max(0, caTotalAmt - caImplementationAmt);

    const ksInitialAmt = actuals.kabarsantri_initial_amount || 0;
    const ksSubMonth2_6Amt = actuals.kabarsantri_subscription_month2_6_amount || 0;
    const ksRenewalMonth7Amt = actuals.kabarsantri_renewal_month7_amount || 0;

    const pilinComm: ProductCommissionBreakdown = {
      product: 'Pilin',
      implementation_amount: activationSales,
      subscription_amount: featureSales,
      expansion_amount: expansionSales,
      implementation_commission_5pct: activationCommission,
      subscription_commission_2pct: featureCommission,
      expansion_commission_5pct: expansionCommission,
      renewal_commission_2pct: 0,
      total_commission: totalCommissionPayable
    };

    const caComm: ProductCommissionBreakdown = {
      product: 'CeritaAnanda',
      implementation_amount: caImplementationAmt,
      subscription_amount: caSubscriptionAmt,
      implementation_commission_5pct: caImplementationAmt * 0.05,
      subscription_commission_2pct: caSubscriptionAmt * 0.05,
      renewal_commission_2pct: 0,
      total_commission: (caImplementationAmt * 0.05) + (caSubscriptionAmt * 0.05)
    };

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

    // Card Scores
    const calcCard = (key: string, label: string, actual: number, target: number): KPICardScore => {
      const pct = target > 0 ? Math.round((actual / target) * 100) : 0;
      let status: 'OVERACHIEVEMENT' | 'MEETS_STANDARD' | 'BELOW_STANDARD' = 'BELOW_STANDARD';
      if (pct > 100) status = 'OVERACHIEVEMENT';
      else if (pct >= 100) status = 'MEETS_STANDARD';
      return { key, label, actual, target, achievementPct: pct, status };
    };

    const cards: Record<string, KPICardScore> = {
      prospek: calcCard('prospek', 'Valid Contacts (10/day)', validContacts, targets.monthly_prospect),
      discovery: calcCard('discovery', 'Discovery (10%)', actuals.discovery, targets.monthly_discovery),
      demo: calcCard('demo', 'Demo SOP (15%)', actuals.demo, targets.monthly_demo),
      proposal: calcCard('proposal', 'Proposal SLA (15%)', actuals.proposal, targets.monthly_proposal),
      closing: calcCard('closing', 'Activated Customers (50%)', activatedCustomers, targets.monthly_closing),
    };

    const weights = { prospek: 0.10, discovery: 0.10, demo: 0.15, proposal: 0.15, closing: 0.50 };
    let weightedSum = 0;
    Object.entries(weights).forEach(([k, w]) => {
      const cardPct = cards[k]?.achievementPct || 0;
      weightedSum += cardPct * w;
    });

    let overallPct = Math.round(weightedSum);
    let { zone, grade } = configEngine.calculateGradeAndZone(overallPct);
    
    const targetClosingAmount = actuals.target_closing_amount || targets.target_closing_amount;
    const isNominalOmsetMet = commissionableRevenue >= targetClosingAmount;

    // 12 MANAGEMENT QUESTIONS ANSWERS
    const management12Answers: Management12Answers = {
      q1_valid_contacts: validContacts,
      q2_qualified_leads: qualifiedLeads,
      q3_discovery_count: actuals.discovery,
      q4_demo_count: actuals.demo,
      q5_activated_customers: activatedCustomers,
      q6_activation_revenue: activationSales,
      q7_feature_revenue: featureSales,
      q8_expansion_revenue: expansionSales,
      q9_deposit_collected: depositCollected,
      q10_wa_usage_generated: waUsageAmount,
      q11_commission_payable: totalCommissionPayable,
      q12_conversion_rates: {
        prospect_to_qualified_pct: validContacts > 0 ? Math.round((qualifiedLeads / validContacts) * 100) : 0,
        qualified_to_discovery_pct: qualifiedLeads > 0 ? Math.round((actuals.discovery / qualifiedLeads) * 100) : 0,
        discovery_to_demo_pct: actuals.discovery > 0 ? Math.round((actuals.demo / actuals.discovery) * 100) : 0,
        demo_to_proposal_pct: actuals.demo > 0 ? Math.round((actuals.proposal / actuals.demo) * 100) : 0,
        proposal_to_activated_pct: actuals.proposal > 0 ? Math.round((activatedCustomers / actuals.proposal) * 100) : 0,
        overall_funnel_conversion_pct: validContacts > 0 ? Math.round((activatedCustomers / validContacts) * 100) : 0,
      }
    };

    let explanationReason = undefined;
    let payrollImpactExplanation = undefined;

    if (activatedCustomers >= targets.monthly_closing && !isNominalOmsetMet) {
      zone = 'NEAR_STANDARD';
      grade = 'B';
      if (overallPct >= 100) overallPct = 95;

      explanationReason = `⚠️ Lampu Tetap Kuning (${level} Level): Target ${activatedCustomers}/${targets.monthly_closing} Activated Customer tercapai, namun Omset Komisi (Rp ${commissionableRevenue.toLocaleString('id-ID')}) belum mencapai target Rp ${targetClosingAmount.toLocaleString('id-ID')}.`;
      payrollImpactExplanation = `💰 Dampak Struktur Gaji (Minara V1): Gaji Pokok & Transport Harian cair 100%. Komisi 5% Aktivasi (Rp ${activationCommission.toLocaleString('id-ID')}) & Fitur (Rp ${(featureCommission + expansionCommission).toLocaleString('id-ID')}) CAIR SERATUS PERSEN. Saldo Deposit & WA Usage = Rp 0 Komisi.`;
    } else if (zone === 'OVERACHIEVEMENT' || zone === 'MEETS_STANDARD') {
      explanationReason = `🟢 Lampu Hijau (${level} Level): Kuota Activated Customer (${activatedCustomers}/${targets.monthly_closing}) dan Omset Komisi (Rp ${commissionableRevenue.toLocaleString('id-ID')}) telah memenuhi standar.`;
      payrollImpactExplanation = `💰 Dampak Struktur Gaji (Minara V1): Gaji Pokok, Uang Transport, dan 100% Komisi 5% (Rp ${totalCommissionPayable.toLocaleString('id-ID')}) cair utuh. Saldo Deposit & WA Usage = Rp 0 Komisi.`;
    } else {
      explanationReason = `🔴 Zona Kritis Kinerja (${level} Level): Capaian aktivitas/closing di bawah standar. Diperlukan Sesi Coaching.`;
      payrollImpactExplanation = `💰 Dampak Struktur Gaji (Minara V1): Gaji Pokok & Transport dibayarkan via presensi valid. Komisi terkunci s/d perbaikan kinerja & activation.`;
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
      pilin_breakdown: pilinBreakdown,
      activation_sales: activationSales,
      feature_sales: featureSales,
      expansion_sales: expansionSales,
      deposit_collected: depositCollected,
      wa_usage_generated: waUsageAmount,
      total_cash_collected: totalCashCollected,
      commissionable_revenue: commissionableRevenue,
      total_commission_payable: totalCommissionPayable,
      total_commission_all_products: totalCommissionPayable + caComm.total_commission + ksComm.total_commission,
      management_12_answers: management12Answers,
      closing_amount: commissionableRevenue,
      target_closing_amount: targetClosingAmount,
      is_nominal_omset_met: isNominalOmsetMet,
      explanation_reason: explanationReason,
      payroll_impact_explanation: payrollImpactExplanation
    };
  }
}
