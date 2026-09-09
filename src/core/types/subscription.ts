import { TransactionCategory, BillingCadence } from './transaction';

export type BillingCycle = 'weekly' | 'monthly' | 'quarterly' | 'biannual' | 'annual';

export type SubscriptionStatus =
  | 'active'
  | 'trial'
  | 'paused'
  | 'cancelled'
  | 'flagged_for_review';

export type SubscriptionTier = 'free' | 'starter' | 'pro' | 'team' | 'enterprise' | 'family';

export type RiskLevel = 'safe' | 'low' | 'medium' | 'high' | 'critical';

export interface PricePoint {
  date: string;
  amount: number;
  currency: string;
}

export interface RenewalIntelligence {
  estimatedNextRenewalDate: string;
  daysUntilRenewal: number;
  estimatedRenewalAmount: number;
  renewalConfidence: number; // 0.0 to 1.0
  isPriceCreepExpected: boolean;
  projectedAnnualCommitment: number;
}

export interface Subscription {
  id: string;
  name: string;
  vendor: string;
  canonicalDomain?: string;
  category: TransactionCategory;
  amount: number;
  currency: string;
  billingCycle: BillingCycle;
  status: SubscriptionStatus;
  tier: SubscriptionTier;
  startDate: string; // ISO format 'YYYY-MM-DD'
  nextBillingDate: string; // ISO format 'YYYY-MM-DD'
  lastBilledDate?: string;
  paymentMethodId: string;
  paymentMethodName?: string;
  autoRenew: boolean;
  cancelUrl?: string;
  portalUrl?: string;
  seatsCount?: number;
  lastActivityDate?: string; // Used for zombie / inactivity audit
  riskScore: number; // 0 (safest) to 100 (highest risk of waste)
  riskLevel: RiskLevel;
  notes?: string;

  // Intelligence additions
  linkedTransactionIds?: string[];
  historicalPricePoints?: PricePoint[];
  detectedCadence?: BillingCadence;
  cadenceExplanation?: string;
  renewalIntelligence?: RenewalIntelligence;
  totalSpendToDate?: number;
}

export interface SubscriptionSummary {
  totalMonthlyNormalizedSpend: number;
  totalAnnualSpend: number;
  activeCount: number;
  trialCount: number;
  flaggedCount: number;
  projectedNext30DaysSpend: number;
  categoryDistribution: Record<TransactionCategory, number>;
}
