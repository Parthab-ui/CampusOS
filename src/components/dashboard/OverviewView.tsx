import React from 'react';
import {
  CreditCard,
  TrendingDown,
  AlertTriangle,
  Layers,
  Sparkles,
  PieChart,
  ShieldAlert,
  Zap,
  ArrowRight,
  ChevronRight,
  FileText,
  Search,
  Check,
} from 'lucide-react';
import { useFinancialData } from '../../context/FinancialDataContext';
import { MetricCard } from '../common/MetricCard';
import { CriticalAlertBanner } from '../layout/CriticalAlertBanner';
import { RenewalRadar } from './RenewalRadar';
import { formatCurrency, CATEGORY_LABELS } from '../../core/config/constants';
import { TransactionCategory, AuditIssue, SavingsOpportunity } from '../../core/types';
import { Badge } from '../common/Badge';

export const OverviewView: React.FC = () => {
  const {
    subscriptionSummary,
    auditSummary,
    savingsSummary,
    auditIssues,
    savingsOpportunities,
    setActiveTab,
    navigateToAuditWithIssue,
    navigateToSavingsWithOpportunity,
    navigateToAiWithPrompt,
    applySavingsOpportunity,
    setIsExportReportModalOpen,
  } = useFinancialData();

  const categories = Object.entries(subscriptionSummary.categoryDistribution) as [
    TransactionCategory,
    number
  ][];
  categories.sort((a, b) => b[1] - a[1]);

  // Top critical or high audit anomalies
  const topAuditIssues = auditIssues
    .filter((i) => i.status !== 'dismissed')
    .slice(0, 3);

  // Top quick-win savings opportunities
  const topSavingsOps = savingsOpportunities.slice(0, 3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <CriticalAlertBanner />

      {/* Guided Live-Demo Navigation Ribbon */}
      <div
        style={{
          background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.12) 0%, rgba(56, 189, 248, 0.08) 50%, rgba(16, 185, 129, 0.12) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: 'var(--radius-lg)',
          padding: '14px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #6366F1 0%, #38BDF8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              flexShrink: 0,
            }}
          >
            <Sparkles size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#F8FAFC' }}>
              Interactive Live-Demo Journey
            </div>
            <div style={{ fontSize: '0.78rem', color: '#CBD5E1' }}>
              Overview Pulse → Forensic Evidence → Savings Playbook → Gemini Flash Reasoning → Executive Board Report
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              const topIssue = topAuditIssues[0];
              if (topIssue) {
                navigateToAuditWithIssue(topIssue.id);
              } else {
                setActiveTab('audit');
              }
            }}
            className="scan-audit-btn"
            style={{
              padding: '8px 14px',
              fontSize: '0.8rem',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#FCA5A5',
            }}
          >
            <ShieldAlert size={14} />
            <span>Inspect #1 Anomaly Dossier</span>
          </button>

          <button
            onClick={() => setIsExportReportModalOpen(true)}
            className="scan-audit-btn"
            style={{
              padding: '8px 14px',
              fontSize: '0.8rem',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              color: '#34D399',
            }}
          >
            <FileText size={14} />
            <span>Export Board Dossier</span>
          </button>
        </div>
      </div>

      {/* Metrics Row (Interactive KPIs) */}
      <div className="metrics-grid">
        <div
          onClick={() => setActiveTab('subscriptions')}
          style={{ cursor: 'pointer', transition: 'transform var(--transition-fast)' }}
          title="Click to view full subscription inventory"
        >
          <MetricCard
            label="Monthly Recurring Spend"
            value={formatCurrency(subscriptionSummary.totalMonthlyNormalizedSpend)}
            subtext="Normalized 30-day baseline • Click to view"
            icon={<CreditCard size={20} color="#6366F1" />}
            iconBg="rgba(99, 102, 241, 0.15)"
          />
        </div>

        <div
          onClick={() => setActiveTab('subscriptions')}
          style={{ cursor: 'pointer', transition: 'transform var(--transition-fast)' }}
          title="Click to view ARR commitments"
        >
          <MetricCard
            label="Annual Run-Rate (ARR)"
            value={formatCurrency(subscriptionSummary.totalAnnualSpend)}
            subtext="Projected 12-month commitment • Click to view"
            icon={<Layers size={20} color="#38BDF8" />}
            iconBg="rgba(56, 189, 248, 0.15)"
          />
        </div>

        <div
          onClick={() => setActiveTab('audit')}
          style={{ cursor: 'pointer', transition: 'transform var(--transition-fast)' }}
          title="Click to review audit findings"
        >
          <MetricCard
            label="Identified Spend Leakage"
            value={formatCurrency(auditSummary.totalAnnualLeakage)}
            subtext={`${auditSummary.totalOpenIssues} unaddressed audit flags • Click to inspect`}
            icon={<AlertTriangle size={20} color="#EF4444" />}
            iconBg="rgba(239, 68, 68, 0.15)"
            trend={{
              value: `-${formatCurrency(auditSummary.totalMonthlyLeakage)}/mo`,
              isPositive: false,
            }}
          />
        </div>

        <div
          onClick={() => setActiveTab('savings')}
          style={{ cursor: 'pointer', transition: 'transform var(--transition-fast)' }}
          title="Click to explore savings playbooks"
        >
          <MetricCard
            label="Potential Annual Savings"
            value={formatCurrency(savingsSummary.totalIdentifiedAnnualSavings)}
            subtext={`${savingsSummary.opportunitiesCount} optimization actions • Click to optimize`}
            icon={<TrendingDown size={20} color="#10B981" />}
            iconBg="rgba(16, 185, 129, 0.15)"
            trend={{
              value: `+${formatCurrency(savingsSummary.quickWinSavingsAnnual)} quick wins`,
              isPositive: true,
            }}
          />
        </div>
      </div>

      {/* Dual Executive Spotlight Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: 20,
        }}
      >
        {/* Left Spotlight: Critical Audit Signals */}
        <div className="panel-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="panel-header">
            <div>
              <h2 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldAlert size={18} color="#EF4444" />
                Critical Audit Signals Spotlight
              </h2>
              <p className="panel-subtitle">
                High-impact anomalies discovered across statements and contracts
              </p>
            </div>
            <button
              onClick={() => setActiveTab('audit')}
              className="btn-dismiss"
              style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <span>View All ({auditIssues.length})</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
            {topAuditIssues.map((issue: AuditIssue) => (
              <div
                key={issue.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  transition: 'border-color var(--transition-fast)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#F8FAFC' }}>
                        {issue.title}
                      </span>
                      <Badge variant={issue.severity}>{issue.severity.toUpperCase()}</Badge>
                      {issue.status === 'resolved' && (
                        <span className="badge badge-safe">Resolved</span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: 2 }}>
                      Target: <strong style={{ color: '#CBD5E1' }}>{issue.subscriptionName || 'Debit Stream'}</strong>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        color: '#F87171',
                      }}
                    >
                      -{formatCurrency(issue.impactAnnual)}/yr
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.78rem', color: '#94A3B8', lineHeight: 1.4 }}>
                  {issue.description}
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                  <button
                    onClick={() => navigateToAuditWithIssue(issue.id)}
                    className="btn-resolve"
                    style={{
                      padding: '5px 10px',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    <Search size={12} />
                    <span>Inspect Evidence</span>
                  </button>

                  <button
                    onClick={() =>
                      navigateToAiWithPrompt(
                        `Analyze the ${issue.title} anomaly detected for ${issue.subscriptionName || 'this transaction'}. Explain why it occurred, show evidence from our ledger, and give me a specific resolution plan.`
                      )
                    }
                    className="btn-dismiss"
                    style={{
                      padding: '5px 10px',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      color: '#A78BFA',
                      borderColor: 'rgba(167, 139, 250, 0.3)',
                    }}
                  >
                    <Sparkles size={12} />
                    <span>Ask AI</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => setActiveTab('audit')}
              style={{
                background: 'none',
                border: 'none',
                color: '#818CF8',
                fontSize: '0.82rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <span>Explore all {auditSummary.totalOpenIssues} unaddressed audit flags</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Right Spotlight: Autonomous Quick-Win Savings */}
        <div className="panel-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="panel-header">
            <div>
              <h2 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrendingDown size={18} color="#10B981" />
                Autonomous Savings Opportunities
              </h2>
              <p className="panel-subtitle">
                Zero-disruption actions prioritized by financial impact and effort
              </p>
            </div>
            <button
              onClick={() => setActiveTab('savings')}
              className="btn-dismiss"
              style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <span>View All ({savingsOpportunities.length})</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
            {topSavingsOps.map((op: SavingsOpportunity) => (
              <div
                key={op.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  transition: 'border-color var(--transition-fast)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#F8FAFC' }}>
                        {op.title}
                      </span>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-sm)',
                          textTransform: 'uppercase',
                          background:
                            op.effortLevel === 'instant'
                              ? 'rgba(16, 185, 129, 0.15)'
                              : 'rgba(99, 102, 241, 0.15)',
                          color: op.effortLevel === 'instant' ? '#34D399' : '#818CF8',
                        }}
                      >
                        {op.effortLevel}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: 2 }}>
                      Target: <strong style={{ color: '#CBD5E1' }}>{op.subscriptionNames[0] || 'Subscription'}</strong>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        color: '#34D399',
                      }}
                    >
                      +{formatCurrency(op.potentialAnnualSavings)}/yr
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.78rem', color: '#94A3B8', lineHeight: 1.4 }}>
                  {op.recommendedNextStep}
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                  <button
                    onClick={() => applySavingsOpportunity(op.id)}
                    disabled={op.isApplied}
                    className="btn-resolve"
                    style={{
                      padding: '5px 10px',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      background: op.isApplied ? 'rgba(16, 185, 129, 0.15)' : undefined,
                      color: op.isApplied ? '#34D399' : undefined,
                    }}
                  >
                    {op.isApplied ? <Check size={12} /> : <Zap size={12} />}
                    <span>{op.isApplied ? 'Applied ✓' : '1-Click Apply'}</span>
                  </button>

                  <button
                    onClick={() => navigateToSavingsWithOpportunity(op.id)}
                    className="btn-dismiss"
                    style={{
                      padding: '5px 10px',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    <span>View Playbook</span>
                    <ArrowRight size={12} />
                  </button>

                  <button
                    onClick={() =>
                      navigateToAiWithPrompt(
                        `How do I execute the savings opportunity '${op.title}' for ${op.subscriptionNames[0] || 'our subscription'}? Provide me with step-by-step guidance and a vendor communication script.`
                      )
                    }
                    className="btn-dismiss"
                    style={{
                      padding: '5px 10px',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      color: '#A78BFA',
                      borderColor: 'rgba(167, 139, 250, 0.3)',
                    }}
                  >
                    <Sparkles size={12} />
                    <span>Ask AI</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => setActiveTab('savings')}
              style={{
                background: 'none',
                border: 'none',
                color: '#34D399',
                fontSize: '0.82rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <span>Explore all {savingsOpportunities.length} opportunities (+{formatCurrency(savingsSummary.totalIdentifiedAnnualSavings)}/yr)</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Category Spend Distribution */}
      <div className="panel-card">
        <div className="panel-header">
          <div>
            <h2 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <PieChart size={18} color="#818CF8" />
              Monthly Spend by Category
            </h2>
            <p className="panel-subtitle">
              Allocation across Cloud, AI tools, SaaS productivity, and streaming media
            </p>
          </div>
          <button
            onClick={() => setActiveTab('savings')}
            className="btn-resolve"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Sparkles size={14} />
            Optimize Allocations
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {categories.slice(0, 5).map(([cat, amount]) => {
            const percentage = Math.round(
              (amount / (subscriptionSummary.totalMonthlyNormalizedSpend || 1)) * 100
            );

            return (
              <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.85rem',
                  }}
                >
                  <span style={{ fontWeight: 500, color: '#E2E8F0' }}>
                    {CATEGORY_LABELS[cat] || cat}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {formatCurrency(amount)} ({percentage}%)
                  </span>
                </div>
                <div
                  style={{
                    height: 8,
                    background: 'rgba(255, 255, 255, 0.06)',
                    borderRadius: 'var(--radius-full)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${percentage}%`,
                      background: 'linear-gradient(90deg, #6366F1 0%, #38BDF8 100%)',
                      borderRadius: 'var(--radius-full)',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Renewal Radar */}
      <RenewalRadar />
    </div>
  );
};
