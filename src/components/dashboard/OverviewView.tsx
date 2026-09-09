import React from 'react';
import {
  CreditCard,
  TrendingDown,
  AlertTriangle,
  Layers,
  Sparkles,
  PieChart,
} from 'lucide-react';
import { useFinancialData } from '../../context/FinancialDataContext';
import { MetricCard } from '../common/MetricCard';
import { CriticalAlertBanner } from '../layout/CriticalAlertBanner';
import { RenewalRadar } from './RenewalRadar';
import { formatCurrency, CATEGORY_LABELS } from '../../core/config/constants';
import { TransactionCategory } from '../../core/types';

export const OverviewView: React.FC = () => {
  const {
    subscriptionSummary,
    auditSummary,
    savingsSummary,
    setActiveTab,
  } = useFinancialData();

  const categories = Object.entries(subscriptionSummary.categoryDistribution) as [
    TransactionCategory,
    number
  ][];
  categories.sort((a, b) => b[1] - a[1]);

  return (
    <div>
      <CriticalAlertBanner />

      {/* Metrics Row */}
      <div className="metrics-grid">
        <MetricCard
          label="Monthly Recurring Spend"
          value={formatCurrency(subscriptionSummary.totalMonthlyNormalizedSpend)}
          subtext="Normalized 30-day baseline"
          icon={<CreditCard size={20} color="#6366F1" />}
          iconBg="rgba(99, 102, 241, 0.15)"
        />

        <MetricCard
          label="Annual Run-Rate (ARR)"
          value={formatCurrency(subscriptionSummary.totalAnnualSpend)}
          subtext="Projected 12-month recurring commitment"
          icon={<Layers size={20} color="#38BDF8" />}
          iconBg="rgba(56, 189, 248, 0.15)"
        />

        <MetricCard
          label="Identified Spend Leakage"
          value={formatCurrency(auditSummary.totalAnnualLeakage)}
          subtext={`${auditSummary.totalOpenIssues} unaddressed audit flags`}
          icon={<AlertTriangle size={20} color="#EF4444" />}
          iconBg="rgba(239, 68, 68, 0.15)"
          trend={{
            value: `-${formatCurrency(auditSummary.totalMonthlyLeakage)}/mo`,
            isPositive: false,
          }}
        />

        <MetricCard
          label="Potential Annual Savings"
          value={formatCurrency(savingsSummary.totalIdentifiedAnnualSavings)}
          subtext={`${savingsSummary.opportunitiesCount} optimization actions`}
          icon={<TrendingDown size={20} color="#10B981" />}
          iconBg="rgba(16, 185, 129, 0.15)"
          trend={{
            value: `+${formatCurrency(savingsSummary.quickWinSavingsAnnual)} quick wins`,
            isPositive: true,
          }}
        />
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
