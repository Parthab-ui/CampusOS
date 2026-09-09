import React from 'react';
import { AlertOctagon, ArrowRight } from 'lucide-react';
import { useFinancialData } from '../../context/FinancialDataContext';
import { formatCurrency } from '../../core/config/constants';

export const CriticalAlertBanner: React.FC = () => {
  const { auditSummary, setActiveTab } = useFinancialData();

  if (auditSummary.criticalIssuesCount === 0) {
    return null;
  }

  return (
    <div className="critical-alert-banner">
      <div className="alert-banner-left">
        <div className="alert-banner-icon">
          <AlertOctagon size={24} />
        </div>
        <div>
          <div className="alert-banner-title">
            FinTech Audit Alert: {auditSummary.criticalIssuesCount} Critical Anomalies Identified
          </div>
          <div className="alert-banner-desc">
            Estimated annual spend leakage of{' '}
            <strong style={{ color: '#F87171' }}>
              {formatCurrency(auditSummary.totalAnnualLeakage)}
            </strong>{' '}
            detected across duplicate billing, inactive zombie licenses, and expiring trials.
          </div>
        </div>
      </div>

      <button
        onClick={() => setActiveTab('audit')}
        className="alert-action-btn"
      >
        <span>Review Audit Issues</span>
        <ArrowRight size={14} style={{ display: 'inline', marginLeft: 6 }} />
      </button>
    </div>
  );
};
