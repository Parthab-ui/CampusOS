import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import {
  Subscription,
  Transaction,
  AuditIssue,
  AuditSummary,
  SavingsOpportunity,
  SavingsSummary,
  CashFlowForecast,
  SubscriptionSummary,
  PricePoint,
  SavingsSimulationResult,
} from '../core/types';
import {
  MOCK_SUBSCRIPTIONS,
  MOCK_TRANSACTIONS,
  MOCK_AUDIT_ISSUES,
  MOCK_SAVINGS_OPPORTUNITIES,
} from '../core/mock';
import {
  SubscriptionService,
  AuditEngine,
  ForecastEngine,
  SavingsAdvisor,
  MerchantNormalizer,
  RecurringIntelligenceEngine,
  DuplicateDetector,
  RenewalForecaster,
} from '../services';
import { formatCurrency } from '../core/config/constants';

export type ActiveTab = 'overview' | 'subscriptions' | 'audit' | 'transactions' | 'savings' | 'ai';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface FinancialDataContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  subscriptions: Subscription[];
  transactions: Transaction[];
  auditIssues: AuditIssue[];
  savingsOpportunities: SavingsOpportunity[];
  subscriptionSummary: SubscriptionSummary;
  auditSummary: AuditSummary;
  savingsSummary: SavingsSummary;
  savingsSimulation: SavingsSimulationResult;
  forecast: CashFlowForecast;
  isScanning: boolean;
  selectedTransaction: Transaction | null;
  setSelectedTransaction: (tx: Transaction | null) => void;
  selectedSubscription: Subscription | null;
  setSelectedSubscription: (sub: Subscription | null) => void;
  targetAuditIssueId: string | null;
  setTargetAuditIssueId: (id: string | null) => void;
  targetSavingsOpportunityId: string | null;
  setTargetSavingsOpportunityId: (id: string | null) => void;
  pendingAiPrompt: string | null;
  setPendingAiPrompt: (prompt: string | null) => void;
  isMobileNavOpen: boolean;
  setIsMobileNavOpen: (open: boolean) => void;
  isExportReportModalOpen: boolean;
  setIsExportReportModalOpen: (open: boolean) => void;
  navigateToAuditWithIssue: (issueId: string) => void;
  navigateToSavingsWithOpportunity: (opId: string) => void;
  navigateToAiWithPrompt: (prompt: string) => void;
  toasts: ToastMessage[];
  showToast: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  dismissToast: (id: string) => void;
  resolveAuditIssue: (issueId: string) => void;
  dismissAuditIssue: (issueId: string) => void;
  applySavingsOpportunity: (opportunityId: string) => void;
  revertSavingsOpportunity: (opportunityId: string) => void;
  triggerAuditScan: () => void;
  toggleSubscriptionAutoRenew: (subscriptionId: string) => void;
  convertTransactionToSubscription: (tx: Transaction) => void;
}

const FinancialDataContext = createContext<FinancialDataContextType | undefined>(undefined);

export const FinancialDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [rawSubscriptions, setSubscriptions] = useState<Subscription[]>(MOCK_SUBSCRIPTIONS);
  const [rawTransactions, setRawTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [auditIssues, setAuditIssues] = useState<AuditIssue[]>(MOCK_AUDIT_ISSUES);
  const [savingsOpportunities, setSavingsOpportunities] = useState<SavingsOpportunity[]>(
    MOCK_SAVINGS_OPPORTUNITIES
  );
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // Modal / Drawer Selection State
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);

  // Cross-Navigation & Deep-Linking State
  const [targetAuditIssueId, setTargetAuditIssueId] = useState<string | null>(null);
  const [targetSavingsOpportunityId, setTargetSavingsOpportunityId] = useState<string | null>(null);
  const [pendingAiPrompt, setPendingAiPrompt] = useState<string | null>(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const [isExportReportModalOpen, setIsExportReportModalOpen] = useState<boolean>(false);

  // Global Toasts State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
      const newToast: ToastMessage = {
        id: `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title,
        message,
        type,
      };
      setToasts((prev) => [...prev.slice(-3), newToast]); // keep max 4 toasts

      setTimeout(() => {
        dismissToast(newToast.id);
      }, 4000);
    },
    [dismissToast]
  );

  const navigateToAuditWithIssue = useCallback((issueId: string) => {
    setTargetAuditIssueId(issueId);
    setActiveTab('audit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const navigateToSavingsWithOpportunity = useCallback((opId: string) => {
    setTargetSavingsOpportunityId(opId);
    setActiveTab('savings');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const navigateToAiWithPrompt = useCallback((prompt: string) => {
    setPendingAiPrompt(prompt);
    setActiveTab('ai');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // 1. Process and enrich transactions with Merchant Normalization, Recurrence Intelligence, and Duplicate Detection
  const transactions = useMemo(() => {
    // Stage 1: Normalize merchant names and domains
    const normalized = rawTransactions.map((tx) => {
      const merchantIntel = MerchantNormalizer.normalize(tx.rawDescription, tx.category);
      return {
        ...tx,
        merchantName: merchantIntel.canonicalName,
        merchantIntelligence: merchantIntel,
      };
    });

    // Stage 2: Duplicate detection
    const duplicateMap = DuplicateDetector.analyzeLedger(normalized);

    // Stage 3: Recurring intelligence
    return normalized.map((tx) => {
      const recurringIntel = RecurringIntelligenceEngine.analyzeTransaction(tx, normalized);
      const duplicateAlert = duplicateMap.get(tx.id);

      return {
        ...tx,
        recurringIntelligence: recurringIntel,
        isRecurring: recurringIntel.isRecurring,
        confidenceScore: recurringIntel.confidenceScore,
        recurringCadence: recurringIntel.detectedCadence,
        duplicateAlert,
        status: duplicateAlert?.isDuplicate ? ('flagged' as const) : tx.status,
      };
    });
  }, [rawTransactions]);

  // 2. Process and enrich subscriptions with linked transactions, historical price points, and renewal forecast
  const subscriptions = useMemo(() => {
    return rawSubscriptions.map((sub) => {
      // Find all linked transactions
      const linked = transactions.filter(
        (tx) => tx.subscriptionId === sub.id || tx.merchantName.toLowerCase() === sub.vendor.toLowerCase()
      ).sort((a, b) => a.date.localeCompare(b.date));

      const linkedTransactionIds = linked.map((tx) => tx.id);
      const historicalPricePoints: PricePoint[] = linked.map((tx) => ({
        date: tx.date,
        amount: tx.amount,
        currency: tx.currency,
      }));

      const totalSpendToDate = Number(linked.reduce((sum, tx) => sum + tx.amount, 0).toFixed(2));
      const renewalIntelligence = RenewalForecaster.projectRenewal(sub);

      return {
        ...sub,
        linkedTransactionIds,
        historicalPricePoints,
        renewalIntelligence,
        totalSpendToDate,
      };
    });
  }, [rawSubscriptions, transactions]);

  // Summaries
  const subscriptionSummary = useMemo(
    () => SubscriptionService.getSubscriptionSummary(subscriptions),
    [subscriptions]
  );

  const auditSummary = useMemo(
    () => AuditEngine.calculateAuditSummary(auditIssues),
    [auditIssues]
  );

  const savingsSummary = useMemo(
    () => SavingsAdvisor.summarizeSavings(savingsOpportunities),
    [savingsOpportunities]
  );

  const forecast = useMemo(
    () => ForecastEngine.generateForecast(subscriptions, 30),
    [subscriptions]
  );

  const savingsSimulation = useMemo(() => {
    const applied = savingsOpportunities.filter((op) => op.isApplied);
    return SavingsAdvisor.simulateSavingsImpact(
      subscriptionSummary.totalMonthlyNormalizedSpend,
      subscriptionSummary.totalAnnualSpend,
      auditSummary.healthScore,
      applied
    );
  }, [savingsOpportunities, subscriptionSummary, auditSummary]);

  // Actions
  const resolveAuditIssue = useCallback((issueId: string) => {
    setAuditIssues((prev) =>
      prev.map((issue) => (issue.id === issueId ? { ...issue, status: 'resolved' } : issue))
    );
    showToast('Audit Issue Resolved', 'Anomaly marked as resolved and verified.', 'success');
  }, [showToast]);

  const dismissAuditIssue = useCallback((issueId: string) => {
    setAuditIssues((prev) =>
      prev.map((issue) => (issue.id === issueId ? { ...issue, status: 'dismissed' } : issue))
    );
    showToast('Finding Dismissed', 'Anomaly dismissed from active audit alerts.', 'info');
  }, [showToast]);

  const applySavingsOpportunity = useCallback((opportunityId: string) => {
    let targetOp: SavingsOpportunity | undefined;

    setSavingsOpportunities((prev) =>
      prev.map((op) => {
        if (op.id === opportunityId) {
          targetOp = op;
          return { ...op, isApplied: true };
        }
        return op;
      })
    );

    // Synchronize corresponding audit issue to 'resolved'
    setAuditIssues((prev) =>
      prev.map((issue) => {
        if (
          (opportunityId === 'save-figma-seat' && issue.subscriptionId === 'sub-figma') ||
          (opportunityId === 'save-spotify-duplicate' && issue.subscriptionId === 'sub-spotify-2') ||
          (opportunityId === 'save-trial-claude' && issue.subscriptionId === 'sub-claude-api') ||
          (opportunityId === 'save-storage-consolidation' && issue.type === 'redundant_service') ||
          (opportunityId === 'save-zombie-deprovision' && issue.type === 'zombie_subscription') ||
          (opportunityId === 'save-duplicate-eliminate' && issue.type === 'duplicate_billing')
        ) {
          return { ...issue, status: 'resolved' as const };
        }
        return issue;
      })
    );

    if (targetOp) {
      showToast(
        'Optimization Applied',
        `${targetOp.title} implemented! Yielding +${formatCurrency(targetOp.potentialAnnualSavings)}/yr in realized savings.`,
        'success'
      );
    } else {
      showToast('Optimization Applied', 'Savings action successfully executed.', 'success');
    }
  }, [showToast]);

  const revertSavingsOpportunity = useCallback((opportunityId: string) => {
    setSavingsOpportunities((prev) =>
      prev.map((op) => (op.id === opportunityId ? { ...op, isApplied: false } : op))
    );
    showToast('Optimization Reverted', 'Action reverted to previous baseline.', 'info');
  }, [showToast]);

  const toggleSubscriptionAutoRenew = useCallback((subId: string) => {
    let newState = false;
    setSubscriptions((prev) =>
      prev.map((s) => {
        if (s.id === subId) {
          newState = !s.autoRenew;
          return { ...s, autoRenew: !s.autoRenew };
        }
        return s;
      })
    );
    setSelectedSubscription((prev) => (prev && prev.id === subId ? { ...prev, autoRenew: !prev.autoRenew } : prev));
    showToast(
      'Auto-Renew Updated',
      newState ? 'Auto-renew turned ON for subscription.' : 'Auto-renew disabled. Will not recur automatically.',
      newState ? 'info' : 'warning'
    );
  }, [showToast]);

  const convertTransactionToSubscription = useCallback((tx: Transaction) => {
    const newSub: Subscription = {
      id: `sub-gen-${Date.now()}`,
      name: `${tx.merchantName} Subscription`,
      vendor: tx.merchantName,
      category: tx.category,
      amount: tx.amount,
      currency: tx.currency,
      billingCycle: tx.recurringCadence || 'monthly',
      status: 'active',
      tier: 'pro',
      startDate: tx.date,
      nextBillingDate: RenewalForecaster.calculateNextBillingDate(tx.date, tx.recurringCadence || 'monthly'),
      paymentMethodId: tx.paymentMethodId,
      paymentMethodName: tx.paymentMethodName,
      autoRenew: true,
      riskScore: 20,
      riskLevel: 'low',
      notes: `Generated automatically from recurring transaction ${tx.id}`,
    };

    setSubscriptions((prev) => [newSub, ...prev]);

    setRawTransactions((prev) =>
      prev.map((item) => (item.id === tx.id ? { ...item, subscriptionId: newSub.id } : item))
    );

    showToast('Subscription Created', `Converted recurring transaction for ${tx.merchantName} into active subscription tracking.`, 'success');
  }, [showToast]);

  const triggerAuditScan = useCallback(() => {
    setIsScanning(true);
    setTimeout(() => {
      const { issues } = AuditEngine.runAudit(subscriptions, transactions);
      setAuditIssues(issues);
      const newOps = SavingsAdvisor.generateOpportunities(issues, subscriptions);
      setSavingsOpportunities(newOps);
      setIsScanning(false);
      showToast('Audit Complete', `Scanned statement ledger. Identified ${issues.length} anomalies across all active accounts.`, 'info');
    }, 600);
  }, [subscriptions, transactions, showToast]);

  return (
    <FinancialDataContext.Provider
      value={{
        activeTab,
        setActiveTab,
        subscriptions,
        transactions,
        auditIssues,
        savingsOpportunities,
        subscriptionSummary,
        auditSummary,
        savingsSummary,
        savingsSimulation,
        forecast,
        isScanning,
        selectedTransaction,
        setSelectedTransaction,
        selectedSubscription,
        setSelectedSubscription,
        targetAuditIssueId,
        setTargetAuditIssueId,
        targetSavingsOpportunityId,
        setTargetSavingsOpportunityId,
        pendingAiPrompt,
        setPendingAiPrompt,
        isMobileNavOpen,
        setIsMobileNavOpen,
        isExportReportModalOpen,
        setIsExportReportModalOpen,
        navigateToAuditWithIssue,
        navigateToSavingsWithOpportunity,
        navigateToAiWithPrompt,
        toasts,
        showToast,
        dismissToast,
        resolveAuditIssue,
        dismissAuditIssue,
        applySavingsOpportunity,
        revertSavingsOpportunity,
        triggerAuditScan,
        toggleSubscriptionAutoRenew,
        convertTransactionToSubscription,
      }}
    >
      {children}
    </FinancialDataContext.Provider>
  );
};

export function useFinancialData(): FinancialDataContextType {
  const context = useContext(FinancialDataContext);
  if (!context) {
    throw new Error('useFinancialData must be used within a FinancialDataProvider');
  }
  return context;
}
