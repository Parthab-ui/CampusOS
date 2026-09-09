import {
  Subscription,
  Transaction,
  AuditIssue,
  AuditSummary,
} from '../core/types';
import { env } from '../core/config/env';
import { getDaysDifference, formatCurrency } from '../core/config/constants';

export class AuditEngine {
  /**
   * Run the full multi-vector audit scan across all subscriptions and transactions
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

    // Rule 1: Silent Price Hike Detection
    issues.push(...this.detectPriceHikes(subscriptions, transactions));

    // Rule 2: Multi-Card Duplicate Subscriptions
    issues.push(...this.detectDuplicateSubscriptions(subscriptions));

    // Rule 3: Same-Day Double Swipes & Duplicate Transaction Debits
    issues.push(...this.detectSameDayDoubleCharges(transactions));

    // Rule 4: Zombie / Inactive SaaS Seat Detection
    issues.push(...this.detectZombieSubscriptions(subscriptions, baseDate));

    // Rule 5: Expiring Trial & Renewal Radar Risk
    issues.push(...this.detectExpiringTrialsAndRenewalRisks(subscriptions, baseDate));

    // Rule 6: Category Overlap & Software Redundancy
    issues.push(...this.detectCategoryOverlaps(subscriptions));

    // Rule 7: Unusual Spending Spikes & Outlier Debits
    issues.push(...this.detectUnusualSpendingSpikes(transactions));

    // Rule 8: High-Concentration Spending Risks
    issues.push(...this.detectExpensiveCommitments(subscriptions));

    const summary = this.calculateAuditSummary(issues);

    return { issues, summary };
  }

  /**
   * Rule 1: Detect silent price hikes where current subscription price exceeds historical transaction baselines
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
        const priorTx = subTxList.slice(1).find((tx) => tx.date < latestTx.date);

        if (priorTx && latestTx.amount > priorTx.amount) {
          const increase = latestTx.amount - priorTx.amount;
          const pctIncrease = (increase / priorTx.amount) * 100;

          if (pctIncrease >= thresholdPct) {
            const annualImpact = Number((increase * 12).toFixed(2));
            issues.push({
              id: `audit-hike-${sub.id}`,
              type: 'price_hike',
              severity: pctIncrease > 20 ? 'critical' : 'high',
              status: 'open',
              category: sub.category,
              title: `Silent Price Hike: ${sub.name} increased by ${pctIncrease.toFixed(1)}%`,
              description: `Recurring billing increased from ${formatCurrency(priorTx.amount)} to ${formatCurrency(latestTx.amount)} on ${latestTx.date} (+${pctIncrease.toFixed(1)}%). Annualized spend creep: +${formatCurrency(annualImpact)}/yr.`,
              detectedAt: latestTx.date,
              impactMonthly: Number(increase.toFixed(2)),
              impactAnnual: annualImpact,
              currency: sub.currency,
              subscriptionId: sub.id,
              subscriptionName: sub.name,
              relatedTransactionIds: [latestTx.id, priorTx.id],
              recommendedAction: 'Review plan notifications, request grandfathered pricing, or downgrade to standard tier.',
              potentialSavings: annualImpact,
              evidence: {
                baselineAmount: priorTx.amount,
                chargedAmount: latestTx.amount,
                variancePercentage: Number(pctIncrease.toFixed(1)),
                paymentMethodsInvolved: [sub.paymentMethodName || 'Default Card'],
                conflictingTransactions: [
                  {
                    id: priorTx.id,
                    date: priorTx.date,
                    amount: priorTx.amount,
                    description: priorTx.rawDescription,
                    paymentMethod: priorTx.paymentMethodName || 'Default Card',
                  },
                  {
                    id: latestTx.id,
                    date: latestTx.date,
                    amount: latestTx.amount,
                    description: latestTx.rawDescription,
                    paymentMethod: latestTx.paymentMethodName || 'Default Card',
                  },
                ],
                notes: `Previous monthly baseline: ${formatCurrency(priorTx.amount)}. Current charge: ${formatCurrency(latestTx.amount)}.`,
              },
              actionPlaybook: [
                { stepNumber: 1, instruction: `Check account billing history for notification of the ${pctIncrease.toFixed(1)}% rate adjustment.` },
                { stepNumber: 2, instruction: `Verify whether team utilization justifies the higher tier or if standard features suffice.` },
                { stepNumber: 3, instruction: `Submit rate dispute or downgrade request using the pre-filled template.` },
              ],
              disputeTemplate: `To: ${sub.vendor} Customer Support\nSubject: Inquiry & Request to Revert Price Increase - Account Ref #${sub.paymentMethodName?.slice(-4) || 'Corp'}\n\nHello ${sub.vendor} Billing Team,\nI noticed a price adjustment on our account from ${formatCurrency(priorTx.amount)} to ${formatCurrency(latestTx.amount)}/month on ${latestTx.date}.\nWe have been loyal customers and were not formally alerted to this rate increase. We kindly request either a promotional grandfathered rate or assistance downgrading our subscription.\n\nThank you,\nAccount Management`,
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
   * Rule 2: Detect duplicate subscriptions (same vendor or duplicate user plans across different cards)
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
        const primary = subs[0];
        const secondary = subs[1];
        const monthlyImpact = secondary.amount;
        const annualImpact = Number((monthlyImpact * 12).toFixed(2));

        issues.push({
          id: `audit-dup-${vendor.replace(/\s+/g, '-')}`,
          type: 'duplicate_billing',
          severity: 'critical',
          status: 'open',
          category: primary.category,
          title: `Duplicate Accounts: Multiple active plans with ${primary.vendor}`,
          description: `Identified ${subs.length} concurrent subscriptions for ${primary.vendor}: "${primary.name}" (${formatCurrency(primary.amount)}/mo) and "${secondary.name}" (${formatCurrency(secondary.amount)}/mo) charged to separate corporate cards.`,
          detectedAt: '2026-09-01',
          impactMonthly: Number(monthlyImpact.toFixed(2)),
          impactAnnual: annualImpact,
          currency: primary.currency,
          subscriptionId: secondary.id,
          subscriptionName: secondary.name,
          recommendedAction: `Consolidate user accounts into primary plan (${primary.name}) and terminate redundant secondary subscription.`,
          potentialSavings: annualImpact,
          evidence: {
            baselineAmount: primary.amount,
            chargedAmount: secondary.amount,
            paymentMethodsInvolved: subs.map((s) => s.paymentMethodName || 'Unknown Card'),
            notes: `Primary: ${primary.name} (${primary.paymentMethodName}). Secondary: ${secondary.name} (${secondary.paymentMethodName}).`,
          },
          actionPlaybook: [
            { stepNumber: 1, instruction: `Send Family/Team invite link from primary plan (${primary.name}) to secondary plan users.` },
            { stepNumber: 2, instruction: `Log into ${secondary.paymentMethodName || 'Virtual Card'} portal and cancel secondary subscription.` },
            { stepNumber: 3, instruction: `Capture instant ${formatCurrency(annualImpact)}/yr annual savings with zero loss in service.` },
          ],
          disputeTemplate: `To: ${primary.vendor} Support\nSubject: Account Consolidation & Duplicate Cancellation Request\n\nHello Support Team,\nOur organization has identified two concurrent subscriptions charged to separate corporate payment cards:\n- Primary: ${primary.name} (${primary.paymentMethodName})\n- Secondary: ${secondary.name} (${secondary.paymentMethodName})\n\nWe are consolidating all users under our primary plan. Please cancel the secondary subscription (${secondary.name}) effective immediately and confirm no further renewal debits occur.\n\nThank you,\nFinance Operations`,
          metadata: {
            accounts: subs.map((s) => `${s.name} (${s.paymentMethodName || 'Unknown Card'})`),
          },
        });
      }
    });

    return issues;
  }

  /**
   * Rule 3: Detect same-day double swipes and accidental duplicate debits
   */
  private static detectSameDayDoubleCharges(transactions: Transaction[]): AuditIssue[] {
    const issues: AuditIssue[] = [];
    const processedPairs = new Set<string>();

    for (let i = 0; i < transactions.length; i++) {
      const txA = transactions[i];

      for (let j = i + 1; j < transactions.length; j++) {
        const txB = transactions[j];

        if (txA.merchantName.toLowerCase() !== txB.merchantName.toLowerCase()) continue;
        if (txA.paymentMethodId !== txB.paymentMethodId) continue;
        if (Math.abs(txA.amount - txB.amount) > 0.01) continue;

        const daysApart = Math.abs(getDaysDifference(txA.date, txB.date));
        if (daysApart <= 1) {
          const pairKey = [txA.id, txB.id].sort().join('-');
          if (processedPairs.has(pairKey)) continue;
          processedPairs.add(pairKey);

          issues.push({
            id: `audit-double-swipe-${txA.id}`,
            type: 'double_charge',
            severity: 'critical',
            status: 'open',
            category: txA.category,
            title: `Accidental Double-Charge: ${txA.merchantName} billed twice`,
            description: `Two identical debits of ${formatCurrency(txA.amount)} were processed on ${txA.date} for ${txA.merchantName} on ${txA.paymentMethodName || 'Corporate Card'}. Conflicting IDs: ${txA.id} and ${txB.id}.`,
            detectedAt: txA.date,
            impactMonthly: txA.amount,
            impactAnnual: Number((txA.amount * 12).toFixed(2)),
            currency: txA.currency,
            relatedTransactionIds: [txA.id, txB.id],
            recommendedAction: `Submit an immediate duplicate charge dispute with ${txA.merchantName} or file a chargeback for transaction ${txB.id}.`,
            potentialSavings: txA.amount,
            evidence: {
              baselineAmount: txA.amount,
              chargedAmount: txA.amount * 2,
              paymentMethodsInvolved: [txA.paymentMethodName || 'Card'],
              conflictingTransactions: [
                {
                  id: txA.id,
                  date: txA.date,
                  amount: txA.amount,
                  description: txA.rawDescription,
                  paymentMethod: txA.paymentMethodName || 'Card',
                },
                {
                  id: txB.id,
                  date: txB.date,
                  amount: txB.amount,
                  description: txB.rawDescription,
                  paymentMethod: txB.paymentMethodName || 'Card',
                },
              ],
              notes: 'Same merchant, identical debit amount, and same card processed within 24 hours.',
            },
            actionPlaybook: [
              { stepNumber: 1, instruction: `Verify that two services or seat licenses were not intentionally purchased concurrently.` },
              { stepNumber: 2, instruction: `Copy the pre-filled dispute email and send to ${txA.merchantName} billing support.` },
              { stepNumber: 3, instruction: `If unresolved within 5 business days, flag transaction ${txB.id} for merchant refund.` },
            ],
            disputeTemplate: `To: ${txA.merchantName} Billing Support\nSubject: Duplicate Transaction Refund Request - Reference ${txA.id}\n\nDear Billing Team,\nOn ${txA.date}, two identical debits of ${formatCurrency(txA.amount)} were charged to our corporate payment instrument (${txA.paymentMethodName}):\n- Transaction A: ${txA.id} (${txA.rawDescription})\n- Transaction B: ${txB.id} (${txB.rawDescription})\n\nThis appears to be an unintended duplicate charge processing error. Please immediately refund the second charge of ${formatCurrency(txA.amount)} (${txB.id}) to the original payment instrument.\n\nThank you,\nFinance Department`,
          });
        }
      }
    }

    return issues;
  }

  /**
   * Rule 4: Detect zombie subscriptions where no user activity has been logged for > threshold days
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
        const annualImpact = Number((sub.amount * 12).toFixed(2));

        issues.push({
          id: `audit-zombie-${sub.id}`,
          type: 'zombie_subscription',
          severity: 'critical',
          status: 'open',
          category: sub.category,
          title: `Zombie SaaS Seat: Inactive ${sub.name}`,
          description: `Zero user logins, edits, or active sessions recorded for ${daysInactive} consecutive days (audit threshold: ${thresholdDays} days). Ongoing monthly drain: ${formatCurrency(sub.amount)}/mo (${formatCurrency(annualImpact)}/yr).`,
          detectedAt: baseDate,
          impactMonthly: sub.amount,
          impactAnnual: annualImpact,
          currency: sub.currency,
          subscriptionId: sub.id,
          subscriptionName: sub.name,
          recommendedAction: `De-provision inactive seat license in admin console or cancel subscription immediately.`,
          potentialSavings: annualImpact,
          evidence: {
            inactivityDays: daysInactive,
            baselineAmount: sub.amount,
            paymentMethodsInvolved: [sub.paymentMethodName || 'Default Card'],
            notes: `Last user activity logged on ${sub.lastActivityDate}. Total dormancy: ${daysInactive} days.`,
          },
          actionPlaybook: [
            { stepNumber: 1, instruction: `Navigate to ${sub.vendor} Admin Settings -> Members & Licenses.` },
            { stepNumber: 2, instruction: `Unassign license seat from inactive team member or convert user to free Viewer role.` },
            { stepNumber: 3, instruction: `Confirm monthly billing adjustment of ${formatCurrency(sub.amount)}/mo on next statement.` },
          ],
          disputeTemplate: `To: ${sub.vendor} Account Management\nSubject: License Seat De-provisioning Notice - ${sub.name}\n\nHello Support Team,\nOur internal software audit identified that user seat license "${sub.name}" on Card ${sub.paymentMethodName} has had zero activity for ${daysInactive} days.\nPlease remove this seat license effective immediately and adjust our monthly invoice from ${formatCurrency(sub.amount)}/mo to reflect the updated seat count.\n\nThank you,\nIT & Finance Operations`,
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
   * Rule 5: Detect expiring trials converting to paid tiers & renewal radar risks
   */
  private static detectExpiringTrialsAndRenewalRisks(
    subscriptions: Subscription[],
    baseDate: string
  ): AuditIssue[] {
    const issues: AuditIssue[] = [];

    for (const sub of subscriptions) {
      if (sub.status === 'cancelled') continue;

      const daysUntil = getDaysDifference(sub.nextBillingDate, baseDate);

      // Vector 5A: Expiring Free/Intro Trial
      if (sub.status === 'trial') {
        if (daysUntil <= 3 && daysUntil >= 0) {
          const annualImpact = Number((sub.amount * 12).toFixed(2));

          issues.push({
            id: `audit-trial-${sub.id}`,
            type: 'trial_ending_soon',
            severity: 'high',
            status: 'open',
            category: sub.category,
            title: `Expiring Trial: ${sub.name} converts in ${daysUntil === 0 ? 'Today' : `${daysUntil}d`}`,
            description: `Introductory trial expires on ${sub.nextBillingDate}. Auto-renewal is enabled and will execute for ${formatCurrency(sub.amount)}/month (${formatCurrency(annualImpact)}/yr commitment).`,
            detectedAt: baseDate,
            impactMonthly: sub.amount,
            impactAnnual: annualImpact,
            currency: sub.currency,
            subscriptionId: sub.id,
            subscriptionName: sub.name,
            recommendedAction: `Verify team adoption and disable auto-renew before charge executes if not actively utilized.`,
            potentialSavings: annualImpact,
            evidence: {
              daysToRenewal: daysUntil,
              chargedAmount: sub.amount,
              paymentMethodsInvolved: [sub.paymentMethodName || 'Virtual Card'],
              notes: `Trial converts to ${formatCurrency(sub.amount)}/mo on ${sub.nextBillingDate}.`,
            },
            actionPlaybook: [
              { stepNumber: 1, instruction: `Review trial usage metrics to evaluate if team intends to adopt this software in production.` },
              { stepNumber: 2, instruction: `If adoption is pending, disable auto-renew in account billing settings or pause virtual card.` },
              { stepNumber: 3, instruction: `Prevent accidental ${formatCurrency(sub.amount)} auto-debit.` },
            ],
            disputeTemplate: `To: ${sub.vendor} Billing Support\nSubject: Cancellation of Trial Auto-Renew - ${sub.name}\n\nHello,\nWe are currently evaluating our trial for ${sub.name}. Please confirm that auto-renewal scheduled for ${sub.nextBillingDate} is cancelled and that our payment method (${sub.paymentMethodName}) will not be billed.\n\nThank you,\nEngineering Lead`,
          });
        }
      }

      // Vector 5B: Large Lump-Sum Annual Renewal Warning
      if (sub.billingCycle === 'annual' && daysUntil <= 20 && daysUntil >= 0) {
        issues.push({
          id: `audit-renewal-risk-${sub.id}`,
          type: 'renewal_risk',
          severity: 'medium',
          status: 'open',
          category: sub.category,
          title: `Upcoming Annual Renewal: ${sub.name} renews in ${daysUntil}d`,
          description: `Annual renewal payment of ${formatCurrency(sub.amount)} scheduled for ${sub.nextBillingDate}. Auto-renew is active on ${sub.paymentMethodName || 'Corporate Card'}.`,
          detectedAt: baseDate,
          impactMonthly: Number((sub.amount / 12).toFixed(2)),
          impactAnnual: sub.amount,
          currency: sub.currency,
          subscriptionId: sub.id,
          subscriptionName: sub.name,
          recommendedAction: `Audit license seat utilization and confirm renewal before automatic annual debit occurs.`,
          potentialSavings: sub.amount,
          evidence: {
            daysToRenewal: daysUntil,
            chargedAmount: sub.amount,
            paymentMethodsInvolved: [sub.paymentMethodName || 'Card'],
            notes: `Annual lump-sum debit of ${formatCurrency(sub.amount)} on ${sub.nextBillingDate}.`,
          },
          actionPlaybook: [
            { stepNumber: 1, instruction: `Confirm with department leads whether ${sub.name} is scheduled for renewal.` },
            { stepNumber: 2, instruction: `Negotiate multi-year tier discount or adjust seat count prior to renewal date.` },
          ],
        });
      }
    }

    return issues;
  }

  /**
   * Rule 6: Detect category overlap & redundant software tooling
   */
  private static detectCategoryOverlaps(subscriptions: Subscription[]): AuditIssue[] {
    const issues: AuditIssue[] = [];

    // Cloud Storage Overlap
    const storageSubs = subscriptions.filter(
      (s) =>
        s.status !== 'cancelled' &&
        (s.name.toLowerCase().includes('storage') ||
          s.name.toLowerCase().includes('drive') ||
          s.name.toLowerCase().includes('dropbox'))
    );

    if (storageSubs.length >= 2) {
      const subToConsolidate = storageSubs[1];
      const annualImpact = Number((subToConsolidate.amount * 12).toFixed(2));

      issues.push({
        id: `audit-redundant-storage`,
        type: 'redundant_service',
        severity: 'medium',
        status: 'open',
        category: 'productivity',
        title: 'Redundant Cloud Storage: Parallel Dropbox & Google One Plans',
        description: `Concurrent paid storage subscriptions detected across ${storageSubs.map((s) => s.name).join(' and ')}. Migrating files to Google One (2TB) eliminates ${formatCurrency(annualImpact)}/yr in duplicate storage.`,
        detectedAt: '2026-09-01',
        impactMonthly: subToConsolidate.amount,
        impactAnnual: annualImpact,
        currency: subToConsolidate.currency,
        subscriptionId: subToConsolidate.id,
        subscriptionName: subToConsolidate.name,
        recommendedAction: 'Consolidate active backups into Google One (2TB) and sunset secondary Dropbox subscription.',
        potentialSavings: annualImpact,
        evidence: {
          baselineAmount: storageSubs[0].amount,
          chargedAmount: subToConsolidate.amount,
          paymentMethodsInvolved: storageSubs.map((s) => s.paymentMethodName || 'Card'),
          notes: `Google One provides 2TB capacity with ample headroom. Dropbox Pro ($${subToConsolidate.amount}/mo) represents redundant capacity.`,
        },
        actionPlaybook: [
          { stepNumber: 1, instruction: `Export active shared folders from Dropbox to Google Drive.` },
          { stepNumber: 2, instruction: `Cancel Dropbox Pro subscription in account settings before next billing cycle.` },
          { stepNumber: 3, instruction: `Realize ${formatCurrency(annualImpact)} in recurring annual savings.` },
        ],
      });
    }

    return issues;
  }

  /**
   * Rule 7: Detect unusual spending spikes and outlier charges
   */
  private static detectUnusualSpendingSpikes(transactions: Transaction[]): AuditIssue[] {
    const issues: AuditIssue[] = [];
    const merchantGroups = new Map<string, Transaction[]>();

    for (const tx of transactions) {
      if (tx.status === 'refunded') continue;
      const key = tx.merchantName.toLowerCase();
      const list = merchantGroups.get(key) || [];
      list.push(tx);
      merchantGroups.set(key, list);
    }

    merchantGroups.forEach((txList) => {
      if (txList.length >= 2) {
        const sorted = [...txList].sort((a, b) => b.date.localeCompare(a.date));
        const latestTx = sorted[0];
        const historical = sorted.slice(1);

        const avgHistorical =
          historical.reduce((sum, tx) => sum + tx.amount, 0) / historical.length;

        // Spike condition: Latest charge is >= 2.0x historical average and at least $25 greater
        if (latestTx.amount >= avgHistorical * 2.0 && latestTx.amount - avgHistorical >= 25) {
          const spikeAmount = Number((latestTx.amount - avgHistorical).toFixed(2));
          const pctIncrease = Number((((latestTx.amount - avgHistorical) / avgHistorical) * 100).toFixed(1));

          issues.push({
            id: `audit-spike-${latestTx.id}`,
            type: 'unusual_spending_spike',
            severity: 'high',
            status: 'open',
            category: latestTx.category,
            title: `Unusual Spending Spike: ${latestTx.merchantName} jumped by +${pctIncrease}%`,
            description: `Recent charge of ${formatCurrency(latestTx.amount)} on ${latestTx.date} significantly exceeded the historical average of ${formatCurrency(avgHistorical)} (+${pctIncrease}% spike). One-time overage leakage: +${formatCurrency(spikeAmount)}.`,
            detectedAt: latestTx.date,
            impactMonthly: spikeAmount,
            impactAnnual: Number((spikeAmount * 12).toFixed(2)),
            currency: latestTx.currency,
            relatedTransactionIds: [latestTx.id, ...historical.map((h) => h.id)],
            recommendedAction: `Inspect vendor usage logs for runaway API requests, bandwidth overages, or unauthorized carrier surcharges.`,
            potentialSavings: spikeAmount,
            evidence: {
              baselineAmount: Number(avgHistorical.toFixed(2)),
              chargedAmount: latestTx.amount,
              variancePercentage: pctIncrease,
              paymentMethodsInvolved: [latestTx.paymentMethodName || 'Corporate Card'],
              conflictingTransactions: sorted.slice(0, 3).map((tx) => ({
                id: tx.id,
                date: tx.date,
                amount: tx.amount,
                description: tx.rawDescription,
                paymentMethod: tx.paymentMethodName || 'Corporate Card',
              })),
              notes: `Historical mean: ${formatCurrency(avgHistorical)}. Latest charge: ${formatCurrency(latestTx.amount)}. Increase: +${formatCurrency(spikeAmount)}.`,
            },
            actionPlaybook: [
              { stepNumber: 1, instruction: `Review ${latestTx.merchantName} usage analytics dashboard to identify runaway cron jobs or carrier fees.` },
              { stepNumber: 2, instruction: `Implement hard spending alert caps in vendor portal to prevent future overruns.` },
              { stepNumber: 3, instruction: `Request courtesy credit waiver for accidental overage.` },
            ],
            disputeTemplate: `To: ${latestTx.merchantName} Support\nSubject: Unexpected Billing Spike Inquiry - Ref ${latestTx.id}\n\nHello Support Team,\nOur steady monthly usage has historically averaged ${formatCurrency(avgHistorical)}/mo. On ${latestTx.date}, our invoice spiked unexpectedly to ${formatCurrency(latestTx.amount)} (${latestTx.rawDescription}).\nCould you please provide an itemized breakdown of the overage charges? If this was caused by an anomaly or retry loop, we respectfully request a courtesy credit for the difference (${formatCurrency(spikeAmount)}).\n\nThank you,\nEngineering Operations`,
          });
        }
      }
    });

    return issues;
  }

  /**
   * Rule 8: Detect high-concentration budget commitments
   */
  private static detectExpensiveCommitments(subscriptions: Subscription[]): AuditIssue[] {
    const issues: AuditIssue[] = [];
    const active = subscriptions.filter((s) => s.status !== 'cancelled');
    const totalMrr = active.reduce((sum, s) => sum + s.amount, 0);

    for (const sub of active) {
      const concentrationPct = (sub.amount / totalMrr) * 100;

      // If single subscription is > 25% of total recurring software spend
      if (concentrationPct >= 25 && sub.amount >= 100) {
        const potentialSavingsAnnual = Number((sub.amount * 12 * 0.28).toFixed(2)); // 28% savings plan discount

        issues.push({
          id: `audit-concentration-${sub.id}`,
          type: 'expensive_commitment',
          severity: 'medium',
          status: 'open',
          category: sub.category,
          title: `High Budget Concentration: ${sub.name} (${concentrationPct.toFixed(1)}% of MRR)`,
          description: `${sub.name} accounts for ${formatCurrency(sub.amount)}/mo (${concentrationPct.toFixed(1)}% of total monthly recurring software spend). Switching on-demand resources to a 1-year compute commitment yields ~28% discount (${formatCurrency(potentialSavingsAnnual)}/yr).`,
          detectedAt: '2026-09-01',
          impactMonthly: Number((potentialSavingsAnnual / 12).toFixed(2)),
          impactAnnual: potentialSavingsAnnual,
          currency: sub.currency,
          subscriptionId: sub.id,
          subscriptionName: sub.name,
          recommendedAction: `Transition baseline on-demand compute to 1-year no-upfront Savings Plans in ${sub.vendor} console.`,
          potentialSavings: potentialSavingsAnnual,
          evidence: {
            baselineAmount: sub.amount,
            chargedAmount: sub.amount,
            paymentMethodsInvolved: [sub.paymentMethodName || 'Checking Account'],
            notes: `Single vendor accounts for ${concentrationPct.toFixed(1)}% of entire software run-rate.`,
          },
          actionPlaybook: [
            { stepNumber: 1, instruction: `Open ${sub.vendor} Cost Explorer -> Recommendations.` },
            { stepNumber: 2, instruction: `Select 1-Year No Upfront Compute Savings Plan.` },
            { stepNumber: 3, instruction: `Capture ~28% discount with zero operational disruption.` },
          ],
        });
      }
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
    const mediumIssuesCount = openIssues.filter((i) => i.severity === 'medium').length;
    const lowIssuesCount = openIssues.filter((i) => i.severity === 'low').length;

    const totalAnnualLeakage = openIssues.reduce((sum, i) => sum + i.impactAnnual, 0);
    const totalMonthlyLeakage = openIssues.reduce((sum, i) => sum + i.impactMonthly, 0);

    // Leakage breakdown by category
    const leakageByCategory: Record<string, number> = {};
    for (const issue of openIssues) {
      const cat = issue.category || 'other';
      leakageByCategory[cat] = Number(((leakageByCategory[cat] || 0) + issue.impactAnnual).toFixed(2));
    }

    // Health score starts at 100 and loses points based on severity of open issues
    let healthScore = 100;
    healthScore -= criticalIssuesCount * 15;
    healthScore -= highIssuesCount * 8;
    healthScore -= mediumIssuesCount * 4;
    healthScore -= lowIssuesCount * 1;
    // Reward resolved issues
    healthScore += resolvedIssues.length * 5;
    healthScore = Math.max(10, Math.min(100, healthScore));

    return {
      healthScore,
      totalOpenIssues: openIssues.length,
      criticalIssuesCount,
      highIssuesCount,
      mediumIssuesCount,
      totalAnnualLeakage: Number(totalAnnualLeakage.toFixed(2)),
      totalMonthlyLeakage: Number(totalMonthlyLeakage.toFixed(2)),
      resolvedIssuesCount: resolvedIssues.length,
      leakageByCategory,
      issuesBySeverity: {
        critical: criticalIssuesCount,
        high: highIssuesCount,
        medium: mediumIssuesCount,
        low: lowIssuesCount,
      },
    };
  }
}
