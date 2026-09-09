export type AuditAnomalyType =
  | 'price_hike'
  | 'duplicate_billing'
  | 'double_charge'
  | 'zombie_subscription'
  | 'trial_ending_soon'
  | 'renewal_risk'
  | 'hidden_fee_spike'
  | 'unusual_spending_spike'
  | 'expensive_commitment'
  | 'unusual_cadence'
  | 'redundant_service'
  | 'subscription_overlap';

export type AuditSeverity = 'low' | 'medium' | 'high' | 'critical';

export type AuditIssueStatus = 'open' | 'investigating' | 'resolved' | 'dismissed';

export interface AuditForensicEvidence {
  baselineAmount?: number;
  chargedAmount?: number;
  variancePercentage?: number;
  inactivityDays?: number;
  daysToRenewal?: number;
  paymentMethodsInvolved?: string[];
  conflictingTransactions?: {
    id: string;
    date: string;
    amount: number;
    description: string;
    paymentMethod: string;
  }[];
  notes?: string;
}

export interface AuditActionStep {
  stepNumber: number;
  instruction: string;
  templateText?: string;
}

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
  category?: string;
  subscriptionId?: string;
  subscriptionName?: string;
  relatedTransactionIds?: string[];
  recommendedAction: string;
  potentialSavings: number;
  evidence?: AuditForensicEvidence;
  actionPlaybook?: AuditActionStep[];
  disputeTemplate?: string;
  metadata?: Record<string, unknown>;
}

export interface AuditSummary {
  healthScore: number; // 0 to 100
  totalOpenIssues: number;
  criticalIssuesCount: number;
  highIssuesCount: number;
  mediumIssuesCount?: number;
  totalAnnualLeakage: number;
  totalMonthlyLeakage: number;
  resolvedIssuesCount: number;
  leakageByCategory?: Record<string, number>;
  issuesBySeverity?: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}
