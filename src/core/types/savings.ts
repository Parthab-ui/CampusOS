export type EffortLevel = 'instant' | 'easy' | 'moderate' | 'contract_negotiation';

export type SavingsActionType =
  | 'cancel_zombie'
  | 'downgrade_tier'
  | 'switch_to_annual'
  | 'annual_switch'
  | 'eliminate_duplicate'
  | 'negotiate_rate'
  | 'family_team_bundle'
  | 'consolidate';

export interface SavingsOpportunity {
  id: string;
  title: string;
  description: string;
  actionType: SavingsActionType;
  effortLevel: EffortLevel;
  potentialMonthlySavings: number;
  potentialAnnualSavings: number;
  currency: string;
  subscriptionIds: string[];
  subscriptionNames: string[];
  difficultyScore: number; // 1 (easiest) to 5 (most friction)
  recommendedNextStep: string;
  isApplied: boolean;
}

export interface SavingsSummary {
  totalIdentifiedAnnualSavings: number;
  totalIdentifiedMonthlySavings: number;
  quickWinSavingsAnnual: number; // Easy + Instant opportunities
  opportunitiesCount: number;
}
