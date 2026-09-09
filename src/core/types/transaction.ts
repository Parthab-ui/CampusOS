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

export interface Transaction {
  id: string;
  date: string; // ISO format 'YYYY-MM-DD'
  amount: number;
  currency: string;
  merchantName: string;
  merchantId?: string;
  category: TransactionCategory;
  paymentMethodId: string;
  paymentMethodName?: string;
  status: TransactionStatus;
  rawDescription: string;
  isRecurring: boolean;
  recurringCadence?: 'weekly' | 'monthly' | 'quarterly' | 'annual';
  confidenceScore: number; // 0.0 to 1.0 confidence in recurring detection
  subscriptionId?: string;
  notes?: string;
}

export interface TransactionFilter {
  searchQuery?: string;
  category?: TransactionCategory | 'all';
  isRecurringOnly?: boolean;
  status?: TransactionStatus | 'all';
  startDate?: string;
  endDate?: string;
}
