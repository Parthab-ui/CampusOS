import React from 'react';
import { RefreshCw, ShieldCheck, Sparkles, Building2, Menu, X, FileText } from 'lucide-react';
import { useFinancialData } from '../../context/FinancialDataContext';

export const TopBar: React.FC = () => {
  const {
    activeTab,
    triggerAuditScan,
    isScanning,
    setActiveTab,
    isMobileNavOpen,
    setIsMobileNavOpen,
    setIsExportReportModalOpen,
  } = useFinancialData();

  const getTabTitle = () => {
    switch (activeTab) {
      case 'overview':
        return { title: 'Executive Overview', subtitle: 'Live subscription metrics, cash outflow runway, and audit signals' };
      case 'subscriptions':
        return { title: 'Subscription Inventory', subtitle: 'Manage recurring billing cadences, virtual cards, and risk scores' };
      case 'audit':
        return { title: 'FinTech Audit Engine', subtitle: 'Detected anomalies, silent price hikes, duplicate charges, and zombie accounts' };
      case 'transactions':
        return { title: 'Ledger Transactions', subtitle: 'Historical payment stream and recurring pattern detection' };
      case 'savings':
        return { title: 'Savings Optimization', subtitle: 'Actionable opportunities to eliminate financial waste and downgrade tiers' };
      case 'ai':
        return { title: 'AI FinTech Assistant', subtitle: 'Autonomous audit analysis and generative financial intelligence' };
    }
  };

  const { title, subtitle } = getTabTitle();

  return (
    <header className="app-topbar">
      <div className="topbar-left" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button
          className="mobile-nav-toggle"
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          aria-label="Toggle Navigation Menu"
        >
          {isMobileNavOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div>
          <h1 className="page-title">{title}</h1>
          <p className="page-subtitle">{subtitle}</p>
        </div>
      </div>

      <div className="topbar-right">
        <div className="account-selector">
          <Building2 size={16} color="#94A3B8" />
          <span>Acme Cloud Technologies (Demo)</span>
        </div>

        <button
          onClick={() => setIsExportReportModalOpen(true)}
          className="btn-dismiss topbar-export-btn"
          title="Export Executive Audit Dossier & Board Report"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 12px',
            fontSize: '0.8rem',
            color: '#34D399',
            borderColor: 'rgba(16, 185, 129, 0.35)',
            background: 'rgba(16, 185, 129, 0.08)',
          }}
        >
          <FileText size={15} />
          <span className="topbar-btn-text">Board Dossier</span>
        </button>

        <button
          onClick={triggerAuditScan}
          disabled={isScanning}
          className="scan-audit-btn"
          title="Re-run anomaly detection rules across all transactions and subscriptions"
        >
          {isScanning ? (
            <>
              <RefreshCw size={16} className="spinning" />
              <span className="topbar-btn-text">Auditing...</span>
            </>
          ) : (
            <>
              <ShieldCheck size={16} />
              <span className="topbar-btn-text">Run Audit Scan</span>
            </>
          )}
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className="scan-audit-btn"
          style={{
            background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
            boxShadow: 'var(--shadow-glow-indigo)',
          }}
        >
          <Sparkles size={16} />
          <span>Ask AI</span>
        </button>
      </div>
    </header>
  );
};
