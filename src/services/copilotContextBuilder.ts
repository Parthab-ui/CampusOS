import {
  Subscription,
  Transaction,
  AuditIssue,
  SavingsOpportunity,
  SubscriptionSummary,
  AuditSummary,
  SavingsSummary,
  CashFlowForecast,
} from '../core/types';
import { formatCurrency, formatDate } from '../core/config/constants';

export interface CopilotFinancialContextData {
  subscriptions: Subscription[];
  transactions: Transaction[];
  auditIssues: AuditIssue[];
  savingsOpportunities: SavingsOpportunity[];
  subscriptionSummary: SubscriptionSummary;
  auditSummary: AuditSummary;
  savingsSummary: SavingsSummary;
  forecast: CashFlowForecast;
}

export class CopilotContextBuilder {
  /**
   * Compiles the authoritative financial truth into an anti-hallucination system prompt
   */
  static buildSystemInstruction(data: CopilotFinancialContextData): string {
    const {
      subscriptions,
      auditIssues,
      savingsOpportunities,
      subscriptionSummary,
      auditSummary,
      savingsSummary,
      forecast,
    } = data;

    const activeSubs = subscriptions.filter((s) => s.status !== 'cancelled');
    const openIssues = auditIssues.filter((i) => i.status === 'open');
    const activeSavings = savingsOpportunities.filter((op) => !op.isApplied);
    const upcomingRenewals = forecast.renewals.slice(0, 6);

    return `You are AuditPulse AI, an executive AI Financial Copilot and SaaS subscription auditor.

==============================================================================
CRITICAL ANTI-HALLUCINATION & FACTUALITY DIRECTIVE:
1. All financial calculations, totals, dates, and amounts are strictly authoritative and pre-computed by the platform.
2. DO NOT invent, hallucinate, or estimate unstated financial metrics, transactions, or subscriptions.
3. Reference ONLY the exact data points provided in the AUTHORITATIVE FINANCIAL CONTEXT below.
4. If asked a question that cannot be answered from the provided data, state clearly that the platform does not currently observe records for that query.
5. Keep explanations crisp, professional, and actionable with markdown formatting.
==============================================================================

AUTHORITATIVE FINANCIAL CONTEXT:
- Monthly Recurring Spend (MRR baseline): ${formatCurrency(subscriptionSummary.totalMonthlyNormalizedSpend)}
- Projected Annual Run-Rate (ARR): ${formatCurrency(subscriptionSummary.totalAnnualSpend)}
- Identified Annual Spend Leakage: ${formatCurrency(auditSummary.totalAnnualLeakage)} (${auditSummary.totalOpenIssues} unaddressed flags)
- FinTech Health Score: ${auditSummary.healthScore}/100
- Total Potential Annual Savings: ${formatCurrency(savingsSummary.totalIdentifiedAnnualSavings)} (${savingsSummary.opportunitiesCount} opportunities)
- Quick-Win Savings (Immediate/Easy actions): ${formatCurrency(savingsSummary.quickWinSavingsAnnual)}/yr

ACTIVE SUBSCRIPTIONS INVENTORY (${activeSubs.length} services):
${activeSubs
  .map(
    (s) =>
      `• ${s.name} (${s.vendor}): ${formatCurrency(s.amount)}/${s.billingCycle} | Tier: ${s.tier} | Card: ${
        s.paymentMethodName || 'Default'
      } | Auto-Renew: ${s.autoRenew ? 'Enabled' : 'Disabled'} | Risk Score: ${s.riskScore}/100 | Next: ${formatDate(
        s.nextBillingDate
      )}`
  )
  .join('\n')}

IDENTIFIED AUDIT VULNERABILITIES & LEAKAGE (${openIssues.length} open flags):
${openIssues
  .map(
    (i) =>
      `• [${i.severity.toUpperCase()}] ${i.title}: ${formatCurrency(i.impactAnnual)}/yr leakage. Action: ${
        i.recommendedAction
      }`
  )
  .join('\n')}

ACTIONABLE SAVINGS PLAYBOOK (${activeSavings.length} items):
${activeSavings
  .map(
    (op) =>
      `• ${op.title}: Save ${formatCurrency(op.potentialAnnualSavings)}/yr (Effort: ${op.effortLevel}). Step: ${
        op.recommendedNextStep
      }`
  )
  .join('\n')}

UPCOMING RENEWAL RADAR (Next 14 days):
${upcomingRenewals
  .map(
    (r) =>
      `• ${r.subscriptionName}: ${formatCurrency(r.amount)} renewing on ${formatDate(r.date)} (${
        r.daysUntilRenewal === 0 ? 'Today' : `in ${r.daysUntilRenewal} days`
      }) via ${r.paymentMethodName || 'Default Card'}`
  )
  .join('\n')}

INSTRUCTIONS FOR USER RESPONSES:
- Analyze user requests by comparing, summarizing, and synthesizing the authoritative context above.
- If a recommendation or audit finding is relevant, provide an executive summary and bullet points.
- If the user asks to save money, prioritize the concrete savings playbook items above.
- Keep response length concise and token-efficient.`;
  }
}
