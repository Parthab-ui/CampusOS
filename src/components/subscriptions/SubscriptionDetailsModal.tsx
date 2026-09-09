import React from 'react';
import {
  X,
  ExternalLink,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useFinancialData } from '../../context/FinancialDataContext';
import { formatCurrency, formatDate } from '../../core/config/constants';
import { Badge } from '../common/Badge';

export const SubscriptionDetailsModal: React.FC = () => {
  const {
    selectedSubscription,
    setSelectedSubscription,
    toggleSubscriptionAutoRenew,
    transactions,
    setSelectedTransaction,
  } = useFinancialData();

  if (!selectedSubscription) return null;

  const sub = selectedSubscription;
  const renewal = sub.renewalIntelligence;

  // Filter linked transactions
  const linkedTxs = transactions.filter(
    (tx) => tx.subscriptionId === sub.id || tx.merchantName.toLowerCase() === sub.vendor.toLowerCase()
  ).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="modal-overlay" onClick={() => setSelectedSubscription(null)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="merchant-avatar-large">
              {sub.name.charAt(0)}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 className="modal-title">{sub.name}</h2>
                <Badge variant={sub.riskLevel}>Risk: {sub.riskScore}/100</Badge>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#94A3B8', marginTop: 2 }}>
                Vendor: <strong>{sub.vendor}</strong> • Tier: <span style={{ textTransform: 'capitalize' }}>{sub.tier}</span> • Category: {sub.category.replace('_', ' ')}
              </div>
            </div>
          </div>

          <button
            className="drawer-close-btn"
            onClick={() => setSelectedSubscription(null)}
            title="Close Modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Key Metrics Cards */}
          <div className="modal-metrics-grid">
            <div className="modal-metric-card">
              <span className="sub-label">Current Billing Rate</span>
              <div className="modal-metric-val">
                {formatCurrency(sub.amount, sub.currency)}
                <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 500 }}>
                  /{sub.billingCycle}
                </span>
              </div>
            </div>

            <div className="modal-metric-card">
              <span className="sub-label">Next Renewal Date</span>
              <div className="modal-metric-val" style={{ fontSize: '1.25rem' }}>
                {renewal ? formatDate(renewal.estimatedNextRenewalDate) : formatDate(sub.nextBillingDate)}
                <div style={{ fontSize: '0.78rem', color: '#38BDF8', fontWeight: 600 }}>
                  {renewal ? `${renewal.daysUntilRenewal} days remaining` : 'Scheduled'}
                </div>
              </div>
            </div>

            <div className="modal-metric-card">
              <span className="sub-label">Annual Run-Rate</span>
              <div className="modal-metric-val" style={{ color: '#10B981' }}>
                {renewal ? formatCurrency(renewal.projectedAnnualCommitment) : formatCurrency(sub.amount * 12)}
              </div>
            </div>

            <div className="modal-metric-card">
              <span className="sub-label">Total Cumulative Spend</span>
              <div className="modal-metric-val" style={{ color: '#A78BFA' }}>
                {formatCurrency(sub.totalSpendToDate || sub.amount)}
              </div>
            </div>
          </div>

          {/* Renewal & Auto-Renew Management */}
          <div className="drawer-section-card">
            <div className="section-card-title">
              <Clock size={16} color="#38BDF8" />
              <span>Renewal Intelligence & Auto-Renew Control</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
              <div>
                <div style={{ fontWeight: 600, color: '#F8FAFC' }}>
                  Auto-Renewal Status: {sub.autoRenew ? 'Enabled (Active)' : 'Disabled (Frozen)'}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: 2 }}>
                  Connected Card: {sub.paymentMethodName || 'Corporate Platinum Visa (4288)'}
                </div>
              </div>

              <button
                onClick={() => toggleSubscriptionAutoRenew(sub.id)}
                className="btn-resolve"
                style={{
                  background: sub.autoRenew ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                  color: sub.autoRenew ? '#F87171' : '#34D399',
                  border: sub.autoRenew ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
                }}
              >
                {sub.autoRenew ? <XCircle size={15} /> : <CheckCircle2 size={15} />}
                <span>{sub.autoRenew ? 'Disable Auto-Renew' : 'Enable Auto-Renew'}</span>
              </button>
            </div>

            {sub.notes && (
              <div
                style={{
                  marginTop: 12,
                  padding: 10,
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.82rem',
                  color: '#CBD5E1',
                }}
              >
                <strong>Audit Note:</strong> {sub.notes}
              </div>
            )}
          </div>

          {/* Historical Billing Ledger Table */}
          <div className="drawer-section-card">
            <div className="section-card-title">
              <TrendingUp size={16} color="#10B981" />
              <span>Historical Billing Statements ({linkedTxs.length} charges observed)</span>
            </div>

            <div className="data-table-container" style={{ marginTop: 12, maxHeight: 220, overflowY: 'auto' }}>
              <table className="fintech-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Statement Line</th>
                    <th>Payment Method</th>
                    <th>Amount</th>
                    <th>Inspection</th>
                  </tr>
                </thead>
                <tbody>
                  {linkedTxs.map((tx) => (
                    <tr key={tx.id}>
                      <td>{formatDate(tx.date)}</td>
                      <td>
                        <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
                          {tx.rawDescription}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                          {tx.paymentMethodName || 'Default Card'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#F8FAFC' }}>
                          {formatCurrency(tx.amount, tx.currency)}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => {
                            setSelectedSubscription(null);
                            setSelectedTransaction(tx);
                          }}
                          className="btn-dismiss"
                          style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          {sub.cancelUrl && (
            <a
              href={sub.cancelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="scan-audit-btn"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid var(--border-subtle)',
                color: '#CBD5E1',
              }}
            >
              <span>Manage on Provider Portal</span>
              <ExternalLink size={14} />
            </a>
          )}

          <button
            onClick={() => setSelectedSubscription(null)}
            className="scan-audit-btn"
            style={{ marginLeft: 'auto' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
