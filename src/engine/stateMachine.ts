import type { ProspectStatus, PipelineStage, DealLifecycleStatus } from '../types/database';

export class StateMachineEngine {
  // Validate Prospect Pipeline Stage Transition
  public static canTransitionStage(currentStage: PipelineStage, nextStage: PipelineStage): boolean {
    const allowedTransitions: Record<PipelineStage, PipelineStage[]> = {
      PROSPECT: ['QUALIFIED', 'DISCOVERY'],
      QUALIFIED: ['DISCOVERY', 'PROSPECT'],
      DISCOVERY: ['DEMO', 'QUALIFIED', 'PROSPECT'],
      DEMO: ['PROPOSAL', 'DISCOVERY'],
      PROPOSAL: ['NEGOTIATION', 'WON', 'DEMO'],
      NEGOTIATION: ['WON', 'PROPOSAL'],
      WON: ['PENDING_CS', 'PENDING_FINANCE'],
      PENDING_CS: ['PENDING_FINANCE', 'ACTIVE_TENANT'],
      PENDING_FINANCE: ['ACTIVE_TENANT'],
      ACTIVE_TENANT: []
    };

    return allowedTransitions[currentStage]?.includes(nextStage) ?? false;
  }

  // Validate Prospect Status Transition
  public static canTransitionProspectStatus(currentStatus: ProspectStatus, nextStatus: ProspectStatus): boolean {
    if (currentStatus === 'MENOLAK') return false; // Rejected leads require manager override
    if (currentStatus === 'LOCKING' && nextStatus !== 'ACTIVE') return false;

    return true; // Allow valid transitions between ACTIVE, FOLLOWUP_1..5, NURTURE, CLOSING, MENOLAK
  }

  // Validate Deal Lifecycle Handoff Transition
  public static canTransitionDealStatus(
    currentStatus: DealLifecycleStatus,
    nextStatus: DealLifecycleStatus,
    actorRole: string
  ): { allowed: boolean; reason?: string } {
    if (currentStatus === 'CANCELLED') {
      return { allowed: false, reason: 'Deal sudah dibatalkan dan tidak dapat diubah.' };
    }

    if (currentStatus === 'CLOSED_PENDING' && nextStatus === 'PENDING_CS') {
      return { allowed: true };
    }

    if (currentStatus === 'PENDING_CS' && nextStatus === 'PENDING_FINANCE') {
      if (!['cs', 'manager', 'founder', 'super_admin'].includes(actorRole)) {
        return { allowed: false, reason: 'Hanya CS / Operations yang dapat memverifikasi implementasi.' };
      }
      return { allowed: true };
    }

    if (currentStatus === 'PENDING_FINANCE' && nextStatus === 'READY_FOR_ACTIVATION') {
      if (!['finance', 'manager', 'founder', 'super_admin'].includes(actorRole)) {
        return { allowed: false, reason: 'Hanya Divisi Keuangan (Finance) yang dapat memverifikasi pembayaran.' };
      }
      return { allowed: true };
    }

    if (currentStatus === 'READY_FOR_ACTIVATION' && nextStatus === 'ACTIVE_TENANT') {
      if (!['super_admin', 'founder'].includes(actorRole)) {
        return { allowed: false, reason: 'Hanya Super Admin / Founder yang memiliki otoritas mengaktifkan aplikasi.' };
      }
      return { allowed: true };
    }

    if (nextStatus === 'REWARD_ELIGIBLE') {
      if (currentStatus !== 'ACTIVE_TENANT') {
        return { allowed: false, reason: 'Reward hanya eligible setelah aplikasi aktif & tidak ada pembatalan.' };
      }
      return { allowed: true };
    }

    if (nextStatus === 'CANCELLED') {
      return { allowed: true };
    }

    return { allowed: false, reason: 'Transisi status deal tidak diizinkan.' };
  }
}
