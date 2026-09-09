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
  resolveAuditIssue: (issueId: string) => void;
  dismissAuditIssue: (issueId: string) => void;
  applySavingsOpportunity: (opportunityId: string) => void;
  triggerAuditScan: () => void;
  toggleSubscriptionAutoRenew: (subscriptionId: string) => void;
}

const FinancialDataContext = createContext<FinancialDataContextType | undefined>(undefined);

export const FinancialDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(MOCK_SUBSCRIPTIONS);
  const [transactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [auditIssues, setAuditIssues] = useState<AuditIssue[]>(MOCK_AUDIT_ISSUES);
  const [savingsOpportunities, setSavingsOpportunities] = useState<SavingsOpportunity[]>(
    MOCK_SAVINGS_OPPORTUNITIES
  );
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // Computed Summaries
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
  }, []);

  const triggerAuditScan = useCallback(() => {
    setIsScanning(true);
    setTimeout(() => {
      const { issues } = AuditEngine.runAudit(subscriptions, transactions);
      // Merge status with existing issues
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
        resolveAuditIssue,
        dismissAuditIssue,
        applySavingsOpportunity,
        triggerAuditScan,
        toggleSubscriptionAutoRenew,
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
