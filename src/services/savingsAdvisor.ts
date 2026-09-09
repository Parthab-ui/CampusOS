import {
  SavingsOpportunity,
  SavingsSummary,
  SavingsSimulationResult,
  Subscription,
  AuditIssue,
} from '../core/types';
import { formatCurrency } from '../core/config/constants';

export class SavingsAdvisor {
  /**
   * Generate prioritized savings opportunities dynamically from detected audit issues and active subscriptions
   */
  static generateOpportunities(
    auditIssues: AuditIssue[],
    subscriptions: Subscription[]
  ): SavingsOpportunity[] {
    const opportunities: SavingsOpportunity[] = [];

    // Opportunity 1: De-provision Inactive Zombie Seats
    const zombieIssue = auditIssues.find(
      (i) => i.type === 'zombie_subscription' && i.status !== 'dismissed'
    );
    if (zombieIssue) {
      opportunities.push({
        id: 'save-zombie-deprovision',
        title: `De-provision Inactive ${zombieIssue.subscriptionName || 'SaaS Seat'}`,
        description: `Eliminate ${formatCurrency(zombieIssue.impactMonthly)}/mo recurring waste by removing the license seat with zero activity for over 60 days.`,
        actionType: 'cancel_zombie',
        effortLevel: 'instant',
        potentialMonthlySavings: zombieIssue.impactMonthly,
        potentialAnnualSavings: zombieIssue.impactAnnual,
        currency: zombieIssue.currency,
        category: zombieIssue.category || 'productivity',
        annualizedRoi: 100,
        implementationTimeEstimate: '1 min',
        riskOfServiceInterruption: 'none',
        subscriptionIds: zombieIssue.subscriptionId ? [zombieIssue.subscriptionId] : [],
        subscriptionNames: [zombieIssue.subscriptionName || 'Inactive License'],
        difficultyScore: 1,
        recommendedNextStep: 'Click portal link and remove user license seat in admin console.',
        stepByStepGuide: [
          'Navigate to vendor Admin Console -> Members & Licenses.',
          'Identify inactive user seat and select "Unassign License" or "Convert to Viewer-Restricted".',
          'Confirm immediate license count reduction on monthly invoice.',
        ],
        actionTemplate: `Subject: Immediate Seat De-provisioning Notice\n\nPlease unassign license seat "${zombieIssue.subscriptionName}" to eliminate recurring software charges for this inactive user.`,
        isApplied: zombieIssue.status === 'resolved',
      });
    }

    // Opportunity 2: Consolidate Duplicate Accounts
    const duplicateIssue = auditIssues.find(
      (i) => i.type === 'duplicate_billing' && i.status !== 'dismissed'
    );
    if (duplicateIssue) {
      opportunities.push({
        id: 'save-duplicate-eliminate',
        title: `Consolidate Accounts & Eliminate Duplicate ${duplicateIssue.subscriptionName || 'Plan'}`,
        description: `Terminate redundant secondary subscription (${formatCurrency(duplicateIssue.impactMonthly)}/mo) and consolidate team members under the primary master plan.`,
        actionType: 'eliminate_duplicate',
        effortLevel: 'easy',
        potentialMonthlySavings: duplicateIssue.impactMonthly,
        potentialAnnualSavings: duplicateIssue.impactAnnual,
        currency: duplicateIssue.currency,
        category: duplicateIssue.category || 'streaming_media',
        annualizedRoi: 100,
        implementationTimeEstimate: '3 mins',
        riskOfServiceInterruption: 'none',
        subscriptionIds: duplicateIssue.subscriptionId ? [duplicateIssue.subscriptionId] : [],
        subscriptionNames: [duplicateIssue.subscriptionName || 'Duplicate Account'],
        difficultyScore: 2,
        recommendedNextStep: 'Send Family/Team invite link to secondary account and cancel secondary subscription.',
        stepByStepGuide: [
          'Send member invite link from the primary plan to the secondary user email address.',
          'Verify that secondary user has joined the consolidated group.',
          'Terminate secondary recurring billing in billing portal.',
        ],
        actionTemplate: `Subject: Cancellation of Duplicate Subscription\n\nPlease cancel subscription "${duplicateIssue.subscriptionName}" as we have consolidated our team under our primary master account.`,
        isApplied: duplicateIssue.status === 'resolved',
      });
    }

    // Opportunity 3: Cloud Storage Redundancy Consolidation
    const storageIssue = auditIssues.find(
      (i) => i.type === 'redundant_service' && i.status !== 'dismissed'
    );
    if (storageIssue) {
      opportunities.push({
        id: 'save-storage-consolidation',
        title: 'Consolidate Cloud Storage into Google One (2TB)',
        description: `Sunset secondary Dropbox Pro (${formatCurrency(storageIssue.impactMonthly)}/mo) and utilize the remaining 1.4TB available headroom on Google One.`,
        actionType: 'consolidate',
        effortLevel: 'moderate',
        potentialMonthlySavings: storageIssue.impactMonthly,
        potentialAnnualSavings: storageIssue.impactAnnual,
        currency: storageIssue.currency,
        category: 'productivity',
        annualizedRoi: 100,
        implementationTimeEstimate: '10 mins',
        riskOfServiceInterruption: 'low',
        subscriptionIds: storageIssue.subscriptionId ? [storageIssue.subscriptionId] : [],
        subscriptionNames: [storageIssue.subscriptionName || 'Dropbox'],
        difficultyScore: 3,
        recommendedNextStep: 'Export remaining 340GB files from Dropbox to Google Drive and terminate Dropbox billing.',
        stepByStepGuide: [
          'Use Google Drive migration tool to sync shared cloud assets.',
          'Verify file integrity in Google Drive storage console.',
          'Cancel Dropbox Pro subscription to capture annual recurring savings.',
        ],
        actionTemplate: `Subject: Account Downgrade to Free Basic Tier\n\nPlease downgrade our Dropbox Pro subscription to the free Basic tier upon completion of the current billing cycle.`,
        isApplied: storageIssue.status === 'resolved',
      });
    }

    // Opportunity 4: Switch AWS Infrastructure to 1-Year Compute Savings Plan
    const awsSub = subscriptions.find((s) => s.vendor.toLowerCase().includes('amazon') || s.vendor.toLowerCase().includes('aws'));
    if (awsSub) {
      const discountMonthly = Number((awsSub.amount * 0.28).toFixed(2));
      const discountAnnual = Number((discountMonthly * 12).toFixed(2));

      opportunities.push({
        id: 'save-aws-savings-plans',
        title: 'Transition Baseline AWS Compute to 1-Year Savings Plan',
        description: `Switch steady-state on-demand EC2/Fargate/Lambda compute to 1-year No-Upfront Savings Plans for ~28% automatic discount (${formatCurrency(discountAnnual)}/yr).`,
        actionType: 'annual_switch',
        effortLevel: 'easy',
        potentialMonthlySavings: discountMonthly,
        potentialAnnualSavings: discountAnnual,
        currency: awsSub.currency,
        category: 'cloud_infrastructure',
        annualizedRoi: 28,
        implementationTimeEstimate: '4 mins',
        riskOfServiceInterruption: 'none',
        subscriptionIds: [awsSub.id],
        subscriptionNames: [awsSub.name],
        difficultyScore: 2,
        recommendedNextStep: 'Enable AWS Cost Explorer 1-year no-upfront compute recommendation in AWS Console.',
        stepByStepGuide: [
          'Log in to AWS Management Console -> AWS Cost Management -> Savings Plans.',
          'Select "Purchase Savings Plans" -> Compute Savings Plans -> 1-Year term -> No Upfront.',
          'Confirm hourly commitment based on recommended baseline.',
        ],
        actionTemplate: `Subject: AWS Savings Plan Purchase Approval\n\nApproved: Transition baseline steady-state compute to 1-Year No-Upfront Compute Savings Plan to capture $955.92/year in automated cloud savings.`,
        isApplied: false,
      });
    }

    // Opportunity 5: Freeze Expiring Trial Auto-Renewal
    const trialIssue = auditIssues.find((i) => i.type === 'trial_ending_soon' && i.status !== 'dismissed');
    if (trialIssue) {
      opportunities.push({
        id: 'save-trial-auto-renew',
        title: `Freeze Auto-Renew on Expiring ${trialIssue.subscriptionName || 'Trial'}`,
        description: `Prevent upcoming automatic ${formatCurrency(trialIssue.impactMonthly)}/month charge by pausing auto-renewal on Virtual Privacy Card before trial expires.`,
        actionType: 'cancel_trial',
        effortLevel: 'instant',
        potentialMonthlySavings: trialIssue.impactMonthly,
        potentialAnnualSavings: trialIssue.impactAnnual,
        currency: trialIssue.currency,
        category: trialIssue.category || 'ai_tools',
        annualizedRoi: 100,
        implementationTimeEstimate: '1 min',
        riskOfServiceInterruption: 'none',
        subscriptionIds: trialIssue.subscriptionId ? [trialIssue.subscriptionId] : [],
        subscriptionNames: [trialIssue.subscriptionName || 'Expiring Trial'],
        difficultyScore: 1,
        recommendedNextStep: 'Toggle auto-renew off in billing settings or freeze virtual card.',
        stepByStepGuide: [
          'Open account billing settings or virtual card management dashboard.',
          'Toggle "Auto-Renew" to Off or pause virtual card #9901.',
          'Evaluate team need before authorizing production subscription.',
        ],
        isApplied: trialIssue.status === 'resolved',
      });
    }

    return opportunities;
  }

  /**
   * Summarize savings opportunities and compute realized vs potential yield
   */
  static summarizeSavings(opportunities: SavingsOpportunity[]): SavingsSummary {
    const active = opportunities.filter((op) => !op.isApplied);
    const applied = opportunities.filter((op) => op.isApplied);

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

    const realizedAnnualSavings = Number(
      applied.reduce((acc, op) => acc + op.potentialAnnualSavings, 0).toFixed(2)
    );
    const realizedMonthlySavings = Number(
      applied.reduce((acc, op) => acc + op.potentialMonthlySavings, 0).toFixed(2)
    );

    // Savings breakdown by category
    const savingsByCategory: Record<string, number> = {};
    for (const op of opportunities) {
      const cat = op.category || 'other';
      savingsByCategory[cat] = Number(((savingsByCategory[cat] || 0) + op.potentialAnnualSavings).toFixed(2));
    }

    return {
      totalIdentifiedAnnualSavings,
      totalIdentifiedMonthlySavings,
      quickWinSavingsAnnual,
      realizedAnnualSavings,
      realizedMonthlySavings,
      opportunitiesCount: active.length,
      appliedCount: applied.length,
      savingsByCategory,
    };
  }

  /**
   * Compute real-time "What-If" simulation metrics
   */
  static simulateSavingsImpact(
    currentMrr: number,
    currentArr: number,
    currentHealthScore: number,
    appliedOpportunities: SavingsOpportunity[]
  ): SavingsSimulationResult {
    const totalMonthlySaved = appliedOpportunities.reduce(
      (sum, op) => sum + op.potentialMonthlySavings,
      0
    );
    const totalAnnualSaved = appliedOpportunities.reduce(
      (sum, op) => sum + op.potentialAnnualSavings,
      0
    );

    const projectedMrr = Math.max(0, Number((currentMrr - totalMonthlySaved).toFixed(2)));
    const projectedArr = Math.max(0, Number((currentArr - totalAnnualSaved).toFixed(2)));

    // Health score improves by ~6 points per applied optimization, capped at 100
    const projectedHealthScore = Math.min(
      100,
      currentHealthScore + appliedOpportunities.length * 7
    );

    return {
      currentMrr,
      projectedMrr,
      currentArr,
      projectedArr,
      netSavingsAnnual: Number(totalAnnualSaved.toFixed(2)),
      projectedHealthScore,
    };
  }
}
