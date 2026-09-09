import { Transaction, RecurringExplainability, BillingCadence } from '../core/types';
import { getDaysDifference } from '../core/config/constants';

export class RecurringIntelligenceEngine {
  /**
   * Evaluates recurring patterns for a single transaction in the context of the user's historical ledger
   */
  static analyzeTransaction(
    targetTx: Transaction,
    allTransactions: Transaction[]
  ): RecurringExplainability {
    // 1. Find all related transactions from the same merchant (or matching subscription ID)
    const related = allTransactions
      .filter((tx) => {
        if (tx.status === 'refunded') return false;
        if (targetTx.subscriptionId && tx.subscriptionId === targetTx.subscriptionId) return true;
        return (
          tx.merchantName.toLowerCase() === targetTx.merchantName.toLowerCase() ||
          tx.rawDescription.toLowerCase().includes(targetTx.merchantName.toLowerCase())
        );
      })
      .sort((a, b) => a.date.localeCompare(b.date)); // Chronological

    const occurrences = related.length;

    // Single isolated transaction
    if (occurrences < 2) {
      const isKnownSub = targetTx.merchantIntelligence?.isKnownSubscriptionVendor ?? false;
      const subKeyword = /sub|monthly|annual|license|pro|cloud|membership/i.test(targetTx.rawDescription);
      
      const singleScore = isKnownSub ? 0.65 : subKeyword ? 0.5 : 0.1;
      return {
        isRecurring: singleScore >= 0.5,
        confidenceScore: singleScore,
        detectedCadence: 'monthly',
        observedOccurrences: 1,
        cadenceRegularity: 'none',
        explanation: isKnownSub
          ? `Single observed charge, but recognized as known subscription service (${targetTx.merchantName}). Awaiting subsequent cycle confirmation.`
          : 'Isolated transaction. Insufficient historical cadence to verify recurring pattern.',
      };
    }

    // 2. Compute interval deltas in days between consecutive payments
    const intervals: number[] = [];
    for (let i = 1; i < related.length; i++) {
      const days = getDaysDifference(related[i].date, related[i - 1].date);
      if (days > 0) intervals.push(days);
    }

    // Compute mean interval
    const meanInterval = intervals.length > 0
      ? intervals.reduce((a, b) => a + b, 0) / intervals.length
      : 30;

    // Compute standard deviation of intervals (regularity measure)
    const variance = intervals.length > 1
      ? intervals.reduce((acc, d) => acc + Math.pow(d - meanInterval, 2), 0) / intervals.length
      : 0;
    const stdDev = Math.sqrt(variance);

    // 3. Compute amount stability
    const amounts = related.map((r) => r.amount);
    const minAmount = Math.min(...amounts);
    const maxAmount = Math.max(...amounts);
    const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const amountVariancePercent = Number((((maxAmount - minAmount) / (avgAmount || 1)) * 100).toFixed(1));

    // 4. Classify Cadence
    let detectedCadence: BillingCadence = 'monthly';
    if (meanInterval >= 6 && meanInterval <= 9) {
      detectedCadence = 'weekly';
    } else if (meanInterval >= 25 && meanInterval <= 35) {
      detectedCadence = 'monthly';
    } else if (meanInterval >= 80 && meanInterval <= 100) {
      detectedCadence = 'quarterly';
    } else if (meanInterval >= 340 && meanInterval <= 380) {
      detectedCadence = 'annual';
    }

    // 5. Cadence Regularity Classification
    let cadenceRegularity: RecurringExplainability['cadenceRegularity'] = 'moderate';
    if (stdDev <= 1.0) cadenceRegularity = 'exact';
    else if (stdDev <= 2.5) cadenceRegularity = 'high';
    else if (stdDev <= 5.0) cadenceRegularity = 'moderate';
    else cadenceRegularity = 'irregular';

    // 6. Confidence Score Calculation
    let score = 0.5; // Base prior

    // Repeat count boost
    if (occurrences >= 4) score += 0.25;
    else if (occurrences >= 3) score += 0.2;
    else if (occurrences === 2) score += 0.1;

    // Regularity boost/penalty
    if (cadenceRegularity === 'exact') score += 0.2;
    else if (cadenceRegularity === 'high') score += 0.15;
    else if (cadenceRegularity === 'irregular') score -= 0.2;

    // Amount consistency boost
    if (amountVariancePercent === 0) score += 0.1; // Exact fixed fee
    else if (amountVariancePercent <= 10) score += 0.05; // Normal usage spread
    else if (amountVariancePercent > 50) score -= 0.15; // High fluctuation

    // Vendor known profile boost
    if (targetTx.merchantIntelligence?.isKnownSubscriptionVendor) score += 0.1;

    const clampedScore = Number(Math.max(0.1, Math.min(0.99, score)).toFixed(2));
    const isRecurring = clampedScore >= 0.7;

    // 7. Human-readable explanation narrative
    const latestDate = new Date(targetTx.date);
    const dayOfMonth = latestDate.getDate();

    let narrative = '';
    if (isRecurring) {
      narrative = `Billed ${detectedCadence} near the ${dayOfMonth}${getOrdinal(dayOfMonth)} with ${
        stdDev === 0 ? '0-day' : `±${stdDev.toFixed(1)} day`
      } variance across ${occurrences} recorded charges. `;

      if (amountVariancePercent === 0) {
        narrative += `Exact fixed-price stability ($${targetTx.amount.toFixed(2)}).`;
      } else {
        narrative += `Observed ${amountVariancePercent}% price fluctuation ($${minAmount.toFixed(2)} - $${maxAmount.toFixed(2)}).`;
      }
    } else {
      narrative = `Observed ${occurrences} transactions with irregular intervals (mean: ${meanInterval.toFixed(0)} days, ±${stdDev.toFixed(1)} days). Insufficient regularity for verified recurring status.`;
    }

    return {
      isRecurring,
      confidenceScore: clampedScore,
      detectedCadence,
      averageIntervalDays: Number(meanInterval.toFixed(1)),
      intervalVarianceDays: Number(stdDev.toFixed(1)),
      amountVariancePercent,
      observedOccurrences: occurrences,
      explanation: narrative,
      cadenceRegularity,
    };
  }
}

function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
