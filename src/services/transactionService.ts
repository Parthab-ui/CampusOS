import { Transaction, TransactionCategory, TransactionFilter } from '../core/types';

export class TransactionService {
  /**
   * Filter transactions by search query, category, recurring status, and date range
   */
  static filterTransactions(
    transactions: Transaction[],
    filter: TransactionFilter
  ): Transaction[] {
    return transactions.filter((tx) => {
      if (filter.searchQuery && filter.searchQuery.trim() !== '') {
        const query = filter.searchQuery.toLowerCase();
        const matchesMerchant = tx.merchantName.toLowerCase().includes(query);
        const matchesDesc = tx.rawDescription.toLowerCase().includes(query);
        const matchesNotes = tx.notes?.toLowerCase().includes(query) ?? false;
        if (!matchesMerchant && !matchesDesc && !matchesNotes) {
          return false;
        }
      }

      if (filter.category && filter.category !== 'all') {
        if (tx.category !== filter.category) {
          return false;
        }
      }

      if (filter.isRecurringOnly && !tx.isRecurring) {
        return false;
      }

      if (filter.status && filter.status !== 'all') {
        if (tx.status !== filter.status) {
          return false;
        }
      }

      if (filter.startDate && tx.date < filter.startDate) {
        return false;
      }

      if (filter.endDate && tx.date > filter.endDate) {
        return false;
      }

      return true;
    });
  }

  /**
   * Group transactions by category and compute spend totals
   */
  static getSpendByCategory(transactions: Transaction[]): Record<TransactionCategory, number> {
    const breakdown = {} as Record<TransactionCategory, number>;

    for (const tx of transactions) {
      if (!breakdown[tx.category]) {
        breakdown[tx.category] = 0;
      }
      breakdown[tx.category] += tx.amount;
    }

    return breakdown;
  }

  /**
   * Calculate total spend for a list of transactions
   */
  static calculateTotalSpend(transactions: Transaction[]): number {
    return transactions.reduce((acc, tx) => acc + tx.amount, 0);
  }

  /**
   * Identify recurring transaction patterns by merchant name repetition
   */
  static detectRecurringCandidates(transactions: Transaction[]): {
    merchantName: string;
    occurrences: number;
    averageAmount: number;
    confidence: number;
  }[] {
    const merchantMap = new Map<string, { count: number; total: number; dates: string[] }>();

    for (const tx of transactions) {
      const existing = merchantMap.get(tx.merchantName) || { count: 0, total: 0, dates: [] };
      existing.count += 1;
      existing.total += tx.amount;
      existing.dates.push(tx.date);
      merchantMap.set(tx.merchantName, existing);
    }

    const candidates: {
      merchantName: string;
      occurrences: number;
      averageAmount: number;
      confidence: number;
    }[] = [];

    merchantMap.forEach((val, merchant) => {
      if (val.count >= 2) {
        const avg = val.total / val.count;
        const confidence = Math.min(0.99, 0.6 + val.count * 0.1);
        candidates.push({
          merchantName: merchant,
          occurrences: val.count,
          averageAmount: Number(avg.toFixed(2)),
          confidence: Number(confidence.toFixed(2)),
        });
      }
    });

    return candidates;
  }
}
