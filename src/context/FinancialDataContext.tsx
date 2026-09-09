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

export type ActiveTab = 'overview' | 'subscriptions' | 'audit' | 'transactions' | 'savings' | 'ai';

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
  forecast: CashFlowForecast;
  isScanning: boolean;
  selectedTransaction: Transaction | null;
  setSelectedTransaction: (tx: Transaction | null) => void;
  selectedSubscription: Subscription | null;
  setSelectedSubscription: (sub: Subscription | null) => void;
  resolveAuditIssue: (issueId: string) => void;
  dismissAuditIssue: (issueId: string) => void;
  applySavingsOpportunity: (opportunityId: string) => void;
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

  // Actions
  const resolveAuditIssue = useCallback((issueId: string) => {
    setAuditIssues((prev) =>
      prev.map((issue) => (issue.id === issueId ? { ...issue, status: 'resolved' } : issue))
    );
  }, []);

  const dismissAuditIssue = useCallback((issueId: string) => {
    setAuditIssues((prev) =>
      prev.map((issue) => (issue.id === issueId ? { ...issue, status: 'dismissed' } : issue))
    );
  }, []);

  const applySavingsOpportunity = useCallback((opportunityId: string) => {
    setSavingsOpportunities((prev) =>
      prev.map((op) => (op.id === opportunityId ? { ...op, isApplied: true } : op))
    );
  }, []);

  const toggleSubscriptionAutoRenew = useCallback((subId: string) => {
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === subId ? { ...s, autoRenew: !s.autoRenew } : s))
    );
    // Also update selectedSubscription if currently open
    setSelectedSubscription((prev) => (prev && prev.id === subId ? { ...prev, autoRenew: !prev.autoRenew } : prev));
  }, []);

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

    // Link transaction to this new sub
    setRawTransactions((prev) =>
      prev.map((item) => (item.id === tx.id ? { ...item, subscriptionId: newSub.id } : item))
    );
  }, []);

  const triggerAuditScan = useCallback(() => {
    setIsScanning(true);
    setTimeout(() => {
      const { issues } = AuditEngine.runAudit(subscriptions, transactions);
      setAuditIssues(issues);
      setIsScanning(false);
    }, 600);
  }, [subscriptions, transactions]);

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
        forecast,
        isScanning,
        selectedTransaction,
        setSelectedTransaction,
        selectedSubscription,
        setSelectedSubscription,
        resolveAuditIssue,
        dismissAuditIssue,
        applySavingsOpportunity,
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
