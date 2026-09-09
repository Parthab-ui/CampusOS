import React, { useState } from 'react';
import {
  Search,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { useFinancialData } from '../../context/FinancialDataContext';
import { formatCurrency, formatDate } from '../../core/config/constants';
import { Badge } from '../common/Badge';
import { SubscriptionDetailsModal } from './SubscriptionDetailsModal';

export const SubscriptionsView: React.FC = () => {
  const {
    subscriptions,
    toggleSubscriptionAutoRenew,
    setSelectedSubscription,
  } = useFinancialData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = subscriptions.filter((sub) => {
    const matchesSearch =
      sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.vendor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="panel-card">
      <div className="panel-header" style={{ flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 className="panel-title">Subscription Portfolio & Intelligence</h2>
          <p className="panel-subtitle">
            {subscriptions.length} active recurring commitments tracked with deterministic renewal forecasting
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.04)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              padding: '0 12px',
            }}
          >
            <Search size={16} color="#94A3B8" />
            <input
              type="text"
              placeholder="Search vendor or service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '8px 10px',
                fontSize: '0.85rem',
                outline: 'none',
                width: 200,
              }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '8px 12px',
              fontSize: '0.85rem',
              outline: 'none',
            }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="flagged_for_review">Flagged in Audit</option>
            <option value="trial">Trials Only</option>
          </select>
        </div>
      </div>

      <div className="data-table-container">
        <table className="fintech-table">
          <thead>
            <tr>
              <th>Subscription & Vendor</th>
              <th>Cadence</th>
              <th>Payment Instrument</th>
              <th>Next Estimated Renewal</th>
              <th>Amount</th>
              <th>Audit Risk</th>
              <th>Auto-Renew</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((sub) => {
              const renewal = sub.renewalIntelligence;
              const days = renewal ? renewal.daysUntilRenewal : 0;

              return (
                <tr
                  key={sub.id}
                  onClick={() => setSelectedSubscription(sub)}
                  style={{ cursor: 'pointer' }}
                  title="Click to view subscription breakdown and linked transactions"
                >
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="merchant-avatar-small">
                        {sub.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#F8FAFC' }}>{sub.name}</div>
                        <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                          {sub.vendor} • <span style={{ textTransform: 'capitalize' }}>{sub.tier}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        textTransform: 'capitalize',
                        fontSize: '0.82rem',
                        fontWeight: 500,
                      }}
                    >
                      {sub.billingCycle}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                      {sub.paymentMethodName || 'Default Card'}
                    </span>
                  </td>
                  <td>
                    <div>
                      <span style={{ fontSize: '0.85rem' }}>
                        {renewal ? formatDate(renewal.estimatedNextRenewalDate) : formatDate(sub.nextBillingDate)}
                      </span>
                      <div
                        style={{
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          color: days <= 2 ? '#EF4444' : days <= 7 ? '#F59E0B' : '#38BDF8',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 3,
                        }}
                      >
                        <Clock size={11} />
                        {days === 0 ? 'Today' : `${days}d countdown`}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        color: '#F8FAFC',
                        fontSize: '0.95rem',
                      }}
                    >
                      {formatCurrency(sub.amount, sub.currency)}
                    </span>
                  </td>
                  <td>
                    <Badge variant={sub.riskLevel}>
                      {sub.riskScore >= 70 ? (
                        <AlertCircle size={12} />
                      ) : (
                        <ShieldCheck size={12} />
                      )}
                      {sub.riskScore}/100
                    </Badge>
                  </td>
                  <td>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSubscriptionAutoRenew(sub.id);
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: '0.78rem',
                        color: sub.autoRenew ? '#34D399' : '#94A3B8',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(255, 255, 255, 0.03)',
                      }}
                      title="Click to toggle auto-renew state"
                    >
                      {sub.autoRenew ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                      {sub.autoRenew ? 'Active' : 'Frozen'}
                    </button>
                  </td>
                  <td>
                    <ChevronRight size={16} color="#64748B" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Subscription Details Modal */}
      <SubscriptionDetailsModal />
    </div>
  );
};
