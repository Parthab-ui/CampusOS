import { Subscription, RenewalIntelligence, BillingCycle } from '../core/types';
import { getDaysDifference, BILLING_CYCLE_MULTIPLIERS } from '../core/config/constants';

export class RenewalForecaster {
  /**
   * Projects deterministic next renewal intelligence for a subscription
   */
  static projectRenewal(sub: Subscription, baseDate: string = '2026-09-09'): RenewalIntelligence {
    const lastBilled = sub.lastBilledDate || sub.startDate;
    const nextDate = this.calculateNextBillingDate(lastBilled, sub.billingCycle, baseDate);
    const daysUntilRenewal = getDaysDifference(nextDate, baseDate);

    const isPriceCreepExpected = sub.notes?.includes('hiked') || sub.riskScore >= 70;
    const estimatedRenewalAmount = sub.amount;

    const multiplier = BILLING_CYCLE_MULTIPLIERS[sub.billingCycle] || 1;
    const monthlyEquivalent = estimatedRenewalAmount * multiplier;
    const projectedAnnualCommitment = Number((monthlyEquivalent * 12).toFixed(2));

    let confidence = 0.95;
    if (sub.status === 'trial') confidence = 0.75;
    if (sub.status === 'flagged_for_review') confidence = 0.85;

    return {
      estimatedNextRenewalDate: nextDate,
      daysUntilRenewal,
      estimatedRenewalAmount,
      renewalConfidence: confidence,
      isPriceCreepExpected: Boolean(isPriceCreepExpected),
      projectedAnnualCommitment,
    };
  }

  /**
   * Calculate future billing date respecting calendar month clamp rules
   */
  static calculateNextBillingDate(
    lastBillingDateString: string,
    cadence: BillingCycle,
    baseDateString: string = '2026-09-09'
  ): string {
    const lastDate = new Date(lastBillingDateString);
    const baseDate = new Date(baseDateString);

    let candidate = new Date(lastDate);

    // Increment forward until candidate is in the future relative to baseDate
    while (candidate <= baseDate) {
      switch (cadence) {
        case 'weekly':
          candidate.setDate(candidate.getDate() + 7);
          break;
        case 'monthly':
          candidate = this.addMonthsClamped(candidate, 1);
          break;
        case 'quarterly':
          candidate = this.addMonthsClamped(candidate, 3);
          break;
        case 'biannual':
          candidate = this.addMonthsClamped(candidate, 6);
          break;
        case 'annual':
          candidate.setFullYear(candidate.getFullYear() + 1);
          break;
        default:
          candidate = this.addMonthsClamped(candidate, 1);
      }
    }

    return candidate.toISOString().split('T')[0];
  }

  /**
   * Add months without skipping past month-end (e.g., Jan 31 + 1 month -> Feb 28)
   */
  private static addMonthsClamped(date: Date, months: number): Date {
    const result = new Date(date);
    const targetMonth = result.getMonth() + months;
    result.setMonth(targetMonth);

    // If month overflowed due to day count difference, snap to last day of previous month
    if (result.getMonth() !== ((targetMonth % 12) + 12) % 12) {
      result.setDate(0);
    }
    return result;
  }
}
