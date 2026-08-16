import type { Prospect, ProposalRecord } from '../types/database';

export interface CoachingSignalItem {
  id: string;
  type: 'CONVERSION_DISCOVERY_DEMO' | 'CONVERSION_PROPOSAL_CLOSING' | 'QUALIFICATION_APPROACH' | 'SLA_PROPOSAL_OVERDUE' | 'DORMANT_WARNING';
  title: string;
  message: string;
  recommendation: string;
  severity: 'warning' | 'info' | 'critical';
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
        recommendation: 'Perlu review pada sesi coaching terkait teknik pendekatan awal dan kualifikasi target pesantren.',
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
        recommendation: 'Disarankan melakukan review sesi coaching pada pencatatan kendala utama pesantren saat Discovery.',
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
        recommendation: 'Perlu review struktur penawaran paket Minara ERP dan follow-up pengambil keputusan Kiai/Pengasuh.',
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
}
