import type { Prospect, ProposalRecord, DealRecord, Employee, Grade, PerformanceZone } from '../types/database';
import { KPIEngine } from './kpiEngine';

export interface CoachingSignalItem {
  id: string;
  type: 'CONVERSION_DISCOVERY_DEMO' | 'CONVERSION_PROPOSAL_CLOSING' | 'QUALIFICATION_APPROACH' | 'SLA_PROPOSAL_OVERDUE' | 'DORMANT_WARNING' | 'SALES_CRITICAL_ZONE';
  title: string;
  message: string;
  recommendation: string;
  severity: 'warning' | 'info' | 'critical';
}

export interface SalesCriticalZoneRecord {
  id: string;
  sales_id: string;
  sales_name: string;
  sales_avatar?: string;
  detected_at: string; // KAPAN Terdeteksi Zona Kritis
  achievement_pct: number;
  grade: Grade;
  zone: PerformanceZone;
  prospek_count: number;
  closing_count: number;
  reason: string;
  recommendation: string;
  status: 'NEEDS_COACHING' | 'COACHING_IN_PROGRESS' | 'RESOLVED';
}

export class CoachingEngine {
  public static generateSignals(
    prospects: Prospect[],
    proposals: ProposalRecord[],
    stats: { prospek: number; discovery: number; demo: number; proposal: number; closing: number }
  ): CoachingSignalItem[] {
    const signals: CoachingSignalItem[] = [];

    // 1. Prospek tinggi tetapi Discovery rendah
    if (stats.prospek > 30 && stats.discovery < 5) {
      signals.push({
        id: 'cs-1',
        type: 'QUALIFICATION_APPROACH',
        title: 'Area for Review: Prospek vs Discovery',
        message: `Jumlah Prospek tinggi (${stats.prospek}), tetapi Discovery Meeting rendah (${stats.discovery}).`,
        recommendation: 'Perlu review pada sesi coaching terkait teknik pendekatan awal dan kualifikasi target.',
        severity: 'warning'
      });
    }

    // 2. Discovery tinggi tetapi Demo rendah
    if (stats.discovery > 10 && stats.demo < 3) {
      signals.push({
        id: 'cs-2',
        type: 'CONVERSION_DISCOVERY_DEMO',
        title: 'Area for Review: Conversion Discovery → Demo',
        message: `Conversion Discovery (${stats.discovery}) ke Demo Produk (${stats.demo}) berada di bawah benchmark.`,
        recommendation: 'Disarankan melakukan review sesi coaching pada pencatatan kendala utama calon klien saat Discovery.',
        severity: 'warning'
      });
    }

    // 3. Proposal tinggi tetapi Closing rendah
    if (stats.proposal > 5 && stats.closing === 0) {
      signals.push({
        id: 'cs-3',
        type: 'CONVERSION_PROPOSAL_CLOSING',
        title: 'Area for Review: Conversion Proposal → Closing',
        message: `Proposal terkirim (${stats.proposal}) belum menghasilkan Closing.`,
        recommendation: 'Perlu review struktur penawaran paket Minara dan follow-up pengambil keputusan.',
        severity: 'critical'
      });
    }

    // 4. Check Proposal SLA Overdues
    const overdueProposals = proposals.filter(p => p.is_overdue || p.status === 'SENT');
    if (overdueProposals.length > 0) {
      signals.push({
        id: 'cs-4',
        type: 'SLA_PROPOSAL_OVERDUE',
        title: 'SLA Warning: Proposal Overdue Target',
        message: `Terdapat ${overdueProposals.length} proposal yang mendekati / melewati batas SLA jam pengiriman.`,
        recommendation: 'Pastikan proposal segera dikirimkan dan konfirmasi penerimaan oleh pihak lembaga.',
        severity: 'critical'
      });
    }

    // 5. Check Dormant Prospects
    const dormantProspects = prospects.filter(p => p.status === 'DORMANT' || p.aging_days > 14);
    if (dormantProspects.length > 0) {
      signals.push({
        id: 'cs-5',
        type: 'DORMANT_WARNING',
        title: 'Area for Review: Prospek Mendekati Dormant',
        message: `Terdapat ${dormantProspects.length} prospek dengan masa tidak aktif (aging) > 14 hari.`,
        recommendation: 'Evaluasi apakah prospek dialihkan ke status Nurture atau dikunci ulang oleh sistem.',
        severity: 'info'
      });
    }

    return signals;
  }

  // AUDIT ZONA KRITIS KINERJA UNTUK OWNER & MANAGER
  public static detectCriticalSalesZones(
    employees: Employee[],
    allProspects: Prospect[],
    allDeals: DealRecord[],
    allProposals: ProposalRecord[]
  ): SalesCriticalZoneRecord[] {
    const salesEmployees = employees.filter(e => e.role === 'sales');
    const records: SalesCriticalZoneRecord[] = [];

    salesEmployees.forEach(sales => {
      const salesProspects = allProspects.filter(p => p.sales_owner_id === sales.id);
      const salesDeals = allDeals.filter(d => d.sales_id === sales.id && d.status !== 'CANCELLED');
      const salesProposals = allProposals.filter(p => p.sales_id === sales.id);

      const prospekCount = salesProspects.length;
      const followupCount = salesProspects.reduce((acc, p) => acc + p.followup_count, 0);
      const discoveryCount = salesProspects.filter(p => ['DISCOVERY', 'DEMO', 'PROPOSAL', 'NEGOTIATION', 'WON'].includes(p.pipeline_stage)).length;
      const demoCount = salesProspects.filter(p => ['DEMO', 'PROPOSAL', 'NEGOTIATION', 'WON'].includes(p.pipeline_stage)).length;
      const proposalCount = salesProposals.length;
      const closingCount = salesDeals.length;

      const scorecard = KPIEngine.calculateScorecard({
        prospek: prospekCount,
        followup: followupCount,
        discovery: discoveryCount,
        demo: demoCount,
        proposal: proposalCount,
        closing: closingCount
      });

      // Deteksi Zona Kritis (< 70% atau Grade D)
      if (scorecard.overallAchievementPct < 70 || scorecard.grade === 'D' || scorecard.zone === 'CRITICAL') {
        let recommendation = 'Lakukan pendampingan langsung pada sesi Demo SOP & bantu pengawalan Follow-up Cadence.';
        if (prospekCount < 50) {
          recommendation = 'Fokus Coaching: Pendampingan Kanvasing Direct & Evaluasi Alamat/GPS Terverifikasi.';
        } else if (discoveryCount < 20) {
          recommendation = 'Fokus Coaching: Evaluasi Teknik Discovery Meeting & Identifikasi Masalah Klien.';
        } else if (closingCount === 0) {
          recommendation = 'Fokus Coaching: Pendampingan Sesi Closing & Penguncian Keputusan Klien.';
        }

        records.push({
          id: `crit-${sales.id}`,
          sales_id: sales.id,
          sales_name: sales.name,
          sales_avatar: sales.avatar,
          detected_at: new Date().toISOString(),
          achievement_pct: scorecard.overallAchievementPct,
          grade: scorecard.grade,
          zone: scorecard.zone,
          prospek_count: prospekCount,
          closing_count: closingCount,
          reason: `Capaian Kinerja di Zona Kritis (${scorecard.overallAchievementPct}% - Grade ${scorecard.grade}). Prospek: ${prospekCount}/250, Closing: ${closingCount}/10.`,
          recommendation,
          status: 'NEEDS_COACHING'
        });
      }
    });

    return records;
  }
}
