import React, { useState } from 'react';
import {
  PiggyBank,
  Zap,
  Check,
  RotateCcw,
  Sparkles,
  Clock,
  ShieldCheck,
  FileText,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from 'lucide-react';
import { useFinancialData } from '../../context/FinancialDataContext';
import { formatCurrency } from '../../core/config/constants';
import { SavingsOpportunity } from '../../core/types';

export const SavingsView: React.FC = () => {
  const {
    savingsOpportunities,
    savingsSummary,
    savingsSimulation,
    applySavingsOpportunity,
    revertSavingsOpportunity,
  } = useFinancialData();

  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [expandedOpportunityId, setExpandedOpportunityId] = useState<string | null>(null);
  const [copiedOpId, setCopiedOpId] = useState<string | null>(null);

  const handleCopyTemplate = (op: SavingsOpportunity) => {
    if (op.actionTemplate) {
      navigator.clipboard.writeText(op.actionTemplate);
      setCopiedOpId(op.id);
      setTimeout(() => setCopiedOpId(null), 2500);
    }
  };

  const filtered = savingsOpportunities.filter((op) => {
    if (activeFilter === 'quick_wins') {
      return op.effortLevel === 'instant' || op.effortLevel === 'easy';
    }
    if (activeFilter === 'zombie') {
      return op.actionType === 'cancel_zombie';
    }
    if (activeFilter === 'duplicate') {
      return op.actionType === 'eliminate_duplicate';
    }
    if (activeFilter === 'cloud') {
      return op.actionType === 'annual_switch' || op.category === 'cloud_infrastructure';
    }
    if (activeFilter === 'applied') {
      return op.isApplied;
    }
    return true;
  });

  return (
    <div>
      {/* Top Banner & ROI Simulator HUD */}
      <div className="panel-card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <h2 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: 10, margin: 0 }}>
              <PiggyBank size={24} color="#10B981" />
              Autonomous Savings Optimization Playbook
            </h2>
            <p className="panel-subtitle" style={{ marginTop: 4 }}>
              Algorithmic prioritization engine identifying zero-disruption savings across zombie seats, multi-card duplicates, and annual commitments.
            </p>
          </div>

          {/* Quick-Win Summary Pill */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: 'rgba(16, 185, 129, 0.08)',
                padding: '10px 18px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
              }}
            >
              <Zap size={22} color="#34D399" />
              <div>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#94A3B8', fontWeight: 600 }}>
                  Potential Annual Yield
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.35rem',
                    fontWeight: 800,
                    color: '#34D399',
                  }}
                >
                  {formatCurrency(savingsSummary.totalIdentifiedAnnualSavings)}
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: 'rgba(99, 102, 241, 0.08)',
                padding: '10px 18px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
              }}
            >
              <CheckCircle size={22} color="#818CF8" />
              <div>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#94A3B8', fontWeight: 600 }}>
                  Realized Savings Captured
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.35rem',
                    fontWeight: 800,
                    color: '#818CF8',
                  }}
                >
                  {formatCurrency(savingsSummary.realizedAnnualSavings)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Run-Rate "What-If" Simulation Bar */}
        <div
          style={{
            marginTop: 20,
            padding: '16px 20px',
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Sparkles size={18} color="#A78BFA" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#E2E8F0' }}>
              Live Portfolio Optimization Impact:
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Current MRR:</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: '#CBD5E1', fontWeight: 600 }}>
                {formatCurrency(savingsSimulation.currentMrr)}
              </span>
              <ArrowRight size={14} color="#64748B" />
              <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Optimized MRR:</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: '#34D399', fontWeight: 700 }}>
                {formatCurrency(savingsSimulation.projectedMrr)}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Health Score:</span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: savingsSimulation.projectedHealthScore >= 80 ? '#34D399' : '#FBBF24',
                }}
              >
                {savingsSimulation.projectedHealthScore}/100
              </span>
            </div>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div
          style={{
            marginTop: 16,
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          {[
            { id: 'all', label: `All Opportunities (${savingsOpportunities.length})` },
            { id: 'quick_wins', label: `⚡ Quick Wins (${savingsSummary.quickWinSavingsAnnual > 0 ? formatCurrency(savingsSummary.quickWinSavingsAnnual) + '/yr' : '0'})` },
            { id: 'zombie', label: 'Zombie Cleanups' },
            { id: 'duplicate', label: 'Duplicate Accounts' },
            { id: 'cloud', label: 'Cloud & Annual Plans' },
            { id: 'applied', label: `Applied (${savingsSummary.appliedCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              style={{
                background: activeFilter === tab.id ? 'var(--accent-emerald)' : 'rgba(255, 255, 255, 0.04)',
                color: activeFilter === tab.id ? '#0B0F17' : '#94A3B8',
                border: '1px solid',
                borderColor: activeFilter === tab.id ? 'var(--accent-emerald)' : 'var(--border-subtle)',
                borderRadius: 'var(--radius-full)',
                padding: '6px 14px',
                fontSize: '0.8rem',
                fontWeight: activeFilter === tab.id ? 700 : 500,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Opportunities List */}
      <div className="audit-cards-list">
        {filtered.length === 0 ? (
          <div className="panel-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <ShieldCheck size={48} color="#34D399" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#F1F5F9' }}>
              No Savings Opportunities in This Category
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '0.9rem', maxWidth: 450, margin: '8px auto 0' }}>
              All recommendations in this filter have either been applied or no additional optimizations were detected.
            </p>
          </div>
        ) : (
          filtered.map((op) => {
            const isExpanded = expandedOpportunityId === op.id;

            return (
              <div
                key={op.id}
                className="audit-card"
                style={{
                  borderLeft: op.isApplied
                    ? '4px solid #64748B'
                    : op.effortLevel === 'instant'
                    ? '4px solid #34D399'
                    : '4px solid #818CF8',
                  opacity: op.isApplied ? 0.7 : 1,
                  transition: 'all var(--transition-normal)',
                }}
              >
                {/* Header */}
                <div className="audit-card-top">
                  <div className="audit-card-title-group">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <h3 className="audit-title" style={{ fontSize: '1.05rem', margin: 0 }}>
                        {op.title}
                      </h3>

                      {/* Effort Pill */}
                      <span
                        className="badge"
                        style={{
                          background:
                            op.effortLevel === 'instant'
                              ? 'rgba(16, 185, 129, 0.15)'
                              : op.effortLevel === 'easy'
                              ? 'rgba(99, 102, 241, 0.15)'
                              : 'rgba(245, 158, 11, 0.15)',
                          color:
                            op.effortLevel === 'instant'
                              ? '#34D399'
                              : op.effortLevel === 'easy'
                              ? '#818CF8'
                              : '#FBBF24',
                          fontWeight: 600,
                        }}
                      >
                        Effort: {op.effortLevel.toUpperCase()}
                      </span>

                      {/* Time Estimate */}
                      {op.implementationTimeEstimate && (
                        <span
                          className="badge"
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: '#94A3B8',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <Clock size={11} />
                          {op.implementationTimeEstimate}
                        </span>
                      )}

                      {/* Zero Risk Pill */}
                      {op.riskOfServiceInterruption === 'none' && (
                        <span
                          className="badge"
                          style={{
                            background: 'rgba(16, 185, 129, 0.1)',
                            color: '#34D399',
                          }}
                        >
                          Zero Disruption
                        </span>
                      )}

                      {op.isApplied && <span className="badge badge-safe">✓ Applied & Captured</span>}
                    </div>

                    <span style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: 4, display: 'block' }}>
                      Target Accounts: <strong style={{ color: '#E2E8F0' }}>{op.subscriptionNames.join(', ')}</strong>
                    </span>
                  </div>

                  {/* Savings Figures Badge */}
                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '1.25rem',
                        fontWeight: 800,
                        color: '#34D399',
                        background: 'rgba(16, 185, 129, 0.1)',
                        padding: '6px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid rgba(16, 185, 129, 0.25)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Save {formatCurrency(op.potentialAnnualSavings)}/yr
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: 3 }}>
                      {formatCurrency(op.potentialMonthlySavings)}/month
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="audit-desc" style={{ fontSize: '0.88rem', lineHeight: 1.5, margin: '12px 0 16px' }}>
                  {op.description}
                </p>

                {/* Collapsible Step-by-Step Playbook */}
                <div style={{ marginBottom: 14 }}>
                  <button
                    onClick={() => setExpandedOpportunityId(isExpanded ? null : op.id)}
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
                    {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    <span>{isExpanded ? 'Hide Implementation Playbook' : 'View Execution Guide & Pre-Written Template'}</span>
                  </button>

                  {isExpanded && (
                    <div
                      style={{
                        marginTop: 12,
                        background: 'rgba(0, 0, 0, 0.35)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        padding: 16,
                      }}
                    >
                      {/* Step Guide */}
                      {op.stepByStepGuide && op.stepByStepGuide.length > 0 && (
                        <div style={{ marginBottom: 14 }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#CBD5E1', marginBottom: 6 }}>
                            Implementation Steps:
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {op.stepByStepGuide.map((step, idx) => (
                              <div
                                key={idx}
                                style={{
                                  display: 'flex',
                                  gap: 8,
                                  fontSize: '0.8rem',
                                  color: '#CBD5E1',
                                }}
                              >
                                <span
                                  style={{
                                    width: 18,
                                    height: 18,
                                    borderRadius: '50%',
                                    background: 'rgba(16, 185, 129, 0.2)',
                                    color: '#34D399',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    flexShrink: 0,
                                  }}
                                >
                                  {idx + 1}
                                </span>
                                <span>{step}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Template Box */}
                      {op.actionTemplate && (
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#CBD5E1' }}>
                              Pre-Written Communication Template:
                            </div>
                            <button
                              onClick={() => handleCopyTemplate(op)}
                              style={{
                                background: copiedOpId === op.id ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.15)',
                                color: copiedOpId === op.id ? '#34D399' : '#818CF8',
                                border: '1px solid',
                                borderColor: copiedOpId === op.id ? 'rgba(16, 185, 129, 0.4)' : 'rgba(99, 102, 241, 0.3)',
                                borderRadius: 'var(--radius-sm)',
                                padding: '4px 10px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                cursor: 'pointer',
                              }}
                            >
                              {copiedOpId === op.id ? <CheckCircle size={13} /> : <FileText size={13} />}
                              <span>{copiedOpId === op.id ? 'Copied to Clipboard!' : 'Copy Template'}</span>
                            </button>
                          </div>

                          <pre
                            style={{
                              background: 'rgba(15, 23, 42, 0.6)',
                              border: '1px solid var(--border-subtle)',
                              borderRadius: 'var(--radius-sm)',
                              padding: 12,
                              fontSize: '0.75rem',
                              fontFamily: 'var(--font-mono)',
                              color: '#E2E8F0',
                              whiteSpace: 'pre-wrap',
                              margin: 0,
                              lineHeight: 1.45,
                            }}
                          >
                            {op.actionTemplate}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Action Controls */}
                <div className="audit-action-box" style={{ marginTop: 0 }}>
                  <div className="action-text">
                    <strong style={{ color: '#E2E8F0' }}>Action:</strong> {op.recommendedNextStep}
                  </div>

                  <div className="action-buttons-group">
                    {op.actionTemplate && (
                      <button
                        onClick={() => handleCopyTemplate(op)}
                        className="btn-dismiss"
                        style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                      >
                        <FileText size={13} />
                        <span>{copiedOpId === op.id ? 'Copied!' : 'Copy Template'}</span>
                      </button>
                    )}

                    {!op.isApplied ? (
                      <button
                        onClick={() => applySavingsOpportunity(op.id)}
                        className="btn-resolve"
                        style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                      >
                        <Check size={14} />
                        <span>Apply Optimization</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => revertSavingsOpportunity(op.id)}
                        className="btn-dismiss"
                        style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                      >
                        <RotateCcw size={13} />
                        <span>Revert (Demo)</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
