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

function sanitizeContextString(str?: string): string {
  if (!str) return '';
  return str
    .replace(/[<>{}\\]/g, '')
    .replace(/={4,}/g, '---')
    .replace(/\n{3,}/g, '\n\n')
    .slice(0, 300);
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

    return `You are SubGuard AI, an executive AI Financial Copilot and SaaS subscription auditor.

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
      `• ${sanitizeContextString(s.name)} (${sanitizeContextString(s.vendor)}): ${formatCurrency(s.amount)}/${s.billingCycle} | Tier: ${s.tier} | Card: ${
        sanitizeContextString(s.paymentMethodName) || 'Default'
      } | Auto-Renew: ${s.autoRenew ? 'Enabled' : 'Disabled'} | Risk Score: ${s.riskScore}/100 | Next: ${formatDate(
        s.nextBillingDate
      )}`
  )
  .join('\n')}

IDENTIFIED AUDIT VULNERABILITIES & FORENSIC EVIDENCE (${openIssues.length} open flags):
${openIssues
  .map(
    (i) =>
      `• [${i.severity.toUpperCase()}] ${sanitizeContextString(i.title)} (${i.type}): ${formatCurrency(i.impactAnnual)}/yr leakage (${formatCurrency(i.impactMonthly)}/mo).\n  - Forensic Record: ${sanitizeContextString(i.description)}\n  - Audit Evidence: ${sanitizeContextString(i.evidence?.notes) || 'Direct ledger discrepancy'}\n  - Recommended Fix: ${sanitizeContextString(i.recommendedAction)}`
  )
  .join('\n\n')}

ACTIONABLE SAVINGS PLAYBOOK (${activeSavings.length} items):
${activeSavings
  .map(
    (op) =>
      `• ${sanitizeContextString(op.title)}: Save ${formatCurrency(op.potentialAnnualSavings)}/yr (${formatCurrency(op.potentialMonthlySavings)}/mo). Effort: ${op.effortLevel}. Step: ${
        sanitizeContextString(op.recommendedNextStep)
      }`
  )
  .join('\n')}

UPCOMING RENEWAL RADAR (Next 14 days):
${upcomingRenewals
  .map(
    (r) =>
      `• ${sanitizeContextString(r.subscriptionName)}: ${formatCurrency(r.amount)} renewing on ${formatDate(r.date)} (${
        r.daysUntilRenewal === 0 ? 'Today' : `in ${r.daysUntilRenewal} days`
      }) via ${sanitizeContextString(r.paymentMethodName) || 'Default Card'}`
  )
  .join('\n')}

INSTRUCTIONS FOR USER RESPONSES:
- Analyze user requests by comparing, summarizing, and prioritizing findings from the authoritative context above.
- If asked about unusual spending, duplicate charges, or specific flagged services (e.g. Netflix, Spotify, Figma, Twilio, GitHub), provide the exact evidence, dollar amounts, and card references from the context.
- If the user asks for a cancellation email, dispute letter, or negotiation template, provide a professional, copyable template formatted in markdown with exact vendor names, amounts, and dates.
- Keep response tone executive, objective, and actionable.`;
  }
}
