import { Transaction, DuplicateAlert } from '../core/types';
import { getDaysDifference } from '../core/config/constants';

export class DuplicateDetector {
  /**
   * Analyzes an entire transaction ledger and attaches DuplicateAlert metadata to any duplicate transactions
   */
  static analyzeLedger(transactions: Transaction[]): Map<string, DuplicateAlert> {
    const alertsMap = new Map<string, DuplicateAlert>();

    // 1. Detect Same-Day Double Charge (same merchant, same amount, same card within 48 hours)
    for (let i = 0; i < transactions.length; i++) {
      const txA = transactions[i];

      for (let j = i + 1; j < transactions.length; j++) {
        const txB = transactions[j];

        // Check same merchant
        const sameMerchant =
          txA.merchantName.toLowerCase() === txB.merchantName.toLowerCase();
        if (!sameMerchant) continue;

        const daysApart = Math.abs(getDaysDifference(txA.date, txB.date));

        // Pattern 1: Same Card, Identical Amount, <= 2 Days
        if (
          txA.paymentMethodId === txB.paymentMethodId &&
          Math.abs(txA.amount - txB.amount) < 0.01 &&
          daysApart <= 2
        ) {
          const reason = `Identical charge of $${txA.amount.toFixed(2)} with ${txA.merchantName} detected within ${
            daysApart === 0 ? 'the same day' : `${daysApart} day(s)`
          } on the same payment instrument (${txA.paymentMethodName || 'Default Card'}).`;

          const alertA: DuplicateAlert = {
            isDuplicate: true,
            type: 'same_day_duplicate',
            conflictingTransactionIds: [txB.id],
            reason,
            potentialWastedAmount: txA.amount,
          };

          const alertB: DuplicateAlert = {
            isDuplicate: true,
            type: 'same_day_duplicate',
            conflictingTransactionIds: [txA.id],
            reason,
            potentialWastedAmount: txB.amount,
          };

          alertsMap.set(txA.id, alertA);
          alertsMap.set(txB.id, alertB);
        }

        // Pattern 2: Multi-Card Duplicate Billing (same vendor, different cards, within 15 days)
        if (
          txA.paymentMethodId !== txB.paymentMethodId &&
          daysApart <= 15 &&
          (txA.isRecurring || txB.isRecurring)
        ) {
          const reason = `Concurrent billing detected for ${txA.merchantName} across two different cards (${
            txA.paymentMethodName || 'Card A'
          } and ${txB.paymentMethodName || 'Card B'}) within ${daysApart} days. Possible multi-card duplicate subscription.`;

          const alertA: DuplicateAlert = {
            isDuplicate: true,
            type: 'multi_card_duplicate',
            conflictingTransactionIds: [txB.id],
            reason,
            potentialWastedAmount: Math.min(txA.amount, txB.amount),
          };

          const alertB: DuplicateAlert = {
            isDuplicate: true,
            type: 'multi_card_duplicate',
            conflictingTransactionIds: [txA.id],
            reason,
            potentialWastedAmount: Math.min(txA.amount, txB.amount),
          };

          // Don't overwrite same_day_duplicate if already set
          if (!alertsMap.has(txA.id)) alertsMap.set(txA.id, alertA);
          if (!alertsMap.has(txB.id)) alertsMap.set(txB.id, alertB);
        }
      }
    }

    return alertsMap;
  }
}
