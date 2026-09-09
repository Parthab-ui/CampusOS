import React from 'react';
import { Calendar, AlertCircle } from 'lucide-react';
import { useFinancialData } from '../../context/FinancialDataContext';
import { formatCurrency, formatDate } from '../../core/config/constants';

export const RenewalRadar: React.FC = () => {
  const { forecast, setActiveTab } = useFinancialData();

  const upcomingRenewals = forecast.renewals.slice(0, 5);

  return (
    <div className="panel-card">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">14-Day Renewal Radar</h2>
          <p className="panel-subtitle">
            Upcoming automated charges scheduled against connected payment instruments
          </p>
        </div>
        <button
          onClick={() => setActiveTab('subscriptions')}
          className="btn-resolve"
          style={{ fontSize: '0.78rem' }}
        >
          View All Subscriptions
        </button>
      </div>

      <div className="data-table-container">
        <table className="fintech-table">
          <thead>
            <tr>
              <th>Renewal Date</th>
              <th>Subscription</th>
              <th>Category</th>
              <th>Payment Card</th>
              <th>Renewal Cost</th>
              <th>Audit Status</th>
            </tr>
          </thead>
          <tbody>
            {upcomingRenewals.map((r) => (
              <tr key={r.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Calendar size={14} color="#94A3B8" />
                    <span>{formatDate(r.date)}</span>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: r.daysUntilRenewal <= 2 ? '#EF4444' : '#94A3B8',
                      }}
                    >
                      ({r.daysUntilRenewal === 0 ? 'Today' : `${r.daysUntilRenewal}d away`})
                    </span>
                  </div>
                </td>
                <td>
                  <span style={{ fontWeight: 600, color: '#F8FAFC' }}>{r.subscriptionName}</span>
                </td>
                <td>
                  <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{r.category.replace('_', ' ')}</span>
                </td>
                <td>
                  <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                    {r.paymentMethodName || 'Primary Card'}
                  </span>
                </td>
                <td>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#F8FAFC' }}>
                    {formatCurrency(r.amount, r.currency)}
                  </span>
                </td>
                <td>
                  {r.isFlaggedForReview ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        color: '#F87171',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      <AlertCircle size={13} />
                      Flagged in Audit
                    </span>
                  ) : (
                    <span style={{ color: '#34D399', fontSize: '0.75rem', fontWeight: 600 }}>
                      Verified Normal
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
