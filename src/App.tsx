import React from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { OverviewView } from './components/dashboard/OverviewView';
import { SubscriptionsView } from './components/subscriptions/SubscriptionsView';
import { AuditView } from './components/audit/AuditView';
import { TransactionsView } from './components/transactions/TransactionsView';
import { SavingsView } from './components/savings/SavingsView';
import { AIAssistantView } from './components/ai/AIAssistantView';
import { useFinancialData } from './context/FinancialDataContext';

export const App: React.FC = () => {
  const { activeTab } = useFinancialData();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewView />;
      case 'subscriptions':
        return <SubscriptionsView />;
      case 'audit':
        return <AuditView />;
      case 'transactions':
        return <TransactionsView />;
      case 'savings':
        return <SavingsView />;
      case 'ai':
        return <AIAssistantView />;
      default:
        return <OverviewView />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <main className="app-main">
        <TopBar />
        <div className="page-content">{renderActiveView()}</div>
      </main>
    </div>
  );
};
