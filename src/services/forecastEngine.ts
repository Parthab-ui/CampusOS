import { Subscription, CashFlowForecast, RenewalForecastItem } from '../core/types';
import { getDaysDifference } from '../core/config/constants';

export class ForecastEngine {
  /**
   * Generate renewal forecast for a given lookahead window in days
   */
  static generateForecast(
    subscriptions: Subscription[],
    windowDays: number = 30,
    baseDate: string = '2026-09-09'
  ): CashFlowForecast {
    const renewals: RenewalForecastItem[] = [];

    for (const sub of subscriptions) {
      if (sub.status === 'cancelled') continue;

      const daysUntil = getDaysDifference(sub.nextBillingDate, baseDate);
      if (daysUntil >= 0 && daysUntil <= windowDays) {
        renewals.push({
          id: `forecast-${sub.id}-${sub.nextBillingDate}`,
          date: sub.nextBillingDate,
          daysUntilRenewal: daysUntil,
          subscriptionId: sub.id,
          subscriptionName: sub.name,
          vendor: sub.vendor,
          category: sub.category,
          amount: sub.amount,
          currency: sub.currency,
          billingCycle: sub.billingCycle,
          paymentMethodName: sub.paymentMethodName,
          isFlaggedForReview: sub.riskScore >= 70,
        });
      }
    }

    // Sort by renewal date ascending
    renewals.sort((a, b) => a.daysUntilRenewal - b.daysUntilRenewal);

    const totalProjectedOutflow = Number(
      renewals.reduce((sum, r) => sum + r.amount, 0).toFixed(2)
    );

    // Group by date for daily chart / timeline
    const dateMap = new Map<string, { totalAmount: number; count: number }>();
    for (const r of renewals) {
      const existing = dateMap.get(r.date) || { totalAmount: 0, count: 0 };
      existing.totalAmount += r.amount;
      existing.count += 1;
      dateMap.set(r.date, existing);
    }

    const dailyAggregates = Array.from(dateMap.entries())
      .map(([date, data]) => ({
        date,
        totalAmount: Number(data.totalAmount.toFixed(2)),
        count: data.count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      windowDays,
      totalProjectedOutflow,
      currency: 'USD',
      renewals,
      dailyAggregates,
    };
  }
}
