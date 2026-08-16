import type { CSKPIScorecard } from '../types/database';
import { configEngine } from './configEngine';

export class CSKPIEngine {
  public static calculateScorecard(actuals: {
    responseTimeMinutes: number; // target <= 15 min
    ticketResolutionPct: number; // target >= 90%
    csatScore: number;            // target >= 4.8 (out of 5.0)
    adoptionPct: number;          // target 100%
    retentionPct: number;         // target 100%
    onboardingPct: number;        // target 100%
    reactivationCount: number;    // target 100 db / month
    bugFeedbackCount: number;     // target 10
    reportingSubmitted: boolean;
  }): CSKPIScorecard {

    // Response time: <= 15 mins gets 100%
    const respPct = actuals.responseTimeMinutes <= 15 ? 100 : Math.max(0, Math.round((15 / actuals.responseTimeMinutes) * 100));
    // Ticket resolution: >= 90%
    const tickPct = Math.min(100, Math.round((actuals.ticketResolutionPct / 90) * 100));
    // CSAT: 4.8 out of 5.0
    const csatPct = Math.min(100, Math.round((actuals.csatScore / 4.8) * 100));
    // Adoption
    const adoptPct = Math.min(100, actuals.adoptionPct);
    // Retention
    const retPct = Math.min(100, actuals.retentionPct);
    // Onboarding
    const onbPct = Math.min(100, actuals.onboardingPct);
    // Reactivation: 100 / month
    const reactPct = Math.min(100, Math.round((actuals.reactivationCount / 100) * 100));
    // Bug feedback: 10 / month
    const bugPct = Math.min(100, Math.round((actuals.bugFeedbackCount / 10) * 100));
    // Reporting: 100% if submitted
    const repPct = actuals.reportingSubmitted ? 100 : 0;

    const cards = {
      responseTime: { actual: actuals.responseTimeMinutes, target: 15, pct: respPct, weight: 0.10 },
      ticketResolution: { actual: actuals.ticketResolutionPct, target: 90, pct: tickPct, weight: 0.20 },
      csat: { actual: actuals.csatScore, target: 4.8, pct: csatPct, weight: 0.15 },
      adoption: { actual: actuals.adoptionPct, target: 100, pct: adoptPct, weight: 0.10 },
      retention: { actual: actuals.retentionPct, target: 100, pct: retPct, weight: 0.10 },
      onboarding: { actual: actuals.onboardingPct, target: 100, pct: onbPct, weight: 0.10 },
      reactivation: { actual: actuals.reactivationCount, target: 100, pct: reactPct, weight: 0.15 },
      bugFeedback: { actual: actuals.bugFeedbackCount, target: 10, pct: bugPct, weight: 0.05 },
      reporting: { actual: actuals.reportingSubmitted ? 1 : 0, target: 1, pct: repPct, weight: 0.05 }
    };

    let overallSum = 0;
    Object.values(cards).forEach(c => {
      overallSum += c.pct * c.weight;
    });

    const overallPct = Math.round(overallSum);
    const { zone, grade } = configEngine.calculateGradeAndZone(overallPct);

    return {
      cards,
      overallPct,
      zone,
      grade
    };
  }
}
