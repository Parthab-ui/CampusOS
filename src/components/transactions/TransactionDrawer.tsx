import React from 'react';
import {
  X,
  AlertTriangle,
  CheckCircle2,
  Receipt,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useFinancialData } from '../../context/FinancialDataContext';
import { formatCurrency, formatDate } from '../../core/config/constants';
import { Badge } from '../common/Badge';

export const TransactionDrawer: React.FC = () => {
  const {
    selectedTransaction,
    setSelectedTransaction,
    subscriptions,
    setSelectedSubscription,
    convertTransactionToSubscription,
  } = useFinancialData();

  if (!selectedTransaction) return null;

  const tx = selectedTransaction;
  const intel = tx.recurringIntelligence;
  const duplicate = tx.duplicateAlert;
  const linkedSub = subscriptions.find((s) => s.id === tx.subscriptionId);

  return (
    <div className="drawer-overlay" onClick={() => setSelectedTransaction(null)}>
      <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="merchant-avatar-large">
              {tx.merchantName.charAt(0)}
            </div>
            <div>
              <h2 className="drawer-title">{tx.merchantName}</h2>
              <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                Transaction ID: <span style={{ fontFamily: 'var(--font-mono)' }}>{tx.id}</span>
              </span>
            </div>
          </div>
          <button
            className="drawer-close-btn"
            onClick={() => setSelectedTransaction(null)}
            title="Close Drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Amount & Date Bar */}
        <div className="drawer-meta-bar">
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#94A3B8' }}>
              Transaction Amount
            </div>
            <div className="drawer-amount">
              {formatCurrency(tx.amount, tx.currency)}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#94A3B8' }}>
              Execution Date
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#F8FAFC' }}>
              {formatDate(tx.date)}
            </div>
          </div>
        </div>

        <div className="drawer-body">
          {/* Duplicate Charge Warning */}
          {duplicate && duplicate.isDuplicate && (
            <div className="drawer-alert-box alert-box-danger">
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <AlertTriangle size={20} color="#EF4444" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#F8FAFC' }}>
                    {duplicate.type === 'same_day_duplicate'
                      ? 'Duplicate Charge Detected (Same Day)'
                      : 'Multi-Card Duplicate Subscription'}
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#CBD5E1', marginTop: 4, lineHeight: 1.5 }}>
                    {duplicate.reason}
                  </p>
                  {duplicate.potentialWastedAmount && (
                    <div style={{ marginTop: 8, fontSize: '0.8rem', fontWeight: 700, color: '#F87171' }}>
                      Potential Duplicate Loss: {formatCurrency(duplicate.potentialWastedAmount)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Statement Cleansing Card */}
          <div className="drawer-section-card">
            <div className="section-card-title">
              <Receipt size={16} color="#60A5FA" />
              <span>Statement Cleansing & Merchant Attribution</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
              <div>
                <span className="sub-label">Raw Statement String</span>
                <div className="raw-statement-code">{tx.rawDescription}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <span className="sub-label">Canonical Vendor</span>
                  <div style={{ fontWeight: 600, color: '#F8FAFC' }}>{tx.merchantName}</div>
                </div>
                <div>
                  <span className="sub-label">Domain Identifier</span>
                  <div style={{ color: '#818CF8', fontSize: '0.85rem' }}>
                    {tx.merchantIntelligence?.domain || 'unregistered.local'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <span className="sub-label">Payment Instrument</span>
                  <div style={{ fontSize: '0.85rem', color: '#CBD5E1' }}>
                    {tx.paymentMethodName || 'Default Card'}
                  </div>
                </div>
                <div>
                  <span className="sub-label">Ledger Category</span>
                  <div style={{ fontSize: '0.85rem', color: '#CBD5E1' }}>
                    {tx.category.replace('_', ' ')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recurring Intelligence Card */}
          <div className="drawer-section-card">
            <div className="section-card-title">
              <Sparkles size={16} color="#A78BFA" />
              <span>Deterministic Recurring Intelligence</span>
            </div>

            {intel ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 10 }}>
                {/* Confidence Metric */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span className="sub-label">Recurring Confidence</span>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: intel.isRecurring ? '#34D399' : '#94A3B8' }}>
                      {(intel.confidenceScore * 100).toFixed(0)}%
                    </div>
                  </div>
                  <Badge variant={intel.isRecurring ? 'safe' : 'medium'}>
                    Cadence: {intel.detectedCadence || 'unverified'}
                  </Badge>
                </div>

                {/* Interval Statistics */}
                <div className="stats-mini-grid">
                  <div className="stat-mini-box">
                    <span className="sub-label">Observed Cycles</span>
                    <span className="stat-mini-val">{intel.observedOccurrences}</span>
                  </div>
                  <div className="stat-mini-box">
                    <span className="sub-label">Average Interval</span>
                    <span className="stat-mini-val">
                      {intel.averageIntervalDays ? `${intel.averageIntervalDays}d` : 'N/A'}
                    </span>
                  </div>
                  <div className="stat-mini-box">
                    <span className="sub-label">Regularity</span>
                    <span className="stat-mini-val" style={{ textTransform: 'capitalize' }}>
                      {intel.cadenceRegularity}
                    </span>
                  </div>
                </div>

                {/* Explainability Narrative */}
                <div className="explainability-narrative">
                  <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#94A3B8', fontWeight: 700, marginBottom: 4 }}>
                    Intelligence Narrative
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#E2E8F0', lineHeight: 1.5 }}>
                    {intel.explanation}
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: 8 }}>
                No recurrence pattern detected for this single charge.
              </div>
            )}
          </div>

          {/* Associated Subscription Link or Creation */}
          <div className="drawer-section-card">
            <div className="section-card-title">
              <Layers size={16} color="#38BDF8" />
              <span>Subscription Association</span>
            </div>

            {linkedSub ? (
              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#F8FAFC' }}>{linkedSub.name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                      Tier: {linkedSub.tier} • Cycle: {linkedSub.billingCycle}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedTransaction(null);
                      setSelectedSubscription(linkedSub);
                    }}
                    className="btn-resolve"
                    style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <span>View Subscription</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <p style={{ fontSize: '0.82rem', color: '#94A3B8' }}>
                  This recurring transaction stream is not currently linked to a registered subscription entry.
                </p>
                {tx.isRecurring && (
                  <button
                    onClick={() => convertTransactionToSubscription(tx)}
                    className="btn-resolve"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <CheckCircle2 size={14} />
                    <span>Promote Stream to Recognized Subscription</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
