import React from 'react';
import {
  LayoutDashboard,
  CreditCard,
  ShieldAlert,
  ReceiptText,
  PiggyBank,
  Bot,
  Activity,
} from 'lucide-react';
import { useFinancialData, ActiveTab } from '../../context/FinancialDataContext';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, auditSummary, savingsSummary, subscriptions } =
    useFinancialData();

  const navItems: {
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
    counter?: number;
    counterType?: 'danger' | 'savings' | 'neutral';
  }[] = [
    {
      id: 'overview',
      label: 'Executive Overview',
      icon: <LayoutDashboard size={18} />,
    },
    {
      id: 'subscriptions',
      label: 'Subscriptions',
      icon: <CreditCard size={18} />,
      counter: subscriptions.length,
      counterType: 'neutral',
    },
    {
      id: 'audit',
      label: 'FinTech Audit',
      icon: <ShieldAlert size={18} />,
      counter: auditSummary.totalOpenIssues,
      counterType: 'danger',
    },
    {
      id: 'transactions',
      label: 'Ledger Transactions',
      icon: <ReceiptText size={18} />,
    },
    {
      id: 'savings',
      label: 'Savings Optimizer',
      icon: <PiggyBank size={18} />,
      counter: savingsSummary.opportunitiesCount,
      counterType: 'savings',
    },
    {
      id: 'ai',
      label: 'AI Audit Assistant',
      icon: <Bot size={18} />,
    },
  ];

  return (
    <aside className="app-sidebar">
      <div className="sidebar-header">
        <div className="brand-logo-badge">
          <Activity size={22} />
        </div>
        <div className="brand-title">
          AuditPulse
          <span className="brand-badge">AI</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
          >
            <div className="nav-item-content">
              {item.icon}
              <span className="nav-item-text">{item.label}</span>
            </div>
            {item.counter !== undefined && item.counter > 0 && (
              <span
                className={`nav-counter ${
                  item.counterType === 'danger'
                    ? 'counter-danger'
                    : item.counterType === 'savings'
                    ? 'counter-savings'
                    : ''
                }`}
              >
                {item.counter}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="health-status-card">
          <div className="health-status-header">
            <span>Audit Health Score</span>
            <span
              className="health-score-val"
              style={{
                color:
                  auditSummary.healthScore > 80
                    ? '#10B981'
                    : auditSummary.healthScore > 50
                    ? '#F59E0B'
                    : '#EF4444',
              }}
            >
              {auditSummary.healthScore}/100
            </span>
          </div>
          <div className="health-progress-bar">
            <div
              className="health-progress-fill"
              style={{
                width: `${auditSummary.healthScore}%`,
                background:
                  auditSummary.healthScore > 80
                    ? 'linear-gradient(90deg, #10B981, #34D399)'
                    : auditSummary.healthScore > 50
                    ? 'linear-gradient(90deg, #F59E0B, #FBBF24)'
                    : 'linear-gradient(90deg, #EF4444, #F87171)',
              }}
            />
          </div>
        </div>
      </div>
    </aside>
  );
};
