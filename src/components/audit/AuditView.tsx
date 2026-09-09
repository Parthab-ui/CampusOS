import React, { useState } from 'react';
import {
  ShieldAlert,
  TrendingUp,
  Copy,
  Ghost,
  Check,
  RotateCcw,
  Zap,
  Layers,
  Clock,
  FileText,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  CheckCircle,
  Sparkles,
  TrendingDown,
} from 'lucide-react';
import { useFinancialData } from '../../context/FinancialDataContext';
import { formatCurrency, formatDate } from '../../core/config/constants';
import { Badge } from '../common/Badge';
import { AuditAnomalyType, AuditIssue } from '../../core/types';

export const AuditView: React.FC = () => {
  const {
    auditIssues,
    auditSummary,
    resolveAuditIssue,
    dismissAuditIssue,
    triggerAuditScan,
    isScanning,
    targetAuditIssueId,
    setTargetAuditIssueId,
    navigateToAiWithPrompt,
    navigateToSavingsWithOpportunity,
    setIsExportReportModalOpen,
    showToast,
  } = useFinancialData();

  const [activeTypeFilter, setActiveTypeFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'resolved'>('all');
  const [expandedIssueId, setExpandedIssueId] = useState<string | null>(null);
  const [copiedIssueId, setCopiedIssueId] = useState<string | null>(null);

  React.useEffect(() => {
    if (targetAuditIssueId) {
      setExpandedIssueId(targetAuditIssueId);
      setTimeout(() => {
        const el = document.getElementById(`audit-card-${targetAuditIssueId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      setTargetAuditIssueId(null);
    }
  }, [targetAuditIssueId, setTargetAuditIssueId]);

  const getAnomalyIcon = (type: AuditAnomalyType) => {
    switch (type) {
      case 'price_hike':
        return <TrendingUp size={18} color="#FBBF24" />;
      case 'duplicate_billing':
      case 'double_charge':
        return <Copy size={18} color="#EF4444" />;
      case 'zombie_subscription':
        return <Ghost size={18} color="#F87171" />;
      case 'trial_ending_soon':
      case 'renewal_risk':
        return <Clock size={18} color="#F59E0B" />;
      case 'unusual_spending_spike':
        return <Zap size={18} color="#EC4899" />;
      case 'redundant_service':
      case 'subscription_overlap':
        return <Layers size={18} color="#60A5FA" />;
      default:
        return <ShieldAlert size={18} color="#A78BFA" />;
    }
  };

  const filtered = auditIssues.filter((issue) => {
    if (severityFilter !== 'all' && issue.severity !== severityFilter) return false;
    if (statusFilter === 'open' && issue.status !== 'open' && issue.status !== 'investigating') return false;
    if (statusFilter === 'resolved' && issue.status !== 'resolved') return false;

    if (activeTypeFilter !== 'all') {
      if (activeTypeFilter === 'price_hike' && issue.type !== 'price_hike') return false;
      if (activeTypeFilter === 'duplicate' && issue.type !== 'duplicate_billing' && issue.type !== 'double_charge') return false;
      if (activeTypeFilter === 'zombie' && issue.type !== 'zombie_subscription') return false;
      if (activeTypeFilter === 'spike' && issue.type !== 'unusual_spending_spike') return false;
      if (activeTypeFilter === 'overlap' && issue.type !== 'redundant_service' && issue.type !== 'subscription_overlap') return false;
      if (activeTypeFilter === 'renewal' && issue.type !== 'trial_ending_soon' && issue.type !== 'renewal_risk') return false;
    }
    return true;
  });

  const handleCopyTemplate = (issue: AuditIssue) => {
    if (issue.disputeTemplate) {
      navigator.clipboard.writeText(issue.disputeTemplate);
      setCopiedIssueId(issue.id);
      showToast('Dispute Script Copied', 'Template copied to clipboard ready for vendor support.', 'success');
      setTimeout(() => setCopiedIssueId(null), 2500);
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <div>
      {/* Top Executive Audit HUD */}
      <div className="panel-card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {/* Circular Health Gauge */}
            <div
              style={{
                position: 'relative',
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: `conic-gradient(${getHealthScoreColor(auditSummary.healthScore)} ${
                  auditSummary.healthScore * 3.6
                }deg, rgba(255, 255, 255, 0.06) 0deg)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 0 20px ${getHealthScoreColor(auditSummary.healthScore)}33`,
              }}
            >
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: '50%',
                  background: 'var(--bg-card)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: getHealthScoreColor(auditSummary.healthScore),
                    lineHeight: 1,
                  }}
                >
                  {auditSummary.healthScore}
                </span>
                <span style={{ fontSize: '0.6rem', color: '#94A3B8', textTransform: 'uppercase' }}>
                  Score
                </span>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 className="panel-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldAlert size={20} color="#EF4444" />
                  FinTech Audit & Anomaly Intelligence
                </h2>
                <span
                  className="badge"
                  style={{
                    background: auditSummary.criticalIssuesCount > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                    color: auditSummary.criticalIssuesCount > 0 ? '#F87171' : '#34D399',
                  }}
                >
                  {auditSummary.criticalIssuesCount > 0 ? `${auditSummary.criticalIssuesCount} Critical Flags` : 'System Secure'}
                </span>
              </div>
              <p className="panel-subtitle" style={{ marginTop: 4 }}>
                Multi-vector heuristic scanner analyzing statement debits, price creep, accidental double swipes, and inactive SaaS licenses.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Annual Leakage Summary Widget */}
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 18px',
                textAlign: 'right',
              }}
            >
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#94A3B8', fontWeight: 600 }}>
                Total Annual Spend Leakage
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  color: '#F87171',
                }}
              >
                {formatCurrency(auditSummary.totalAnnualLeakage)}
              </div>
            </div>

            <button
              onClick={() => setIsExportReportModalOpen(true)}
              className="scan-audit-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 16px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                color: '#34D399',
              }}
            >
              <FileText size={15} />
              <span>Export Executive Dossier</span>
            </button>

            <button
              onClick={triggerAuditScan}
              disabled={isScanning}
              className="btn-resolve"
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', fontWeight: 600 }}
            >
              <RotateCcw size={15} className={isScanning ? 'spinning' : ''} />
              <span>{isScanning ? 'Running Scan...' : 'Re-Run Audit Scan'}</span>
            </button>
          </div>
        </div>

        {/* Filter Navigation Bar */}
        <div
          style={{
            marginTop: 20,
            paddingTop: 16,
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          {/* Anomaly Category Filter Pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All Findings' },
              { id: 'duplicate', label: 'Double Swipes & Duplicates' },
              { id: 'price_hike', label: 'Price Creeps' },
              { id: 'zombie', label: 'Zombie Seats' },
              { id: 'spike', label: 'Usage Spikes' },
              { id: 'overlap', label: 'Category Overlap' },
              { id: 'renewal', label: 'Renewal Hazards' },
            ].map((pill) => (
              <button
                key={pill.id}
                onClick={() => setActiveTypeFilter(pill.id)}
                style={{
                  background: activeTypeFilter === pill.id ? 'var(--accent-indigo)' : 'rgba(255, 255, 255, 0.04)',
                  color: activeTypeFilter === pill.id ? '#FFFFFF' : '#94A3B8',
                  border: '1px solid',
                  borderColor: activeTypeFilter === pill.id ? 'var(--accent-indigo)' : 'var(--border-subtle)',
                  borderRadius: 'var(--radius-full)',
                  padding: '5px 12px',
                  fontSize: '0.78rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* Severity & Status Dropdowns */}
          <div style={{ display: 'flex', gap: 10 }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'open' | 'resolved')}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '6px 12px',
                fontSize: '0.8rem',
                color: '#E2E8F0',
                outline: 'none',
              }}
            >
              <option value="all">All Statuses ({auditIssues.length})</option>
              <option value="open">Open Flags ({auditSummary.totalOpenIssues})</option>
              <option value="resolved">Resolved ({auditSummary.resolvedIssuesCount})</option>
            </select>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '6px 12px',
                fontSize: '0.8rem',
                color: '#E2E8F0',
                outline: 'none',
              }}
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical Only ({auditSummary.criticalIssuesCount})</option>
              <option value="high">High Severity ({auditSummary.highIssuesCount})</option>
              <option value="medium">Medium Severity</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Findings List */}
      <div className="audit-cards-list">
        {filtered.length === 0 ? (
          <div className="panel-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <ShieldCheck size={48} color="#34D399" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#F1F5F9' }}>
              No Findings Match Selected Filters
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '0.9rem', maxWidth: 450, margin: '8px auto 0' }}>
              Your financial ledger and subscriptions are clean under these criteria. Try changing filters or re-running the audit scan.
            </p>
          </div>
        ) : (
          filtered.map((issue) => {
            const isExpanded = expandedIssueId === issue.id;

            return (
              <div
                key={issue.id}
                id={`audit-card-${issue.id}`}
                className={`audit-card severity-${issue.severity}`}
                style={{
                  opacity: issue.status === 'resolved' ? 0.65 : 1,
                  transition: 'all var(--transition-normal)',
                }}
              >
                {/* Finding Header */}
                <div className="audit-card-top">
                  <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div
                      style={{
                        padding: 10,
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid var(--border-subtle)',
                        marginTop: 2,
                      }}
                    >
                      {getAnomalyIcon(issue.type)}
                    </div>

                    <div className="audit-card-title-group">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <h3 className="audit-title" style={{ fontSize: '1.05rem', margin: 0 }}>
                          {issue.title}
                        </h3>
                        <Badge variant={issue.severity}>{issue.severity.toUpperCase()}</Badge>
                        {issue.category && (
                          <span
                            className="badge"
                            style={{
                              background: 'rgba(255, 255, 255, 0.05)',
                              color: '#94A3B8',
                              fontSize: '0.7rem',
                            }}
                          >
                            {issue.category.replace('_', ' ')}
                          </span>
                        )}
                        {issue.status === 'resolved' && (
                          <span className="badge badge-safe">✓ Resolved</span>
                        )}
                      </div>

                      <span style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: 4, display: 'block' }}>
                        Detected: {formatDate(issue.detectedAt)} • Target:{' '}
                        <strong style={{ color: '#E2E8F0' }}>{issue.subscriptionName || 'Ledger Transaction'}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Impact Leakage Tag */}
                  <div style={{ textAlign: 'right' }}>
                    <div className="audit-impact-badge" style={{ marginBottom: 4 }}>
                      Leakage: {formatCurrency(issue.impactAnnual)}/yr
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                      {formatCurrency(issue.impactMonthly)}/month
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="audit-desc" style={{ fontSize: '0.88rem', lineHeight: 1.5, margin: '12px 0 16px' }}>
                  {issue.description}
                </p>

                {/* Collapsible Forensic Evidence Dossier */}
                <div style={{ marginBottom: 14 }}>
                  <button
                    onClick={() => setExpandedIssueId(isExpanded ? null : issue.id)}
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
                    <span>{isExpanded ? 'Hide Forensic Evidence & Audit Trail' : 'Inspect Forensic Evidence & Playbook'}</span>
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
                      {/* Evidence Summary Grid */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                          gap: 12,
                          marginBottom: 16,
                        }}
                      >
                        {issue.evidence?.baselineAmount !== undefined && (
                          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: 10, borderRadius: 'var(--radius-sm)' }}>
                            <div style={{ fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase' }}>Baseline Spend</div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 600, color: '#38BDF8' }}>
                              {formatCurrency(issue.evidence.baselineAmount)}
                            </div>
                          </div>
                        )}

                        {issue.evidence?.chargedAmount !== undefined && (
                          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: 10, borderRadius: 'var(--radius-sm)' }}>
                            <div style={{ fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase' }}>Observed Charge</div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 600, color: '#F87171' }}>
                              {formatCurrency(issue.evidence.chargedAmount)}
                            </div>
                          </div>
                        )}

                        {issue.evidence?.variancePercentage !== undefined && (
                          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: 10, borderRadius: 'var(--radius-sm)' }}>
                            <div style={{ fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase' }}>Variance / Hike</div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 600, color: '#FBBF24' }}>
                              +{issue.evidence.variancePercentage}%
                            </div>
                          </div>
                        )}

                        {issue.evidence?.inactivityDays !== undefined && (
                          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: 10, borderRadius: 'var(--radius-sm)' }}>
                            <div style={{ fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase' }}>Inactivity Duration</div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 600, color: '#F87171' }}>
                              {issue.evidence.inactivityDays} Days Inactive
                            </div>
                          </div>
                        )}

                        {issue.evidence?.daysToRenewal !== undefined && (
                          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: 10, borderRadius: 'var(--radius-sm)' }}>
                            <div style={{ fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase' }}>Days to Renewal</div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 600, color: '#F59E0B' }}>
                              {issue.evidence.daysToRenewal} Days Left
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Conflicting Ledger Records */}
                      {issue.evidence?.conflictingTransactions && issue.evidence.conflictingTransactions.length > 0 && (
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#CBD5E1', marginBottom: 6 }}>
                            Conflicting Statement Debits:
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {issue.evidence.conflictingTransactions.map((tx) => (
                              <div
                                key={tx.id}
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  background: 'rgba(255, 255, 255, 0.02)',
                                  padding: '6px 12px',
                                  borderRadius: 'var(--radius-sm)',
                                  fontSize: '0.78rem',
                                }}
                              >
                                <div>
                                  <span style={{ color: '#94A3B8' }}>{formatDate(tx.date)}: </span>
                                  <span style={{ color: '#E2E8F0', fontWeight: 500 }}>{tx.description}</span>
                                  <span style={{ color: '#64748B', marginLeft: 8 }}>({tx.paymentMethod})</span>
                                </div>
                                <span style={{ fontFamily: 'var(--font-mono)', color: '#F87171', fontWeight: 600 }}>
                                  {formatCurrency(tx.amount)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Step-by-Step Playbook */}
                      {issue.actionPlaybook && issue.actionPlaybook.length > 0 && (
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#CBD5E1', marginBottom: 6 }}>
                            Recommended Resolution Playbook:
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {issue.actionPlaybook.map((step) => (
                              <div
                                key={step.stepNumber}
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
                                    background: 'rgba(99, 102, 241, 0.2)',
                                    color: '#818CF8',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    flexShrink: 0,
                                  }}
                                >
                                  {step.stepNumber}
                                </span>
                                <span>{step.instruction}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Dispute Template Box with Copy Button */}
                      {issue.disputeTemplate && (
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#CBD5E1' }}>
                              Pre-Written Vendor Communication Template:
                            </div>
                            <button
                              onClick={() => handleCopyTemplate(issue)}
                              style={{
                                background: copiedIssueId === issue.id ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.15)',
                                color: copiedIssueId === issue.id ? '#34D399' : '#818CF8',
                                border: '1px solid',
                                borderColor: copiedIssueId === issue.id ? 'rgba(16, 185, 129, 0.4)' : 'rgba(99, 102, 241, 0.3)',
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
                              {copiedIssueId === issue.id ? <CheckCircle size={13} /> : <FileText size={13} />}
                              <span>{copiedIssueId === issue.id ? 'Copied to Clipboard!' : 'Copy Template'}</span>
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
                            {issue.disputeTemplate}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Action Footer */}
                <div className="audit-action-box" style={{ marginTop: 0 }}>
                  <div className="action-text">
                    <strong style={{ color: '#E2E8F0' }}>Action:</strong> {issue.recommendedAction}
                  </div>

                  <div className="action-buttons-group" style={{ flexWrap: 'wrap' }}>
                    <button
                      onClick={() =>
                        navigateToAiWithPrompt(
                          `Investigate the ${issue.title} audit flag for ${issue.subscriptionName || 'our ledger'}. Detail the detected anomaly, evaluate the financial risk of ${formatCurrency(issue.impactAnnual)}/yr leakage, and outline our concrete mitigation steps.`
                        )
                      }
                      className="btn-dismiss"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        color: '#A78BFA',
                        borderColor: 'rgba(167, 139, 250, 0.35)',
                        background: 'rgba(139, 92, 246, 0.08)',
                      }}
                    >
                      <Sparkles size={13} color="#C084FC" />
                      <span>Ask Copilot</span>
                    </button>

                    {(issue.subscriptionId === 'sub-figma' ||
                      issue.subscriptionId === 'sub-spotify-2' ||
                      issue.subscriptionId === 'sub-claude-api') && (
                      <button
                        onClick={() => {
                          const opId =
                            issue.subscriptionId === 'sub-figma'
                              ? 'save-figma-seat'
                              : issue.subscriptionId === 'sub-spotify-2'
                              ? 'save-spotify-duplicate'
                              : 'save-trial-claude';
                          navigateToSavingsWithOpportunity(opId);
                        }}
                        className="btn-dismiss"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          color: '#34D399',
                          borderColor: 'rgba(16, 185, 129, 0.35)',
                          background: 'rgba(16, 185, 129, 0.08)',
                        }}
                      >
                        <TrendingDown size={13} />
                        <span>Savings Playbook</span>
                      </button>
                    )}

                    {issue.status !== 'resolved' ? (
                      <>
                        {issue.disputeTemplate && (
                          <button
                            onClick={() => handleCopyTemplate(issue)}
                            className="btn-dismiss"
                            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                          >
                            <FileText size={13} />
                            <span>{copiedIssueId === issue.id ? 'Copied!' : 'Copy Script'}</span>
                          </button>
                        )}
                        <button
                          onClick={() => resolveAuditIssue(issue.id)}
                          className="btn-resolve"
                          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                        >
                          <Check size={14} />
                          <span>Resolve Finding</span>
                        </button>
                        <button
                          onClick={() => dismissAuditIssue(issue.id)}
                          className="btn-dismiss"
                        >
                          Dismiss
                        </button>
                      </>
                    ) : (
                      <span style={{ fontSize: '0.82rem', color: '#34D399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <CheckCircle size={16} />
                        Resolved & Remediated
                      </span>
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
