import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  TrendingUp,
  Copy,
  Ghost,
  Check,
  RotateCcw,
} from 'lucide-react';
import { useFinancialData } from '../../context/FinancialDataContext';
import { formatCurrency, formatDate } from '../../core/config/constants';
import { Badge } from '../common/Badge';
import { AuditAnomalyType, AuditSeverity } from '../../core/types';

export const AuditView: React.FC = () => {
  const { auditIssues, resolveAuditIssue, dismissAuditIssue, triggerAuditScan, isScanning } =
    useFinancialData();
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const getAnomalyIcon = (type: AuditAnomalyType) => {
    switch (type) {
      case 'price_hike':
        return <TrendingUp size={18} color="#FBBF24" />;
      case 'duplicate_billing':
        return <Copy size={18} color="#EF4444" />;
      case 'zombie_subscription':
        return <Ghost size={18} color="#F87171" />;
      case 'trial_ending_soon':
        return <AlertTriangle size={18} color="#F59E0B" />;
      default:
        return <ShieldAlert size={18} color="#60A5FA" />;
    }
  };

  const filtered = auditIssues.filter((issue) => {
    if (severityFilter !== 'all' && issue.severity !== severityFilter) {
      return false;
    }
    return true;
  });

  return (
    <div>
      {/* Top Banner */}
      <div className="panel-card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <ShieldAlert size={22} color="#EF4444" />
              FinTech Audit & Anomaly Detection Center
            </h2>
            <p className="panel-subtitle">
              Continuous heuristic rules monitor price creeps, duplicate card charges, inactive seats, and trial conversions
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '8px 14px',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical Only</option>
              <option value="high">High Severity</option>
              <option value="medium">Medium Severity</option>
            </select>

            <button
              onClick={triggerAuditScan}
              disabled={isScanning}
              className="btn-resolve"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <RotateCcw size={14} className={isScanning ? 'spinning' : ''} />
              <span>{isScanning ? 'Scanning...' : 'Re-Run Heuristic Scan'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Issues List */}
      <div className="audit-cards-list">
        {filtered.map((issue) => (
          <div
            key={issue.id}
            className={`audit-card severity-${issue.severity}`}
            style={{
              opacity: issue.status === 'resolved' ? 0.6 : 1,
            }}
          >
            <div className="audit-card-top">
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div
                  style={{
                    padding: 8,
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 255, 255, 0.04)',
                  }}
                >
                  {getAnomalyIcon(issue.type)}
                </div>
                <div className="audit-card-title-group">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 className="audit-title">{issue.title}</h3>
                    <Badge variant={issue.severity as AuditSeverity}>{issue.severity}</Badge>
                    {issue.status === 'resolved' && (
                      <span className="badge badge-safe">Resolved</span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                    Detected on {formatDate(issue.detectedAt)} • Target:{' '}
                    <strong>{issue.subscriptionName || 'Ledger'}</strong>
                  </span>
                </div>
              </div>

              <div className="audit-impact-badge">
                Leakage: {formatCurrency(issue.impactAnnual)}/yr
              </div>
            </div>

            <p className="audit-desc">{issue.description}</p>

            <div className="audit-action-box">
              <div className="action-text">
                <strong>Recommended Resolution:</strong> {issue.recommendedAction}
              </div>

              <div className="action-buttons-group">
                {issue.status !== 'resolved' ? (
                  <>
                    <button
                      onClick={() => resolveAuditIssue(issue.id)}
                      className="btn-resolve"
                      style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <Check size={14} />
                      Mark Resolved
                    </button>
                    <button
                      onClick={() => dismissAuditIssue(issue.id)}
                      className="btn-dismiss"
                    >
                      Dismiss
                    </button>
                  </>
                ) : (
                  <span style={{ fontSize: '0.8rem', color: '#34D399', fontWeight: 600 }}>
                    ✓ Resolved in Current Cycle
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
