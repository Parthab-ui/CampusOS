export type EffortLevel = 'instant' | 'easy' | 'moderate' | 'contract_negotiation';

export type SavingsActionType =
  | 'cancel_zombie'
  | 'downgrade_tier'
  | 'switch_to_annual'
  | 'annual_switch'
  | 'eliminate_duplicate'
  | 'negotiate_rate'
  | 'family_team_bundle'
  | 'consolidate'
  | 'cancel_trial';

export interface SavingsOpportunity {
  id: string;
  title: string;
  description: string;
  actionType: SavingsActionType;
  effortLevel: EffortLevel;
  potentialMonthlySavings: number;
  potentialAnnualSavings: number;
  currency: string;
  category?: string;
  annualizedRoi?: number; // e.g. % return or relative impact
  implementationTimeEstimate?: string;
  riskOfServiceInterruption?: 'none' | 'low' | 'medium';
  subscriptionIds: string[];
  subscriptionNames: string[];
  difficultyScore: number; // 1 (easiest) to 5 (most friction)
  recommendedNextStep: string;
  stepByStepGuide?: string[];
  actionTemplate?: string; // Pre-written email/ticket template ready to copy
  isApplied: boolean;
}

export interface SavingsSummary {
  totalIdentifiedAnnualSavings: number;
  totalIdentifiedMonthlySavings: number;
  quickWinSavingsAnnual: number; // Easy + Instant opportunities
  realizedAnnualSavings: number;
  realizedMonthlySavings: number;
  opportunitiesCount: number;
  appliedCount: number;
  savingsByCategory?: Record<string, number>;
}

export interface SavingsSimulationResult {
  currentMrr: number;
  projectedMrr: number;
  currentArr: number;
  projectedArr: number;
  netSavingsAnnual: number;
  projectedHealthScore: number;
}
