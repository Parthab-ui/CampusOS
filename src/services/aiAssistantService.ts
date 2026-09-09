import {
  AIAssistantMessage,
  AIAuditPromptPreset,
  Subscription,
  AuditIssue,
  SavingsOpportunity,
} from '../core/types';

export const AI_AUDIT_PRESETS: AIAuditPromptPreset[] = [
  {
    id: 'preset-full-audit',
    label: 'Run Full FinTech Spend Audit',
    query: 'Perform a comprehensive financial audit on all active subscriptions and detect spend leakage.',
    category: 'audit',
    icon: 'ShieldAlert',
  },
  {
    id: 'preset-duplicates',
    label: 'Identify Redundant & Duplicate Plans',
    query: 'Show me any duplicated accounts, multi-card charges, or overlapping software tools.',
    category: 'savings',
    icon: 'CopyCheck',
  },
  {
    id: 'preset-zombies',
    label: 'Detect Inactive "Zombie" Subscriptions',
    query: 'Which subscriptions have had zero team activity or logins for over 60 days?',
    category: 'audit',
    icon: 'Ghost',
  },
  {
    id: 'preset-budget-cut',
    label: 'Simulate 20% Spend Optimization',
    query: 'What specific subscriptions can we eliminate or downgrade to cut recurring spend by 20% without impacting productivity?',
    category: 'savings',
    icon: 'TrendingDown',
  },
];

export class AIAssistantService {
  /**
   * Process a prompt against the live subscription and audit context
   */
  static processUserPrompt(
    query: string,
    subscriptions: Subscription[],
    auditIssues: AuditIssue[],
    savingsOpportunities: SavingsOpportunity[]
  ): AIAssistantMessage {
    const q = query.toLowerCase();
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Handle Zombie / Inactivity Query
    if (q.includes('zombie') || q.includes('inactive') || q.includes('activity')) {
      const zombies = auditIssues.filter((i) => i.type === 'zombie_subscription');
      const totalZombieLoss = zombies.reduce((s, z) => s + z.impactAnnual, 0);

      return {
        id: `msg-ai-${Date.now()}`,
        role: 'assistant',
        timestamp,
        content: `I analyzed active user engagement telemetry across your software inventory. I identified **${zombies.length} inactive zombie subscription(s)** that have had zero logins for over 60 days.`,
        structuredAuditReport: {
          headline: `Zombie Account Audit: $${totalZombieLoss.toFixed(2)}/yr in Inactive Software`,
          executiveSummary: `Zero document changes, API requests, or user sessions have been recorded for the flagged services. Terminating or de-provisioning these seats recovers immediate cash without workflow disruption.`,
          keyFindings: zombies.map(
            (z) => `**${z.subscriptionName}**: Inactive for 104 days ($${z.impactMonthly.toFixed(2)}/mo)`
          ),
          immediateActionItems: [
            'Revoke unassigned Figma Enterprise license seat.',
            'Audit single-sign-on (SSO) activity logs for all remaining SaaS tools.',
            'Implement 60-day auto-reclaim policy for enterprise seats.',
          ],
          potentialAnnualImpact: totalZombieLoss,
          currency: 'USD',
        },
      };
    }

    // Handle Duplicates / Redundancy Query
    if (q.includes('duplicate') || q.includes('redundant') || q.includes('overlap')) {
      const duplicates = auditIssues.filter(
        (i) => i.type === 'duplicate_billing' || i.type === 'redundant_service'
      );
      const totalDupLoss = duplicates.reduce((s, d) => s + d.impactAnnual, 0);

      return {
        id: `msg-ai-${Date.now()}`,
        role: 'assistant',
        timestamp,
        content: `I detected **${duplicates.length} duplicate or redundant payment patterns** across your corporate cards and virtual privacy cards.`,
        structuredAuditReport: {
          headline: `Redundancy Audit: $${totalDupLoss.toFixed(2)}/yr in Duplicate Charges`,
          executiveSummary: `Multiple users or payment instruments are maintaining separate subscriptions for the same underlying vendor (Spotify) and overlapping functional categories (Cloud Storage).`,
          keyFindings: [
            '**Spotify AB**: Concurrent charges on Card 4288 ($19.99) and Card 9901 ($14.99).',
            '**Cloud Storage Overlap**: Paying for Google One 2TB and Dropbox Pro 3TB simultaneously.',
          ],
          immediateActionItems: [
            'Consolidate all music listeners into the Spotify Family account and cancel Duo.',
            'Migrate Dropbox archives into Google Drive to eliminate secondary monthly charge.',
          ],
          potentialAnnualImpact: totalDupLoss,
          currency: 'USD',
        },
      };
    }

    // Handle Budget Cut / Optimization Query
    if (q.includes('cut') || q.includes('save') || q.includes('optimize') || q.includes('20%')) {
      const totalAnnualSavings = savingsOpportunities.reduce((s, op) => s + op.potentialAnnualSavings, 0);

      return {
        id: `msg-ai-${Date.now()}`,
        role: 'assistant',
        timestamp,
        content: `I computed an optimization matrix that identifies **$${totalAnnualSavings.toFixed(2)} in annualized savings** across low-friction administrative adjustments.`,
        structuredAuditReport: {
          headline: `Spend Optimization Playbook: ~$${totalAnnualSavings.toFixed(2)} Annualized Yield`,
          executiveSummary: `By executing 4 discrete steps (deprovisioning inactive seats, consolidating duplicates, and locking in annual discount tiers), recurring spend can be reduced by over 24%.`,
          keyFindings: savingsOpportunities.map(
            (op) => `**${op.title}**: Save $${op.potentialAnnualSavings.toFixed(2)}/yr (${op.effortLevel} effort)`
          ),
          immediateActionItems: [
            'Immediate: Cancel inactive Figma seat (Save $540.00/yr).',
            'Immediate: Cancel duplicate Spotify plan (Save $179.88/yr).',
            'Medium: Enable AWS Compute Savings Plans for EC2 baseline (Save $955.92/yr).',
          ],
          potentialAnnualImpact: totalAnnualSavings,
          currency: 'USD',
        },
      };
    }

    // Default Full Audit Summary
    const openIssues = auditIssues.filter((i) => i.status === 'open');
    const totalLeakage = openIssues.reduce((s, i) => s + i.impactAnnual, 0);

    return {
      id: `msg-ai-${Date.now()}`,
      role: 'assistant',
      timestamp,
      content: `I completed a financial audit of your **${subscriptions.length} recurring subscriptions** and recent ledger transactions. Here is your executive summary:`,
      structuredAuditReport: {
        headline: `Comprehensive FinTech Audit: ${openIssues.length} Vulnerabilities Detected`,
        executiveSummary: `Total detected annual cash leakage is $${totalLeakage.toFixed(2)}. Top areas of concern include silent price creep on streaming media, duplicate music accounts, and an enterprise design seat that has sat idle for 100+ days.`,
        keyFindings: [
          '**Silent Price Creep**: Netflix increased recurring billing by 15.0% without approval.',
          '**Duplicate Billing**: Spotify accounts detected on two separate payment cards.',
          '**Zombie License**: Figma seat inactive for 104 consecutive days.',
          '**Expiring Trial**: Anthropic Claude AI converts to $200.00/mo in 48 hours.',
        ],
        immediateActionItems: [
          'Review Netflix tier selection to avoid unneeded 4-stream surcharge.',
          'Cancel secondary Spotify Duo subscription.',
          'De-provision inactive Figma Enterprise user.',
          'Decide on Anthropic Claude API trial conversion before auto-charge executes.',
        ],
        potentialAnnualImpact: totalLeakage,
        currency: 'USD',
      },
    };
  }
}
