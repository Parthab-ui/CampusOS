import { SavingsOpportunity, SavingsSummary } from '../core/types';

export class SavingsAdvisor {
  /**
   * Summarize savings opportunities and highlight quick wins
   */
  static summarizeSavings(opportunities: SavingsOpportunity[]): SavingsSummary {
    const active = opportunities.filter((op) => !op.isApplied);

    const totalIdentifiedAnnualSavings = Number(
      active.reduce((acc, op) => acc + op.potentialAnnualSavings, 0).toFixed(2)
    );
    const totalIdentifiedMonthlySavings = Number(
      active.reduce((acc, op) => acc + op.potentialMonthlySavings, 0).toFixed(2)
    );

    const quickWinSavingsAnnual = Number(
      active
        .filter((op) => op.effortLevel === 'instant' || op.effortLevel === 'easy')
        .reduce((acc, op) => acc + op.potentialAnnualSavings, 0)
        .toFixed(2)
    );

    return {
      totalIdentifiedAnnualSavings,
      totalIdentifiedMonthlySavings,
      quickWinSavingsAnnual,
      opportunitiesCount: active.length,
    };
  }
}
