import { TransactionCategory } from './transaction';

export interface RenewalForecastItem {
  id: string;
  date: string; // ISO date 'YYYY-MM-DD'
  daysUntilRenewal: number;
  subscriptionId: string;
  subscriptionName: string;
  vendor: string;
  category: TransactionCategory;
  amount: number;
  currency: string;
  billingCycle: string;
  paymentMethodName?: string;
  isFlaggedForReview: boolean;
}

export interface CashFlowForecast {
  windowDays: number;
  totalProjectedOutflow: number;
  currency: string;
  renewals: RenewalForecastItem[];
  dailyAggregates: {
    date: string;
    totalAmount: number;
    count: number;
  }[];
}
