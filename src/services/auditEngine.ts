import {
  Subscription,
  Transaction,
  AuditIssue,
  AuditSummary,
} from '../core/types';
import { env } from '../core/config/env';
import { getDaysDifference } from '../core/config/constants';

export class AuditEngine {
  /**
   * Run the full audit scan across all subscriptions and transactions
   */
  static runAudit(
    subscriptions: Subscription[],
    transactions: Transaction[],
    baseDate: string = '2026-09-09'
  ): {
    issues: AuditIssue[];
    summary: AuditSummary;
  } {
    const issues: AuditIssue[] = [];

    // Rule 1: Price Hike Detection
    const priceHikeIssues = this.detectPriceHikes(subscriptions, transactions);
    issues.push(...priceHikeIssues);

    // Rule 2: Duplicate Subscription / Vendor Detection
    const duplicateIssues = this.detectDuplicateSubscriptions(subscriptions);
    issues.push(...duplicateIssues);

    // Rule 3: Zombie / Inactive Subscription Detection
    const zombieIssues = this.detectZombieSubscriptions(subscriptions, baseDate);
    issues.push(...zombieIssues);

    // Rule 4: Expiring Trial Radar
    const trialIssues = this.detectExpiringTrials(subscriptions, baseDate);
    issues.push(...trialIssues);

    // Rule 5: Redundant Storage / Category Overlap Detection
    const redundancyIssues = this.detectRedundantServices(subscriptions);
    issues.push(...redundancyIssues);

    const summary = this.calculateAuditSummary(issues);

    return { issues, summary };
  }

  /**
   * Detect silent price hikes where current subscription price exceeds historical transaction baselines
   */
  private static detectPriceHikes(
    subscriptions: Subscription[],
    transactions: Transaction[]
  ): AuditIssue[] {
    const issues: AuditIssue[] = [];
    const thresholdPct = env.auditThresholds.priceHikePercentage;

    for (const sub of subscriptions) {
      const subTxList = transactions
        .filter((tx) => tx.subscriptionId === sub.id && tx.status !== 'refunded')
        .sort((a, b) => b.date.localeCompare(a.date));

      if (subTxList.length >= 2) {
        const latestTx = subTxList[0];
        // Find previous baseline (transactions from prior months)
        const priorTx = subTxList.slice(1).find((tx) => tx.date < latestTx.date);

        if (priorTx && latestTx.amount > priorTx.amount) {
          const increase = latestTx.amount - priorTx.amount;
          const pctIncrease = (increase / priorTx.amount) * 100;

          if (pctIncrease >= thresholdPct) {
            issues.push({
              id: `audit-hike-${sub.id}`,
              type: 'price_hike',
              severity: pctIncrease > 20 ? 'critical' : 'high',
              status: 'open',
              title: `Silent Price Hike: ${sub.name} increased by ${pctIncrease.toFixed(1)}%`,
              description: `Recurring billing jumped from $${priorTx.amount.toFixed(2)} to $${latestTx.amount.toFixed(2)} on ${latestTx.date}. Annualized leakage: +$${(increase * 12).toFixed(2)}/yr.`,
              detectedAt: latestTx.date,
              impactMonthly: Number(increase.toFixed(2)),
              impactAnnual: Number((increase * 12).toFixed(2)),
              currency: sub.currency,
              subscriptionId: sub.id,
              subscriptionName: sub.name,
              relatedTransactionIds: [latestTx.id, priorTx.id],
              recommendedAction: 'Review price hike notification or negotiate/downgrade to standard tier.',
              potentialSavings: Number((increase * 12).toFixed(2)),
              metadata: {
                previousPrice: priorTx.amount,
                currentPrice: latestTx.amount,
                pctIncrease: Number(pctIncrease.toFixed(1)),
              },
            });
          }
        }
      }
    }

    return issues;
  }

  /**
   * Detect duplicate subscriptions (same vendor or duplicate user plans across different cards)
   */
  private static detectDuplicateSubscriptions(subscriptions: Subscription[]): AuditIssue[] {
    const issues: AuditIssue[] = [];
    const vendorMap = new Map<string, Subscription[]>();

    for (const sub of subscriptions) {
      if (sub.status === 'cancelled') continue;
      const key = sub.vendor.toLowerCase().trim();
      const existing = vendorMap.get(key) || [];
      existing.push(sub);
      vendorMap.set(key, existing);
    }

    vendorMap.forEach((subs, vendor) => {
      if (subs.length > 1) {
        const secondary = subs[1];
        const primary = subs[0];
        const monthlyImpact = secondary.amount;
        const annualImpact = monthlyImpact * 12;

        issues.push({
          id: `audit-dup-${vendor.replace(/\s+/g, '-')}`,
          type: 'duplicate_billing',
          severity: 'critical',
          status: 'open',
          title: `Duplicate Billing: Multiple accounts with ${primary.vendor}`,
          description: `Identified ${subs.length} concurrent subscriptions for ${primary.vendor}: "${primary.name}" and "${secondary.name}" charged across different cards.`,
          detectedAt: '2026-09-01',
          impactMonthly: Number(monthlyImpact.toFixed(2)),
          impactAnnual: Number(annualImpact.toFixed(2)),
          currency: primary.currency,
          subscriptionId: secondary.id,
          subscriptionName: secondary.name,
          recommendedAction: `Consolidate accounts into the primary plan (${primary.name}) and terminate duplicate.`,
          potentialSavings: Number(annualImpact.toFixed(2)),
          metadata: {
            accounts: subs.map((s) => `${s.name} (${s.paymentMethodName || 'Unknown Card'})`),
          },
        });
      }
    });

    return issues;
  }

  /**
   * Detect zombie subscriptions where no user activity has been logged for > threshold days
   */
  private static detectZombieSubscriptions(
    subscriptions: Subscription[],
    baseDate: string
  ): AuditIssue[] {
    const issues: AuditIssue[] = [];
    const thresholdDays = env.auditThresholds.zombieDaysThreshold;

    for (const sub of subscriptions) {
      if (sub.status === 'cancelled' || !sub.lastActivityDate) continue;

      const daysInactive = getDaysDifference(baseDate, sub.lastActivityDate);
      if (daysInactive >= thresholdDays) {
        const annualImpact = sub.amount * 12;

        issues.push({
          id: `audit-zombie-${sub.id}`,
          type: 'zombie_subscription',
          severity: 'critical',
          status: 'open',
          title: `Zombie Seat: Inactive ${sub.name}`,
          description: `Zero active sessions, edits, or team logins recorded in the past ${daysInactive} days (threshold: ${thresholdDays} days). Ongoing monthly spend: $${sub.amount.toFixed(2)}.`,
          detectedAt: baseDate,
          impactMonthly: sub.amount,
          impactAnnual: annualImpact,
          currency: sub.currency,
          subscriptionId: sub.id,
          subscriptionName: sub.name,
          recommendedAction: 'Reclaim license seat or cancel subscription immediately.',
          potentialSavings: annualImpact,
          metadata: {
            daysInactive,
            lastActivityDate: sub.lastActivityDate,
          },
        });
      }
    }

    return issues;
  }

  /**
   * Detect expiring introductory trials converting to full price within 3 days
   */
  private static detectExpiringTrials(
    subscriptions: Subscription[],
    baseDate: string
  ): AuditIssue[] {
    const issues: AuditIssue[] = [];

    for (const sub of subscriptions) {
      if (sub.status === 'trial') {
        const daysUntil = getDaysDifference(sub.nextBillingDate, baseDate);
        if (daysUntil <= 3 && daysUntil >= 0) {
          const annualImpact = sub.amount * 12;

          issues.push({
            id: `audit-trial-${sub.id}`,
            type: 'trial_ending_soon',
            severity: 'high',
            status: 'open',
            title: `Expiring Trial: ${sub.name} converts in ${daysUntil === 0 ? 'Today' : `${daysUntil}d`}`,
            description: `Introductory trial expires on ${sub.nextBillingDate}. Auto-renewal is active for $${sub.amount.toFixed(2)}/month.`,
            detectedAt: baseDate,
            impactMonthly: sub.amount,
            impactAnnual: annualImpact,
            currency: sub.currency,
            subscriptionId: sub.id,
            subscriptionName: sub.name,
            recommendedAction: 'Verify utilization and disable auto-renew before charge executes.',
            potentialSavings: annualImpact,
            metadata: {
              daysUntil,
              conversionPrice: sub.amount,
            },
          });
        }
      }
    }

    return issues;
  }

  /**
   * Detect redundant services within the same category (e.g. Dropbox + Google One storage)
   */
  private static detectRedundantServices(subscriptions: Subscription[]): AuditIssue[] {
    const issues: AuditIssue[] = [];
    const storageSubs = subscriptions.filter(
      (s) =>
        s.status !== 'cancelled' &&
        (s.name.toLowerCase().includes('storage') ||
          s.name.toLowerCase().includes('drive') ||
          s.name.toLowerCase().includes('dropbox'))
    );

    if (storageSubs.length >= 2) {
      const subToConsolidate = storageSubs[1];
      const annualImpact = subToConsolidate.amount * 12;

      issues.push({
        id: `audit-redundant-storage`,
        type: 'redundant_service',
        severity: 'medium',
        status: 'open',
        title: 'Redundant Cloud Storage Accounts Detected',
        description: `Concurrent paid accounts for ${storageSubs.map((s) => s.name).join(' and ')}. You can save $${annualImpact.toFixed(2)}/yr by consolidating.`,
        detectedAt: '2026-09-01',
        impactMonthly: subToConsolidate.amount,
        impactAnnual: annualImpact,
        currency: subToConsolidate.currency,
        subscriptionId: subToConsolidate.id,
        subscriptionName: subToConsolidate.name,
        recommendedAction: 'Consolidate file backups to a single cloud provider.',
        potentialSavings: annualImpact,
      });
    }

    return issues;
  }

  /**
   * Calculate overall health score and audit statistics
   */
  static calculateAuditSummary(issues: AuditIssue[]): AuditSummary {
    const openIssues = issues.filter((i) => i.status === 'open' || i.status === 'investigating');
    const resolvedIssues = issues.filter((i) => i.status === 'resolved');

    const criticalIssuesCount = openIssues.filter((i) => i.severity === 'critical').length;
    const highIssuesCount = openIssues.filter((i) => i.severity === 'high').length;

    const totalAnnualLeakage = openIssues.reduce((sum, i) => sum + i.impactAnnual, 0);
    const totalMonthlyLeakage = openIssues.reduce((sum, i) => sum + i.impactMonthly, 0);

    // Health score starts at 100 and loses points based on severity of open issues
    let healthScore = 100;
    healthScore -= criticalIssuesCount * 18;
    healthScore -= highIssuesCount * 8;
    healthScore -= (openIssues.length - criticalIssuesCount - highIssuesCount) * 4;
    healthScore = Math.max(15, Math.min(100, healthScore));

    return {
      healthScore,
      totalOpenIssues: openIssues.length,
      criticalIssuesCount,
      highIssuesCount,
      totalAnnualLeakage: Number(totalAnnualLeakage.toFixed(2)),
      totalMonthlyLeakage: Number(totalMonthlyLeakage.toFixed(2)),
      resolvedIssuesCount: resolvedIssues.length,
    };
  }
}
