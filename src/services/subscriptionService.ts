import { Subscription, SubscriptionSummary, TransactionCategory } from '../core/types';
import { BILLING_CYCLE_MULTIPLIERS, getDaysDifference } from '../core/config/constants';

export class SubscriptionService {
  /**
   * Convert any billing cycle (weekly, monthly, quarterly, annual) to a monthly equivalent
   */
  static getMonthlyEquivalent(sub: Subscription): number {
    const multiplier = BILLING_CYCLE_MULTIPLIERS[sub.billingCycle] || 1;
    return Number((sub.amount * multiplier).toFixed(2));
  }

  /**
   * Calculate total monthly normalized spend for active and trial subscriptions
   */
  static calculateTotalMonthlySpend(subscriptions: Subscription[]): number {
    return subscriptions
      .filter((s) => s.status === 'active' || s.status === 'trial' || s.status === 'flagged_for_review')
      .reduce((sum, sub) => sum + this.getMonthlyEquivalent(sub), 0);
  }

  /**
   * Calculate total annual spend projection
   */
  static calculateTotalAnnualSpend(subscriptions: Subscription[]): number {
    const monthly = this.calculateTotalMonthlySpend(subscriptions);
    return Number((monthly * 12).toFixed(2));
  }

  /**
   * Find subscriptions renewing within a given number of days from baseDate
   */
  static getUpcomingRenewals(
    subscriptions: Subscription[],
    windowDays: number = 14,
    baseDate: string = '2026-09-09'
  ): { subscription: Subscription; daysUntil: number }[] {
    return subscriptions
      .filter((s) => s.status !== 'cancelled')
      .map((sub) => ({
        subscription: sub,
        daysUntil: getDaysDifference(sub.nextBillingDate, baseDate),
      }))
      .filter((item) => item.daysUntil >= 0 && item.daysUntil <= windowDays)
      .sort((a, b) => a.daysUntil - b.daysUntil);
  }

  /**
   * Generate comprehensive summary metrics for subscriptions
   */
  static getSubscriptionSummary(subscriptions: Subscription[]): SubscriptionSummary {
    const totalMonthlyNormalizedSpend = Number(this.calculateTotalMonthlySpend(subscriptions).toFixed(2));
    const totalAnnualSpend = Number(this.calculateTotalAnnualSpend(subscriptions).toFixed(2));

    const activeCount = subscriptions.filter((s) => s.status === 'active').length;
    const trialCount = subscriptions.filter((s) => s.status === 'trial').length;
    const flaggedCount = subscriptions.filter((s) => s.status === 'flagged_for_review').length;

    const upcoming = this.getUpcomingRenewals(subscriptions, 30);
    const projectedNext30DaysSpend = Number(
      upcoming.reduce((acc, item) => acc + item.subscription.amount, 0).toFixed(2)
    );

    const categoryDistribution = {} as Record<TransactionCategory, number>;
    for (const sub of subscriptions) {
      if (sub.status !== 'cancelled') {
        const monthly = this.getMonthlyEquivalent(sub);
        categoryDistribution[sub.category] = (categoryDistribution[sub.category] || 0) + monthly;
      }
    }

    return {
      totalMonthlyNormalizedSpend,
      totalAnnualSpend,
      activeCount,
      trialCount,
      flaggedCount,
      projectedNext30DaysSpend,
      categoryDistribution,
    };
  }
}
