import type { KPITargetsConfig, SLAConfig, PerformanceZoneConfig, PointRulesConfig } from '../types/database';

const DEFAULT_KPI_TARGETS: KPITargetsConfig = {
  daily_prospect_contact: 10,
  monthly_prospect: 50,
  monthly_discovery: 20,
  monthly_demo: 10,
  monthly_proposal: 5,
  monthly_closing: 2
};

const DEFAULT_SLA_CONFIG: SLAConfig = {
  anchor_event: 'DEMO',
  sla_hours: 48
};

const DEFAULT_PERFORMANCE_ZONES: PerformanceZoneConfig[] = [
  { min_pct: 101, zone: 'OVERACHIEVEMENT', grade: 'A+' },
  { min_pct: 100, max_pct: 100, zone: 'MEETS_STANDARD', grade: 'A' },
  { min_pct: 80, max_pct: 99, zone: 'NEAR_STANDARD', grade: 'B' },
  { min_pct: 70, max_pct: 79, zone: 'BELOW_STANDARD', grade: 'C' },
  { min_pct: 0, max_pct: 69, zone: 'CRITICAL', grade: 'D' }
];

const DEFAULT_POINT_RULES: PointRulesConfig = {
  prospect_valid: 10,
  followup_valid: 5,
  discovery_valid: 25,
  demo_valid: 50,
  proposal_valid: 75,
  closing_valid: 200
};

class ConfigEngine {
  private kpiTargets: KPITargetsConfig = { ...DEFAULT_KPI_TARGETS };
  private slaConfig: SLAConfig = { ...DEFAULT_SLA_CONFIG };
  private performanceZones: PerformanceZoneConfig[] = [...DEFAULT_PERFORMANCE_ZONES];
  private pointRules: PointRulesConfig = { ...DEFAULT_POINT_RULES };

  public getKPITargets(): KPITargetsConfig {
    return { ...this.kpiTargets };
  }

  public setKPITargets(newTargets: Partial<KPITargetsConfig>): void {
    this.kpiTargets = { ...this.kpiTargets, ...newTargets };
  }

  public getSLAConfig(): SLAConfig {
    return { ...this.slaConfig };
  }

  public setSLAConfig(newSLA: Partial<SLAConfig>): void {
    this.slaConfig = { ...this.slaConfig, ...newSLA };
  }

  public getPerformanceZones(): PerformanceZoneConfig[] {
    return [...this.performanceZones];
  }

  public setPerformanceZones(zones: PerformanceZoneConfig[]): void {
    this.performanceZones = zones;
  }

  public getPointRules(): PointRulesConfig {
    return { ...this.pointRules };
  }

  public setPointRules(rules: Partial<PointRulesConfig>): void {
    this.pointRules = { ...this.pointRules, ...rules };
  }

  public calculateGradeAndZone(achievementPct: number): { zone: PerformanceZoneConfig['zone']; grade: PerformanceZoneConfig['grade'] } {
    const sorted = [...this.performanceZones].sort((a, b) => b.min_pct - a.min_pct);
    for (const z of sorted) {
      if (achievementPct >= z.min_pct) {
        if (z.max_pct !== undefined && achievementPct > z.max_pct) {
          continue;
        }
        return { zone: z.zone, grade: z.grade };
      }
    }
    return { zone: 'CRITICAL', grade: 'D' };
  }
}

export const configEngine = new ConfigEngine();
