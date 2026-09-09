import React from 'react';
import { PiggyBank, Zap, Check } from 'lucide-react';
import { useFinancialData } from '../../context/FinancialDataContext';
import { formatCurrency } from '../../core/config/constants';

export const SavingsView: React.FC = () => {
  const { savingsOpportunities, savingsSummary, applySavingsOpportunity } = useFinancialData();

  return (
    <div>
      <div className="panel-card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <PiggyBank size={22} color="#10B981" />
              Savings Optimization Playbook
            </h2>
            <p className="panel-subtitle">
              Identified {savingsSummary.opportunitiesCount} high-ROI actions to reduce subscription overhead
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: 'rgba(16, 185, 129, 0.1)',
              padding: '10px 18px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
            }}
          >
            <Zap size={20} color="#34D399" />
            <div>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#94A3B8' }}>
                Total Annual Yield
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: '#34D399',
                }}
              >
                {formatCurrency(savingsSummary.totalIdentifiedAnnualSavings)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="audit-cards-list">
        {savingsOpportunities.map((op) => (
          <div
            key={op.id}
            className="audit-card"
            style={{
              borderLeft: op.isApplied ? '4px solid #64748B' : '4px solid var(--accent-emerald)',
              opacity: op.isApplied ? 0.6 : 1,
            }}
          >
            <div className="audit-card-top">
              <div className="audit-card-title-group">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h3 className="audit-title">{op.title}</h3>
                  <span
                    className="badge"
                    style={{
                      background: 'rgba(99, 102, 241, 0.15)',
                      color: '#818CF8',
                    }}
                  >
                    Effort: {op.effortLevel}
                  </span>
                  {op.isApplied && <span className="badge badge-safe">Applied</span>}
                </div>
                <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                  Targeted Accounts: {op.subscriptionNames.join(', ')}
                </span>
              </div>

              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: '#34D399',
                  background: 'rgba(16, 185, 129, 0.1)',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  whiteSpace: 'nowrap',
                }}
              >
                Save {formatCurrency(op.potentialAnnualSavings)}/yr
              </div>
            </div>

            <p className="audit-desc">{op.description}</p>

            <div className="audit-action-box">
              <div className="action-text">
                <strong>Execution Step:</strong> {op.recommendedNextStep}
              </div>

              <div>
                {!op.isApplied ? (
                  <button
                    onClick={() => applySavingsOpportunity(op.id)}
                    className="btn-resolve"
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <Check size={14} />
                    Mark Applied
                  </button>
                ) : (
                  <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                    Savings Captured ✓
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
