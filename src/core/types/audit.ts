export type AuditAnomalyType =
  | 'price_hike'
  | 'duplicate_billing'
  | 'zombie_subscription'
  | 'trial_ending_soon'
  | 'hidden_fee_spike'
  | 'unusual_cadence'
  | 'redundant_service';

export type AuditSeverity = 'low' | 'medium' | 'high' | 'critical';

export type AuditIssueStatus = 'open' | 'investigating' | 'resolved' | 'dismissed';

export interface AuditIssue {
  id: string;
  type: AuditAnomalyType;
  severity: AuditSeverity;
  status: AuditIssueStatus;
  title: string;
  description: string;
  detectedAt: string; // ISO date
  impactMonthly: number;
  impactAnnual: number;
  currency: string;
  subscriptionId?: string;
  subscriptionName?: string;
  relatedTransactionIds?: string[];
  recommendedAction: string;
  potentialSavings: number;
  metadata?: Record<string, unknown>;
}

export interface AuditSummary {
  healthScore: number; // 0 to 100
  totalOpenIssues: number;
  criticalIssuesCount: number;
  highIssuesCount: number;
  totalAnnualLeakage: number;
  totalMonthlyLeakage: number;
  resolvedIssuesCount: number;
}
