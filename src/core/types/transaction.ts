export type TransactionCategory =
  | 'cloud_infrastructure'
  | 'software_saas'
  | 'ai_tools'
  | 'streaming_media'
  | 'productivity'
  | 'cybersecurity'
  | 'developer_tools'
  | 'telecom_utilities'
  | 'health_fitness'
  | 'finance_banking'
  | 'miscellaneous';

export type PaymentMethodType =
  | 'credit_card'
  | 'debit_card'
  | 'bank_account'
  | 'virtual_card'
  | 'paypal'
  | 'apple_pay';

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  name: string;
  last4: string;
  brand?: string;
  expiryDate?: string;
  isDefault: boolean;
}

export type TransactionStatus =
  | 'posted'
  | 'pending'
  | 'flagged'
  | 'refunded';

export type BillingCadence = 'weekly' | 'monthly' | 'quarterly' | 'annual';

export interface MerchantIntelligence {
  canonicalName: string;
  domain?: string;
  cleanLogoSlug?: string;
  category: TransactionCategory;
  isKnownSubscriptionVendor: boolean;
}

export interface RecurringExplainability {
  isRecurring: boolean;
  confidenceScore: number; // 0.0 to 1.0
  detectedCadence?: BillingCadence;
  averageIntervalDays?: number;
  intervalVarianceDays?: number;
  amountVariancePercent?: number;
  observedOccurrences: number;
  explanation: string;
  cadenceRegularity: 'exact' | 'high' | 'moderate' | 'irregular' | 'none';
}

export type DuplicateRiskType =
  | 'same_day_duplicate'
  | 'multi_card_duplicate'
  | 'rapid_charge';

export interface DuplicateAlert {
  isDuplicate: boolean;
  type?: DuplicateRiskType;
  conflictingTransactionIds?: string[];
  reason?: string;
  potentialWastedAmount?: number;
}

export interface Transaction {
  id: string;
  date: string; // ISO format 'YYYY-MM-DD'
  amount: number;
  currency: string;
  merchantName: string; // Normalized clean name
  rawDescription: string; // Original messy statement line
  merchantId?: string;
  category: TransactionCategory;
  paymentMethodId: string;
  paymentMethodName?: string;
  status: TransactionStatus;
  
  // Intelligent fields
  merchantIntelligence?: MerchantIntelligence;
  recurringIntelligence?: RecurringExplainability;
  duplicateAlert?: DuplicateAlert;
  
  isRecurring: boolean;
  recurringCadence?: BillingCadence;
  confidenceScore: number;
  subscriptionId?: string;
  notes?: string;
}

export interface TransactionFilter {
  searchQuery?: string;
  category?: TransactionCategory | 'all';
  isRecurringOnly?: boolean;
  hasDuplicateAlertOnly?: boolean;
  status?: TransactionStatus | 'all';
  paymentMethodId?: string | 'all';
  startDate?: string;
  endDate?: string;
}
