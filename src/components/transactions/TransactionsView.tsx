import React, { useState } from 'react';
import { Search, Receipt, CheckCircle, AlertCircle } from 'lucide-react';
import { useFinancialData } from '../../context/FinancialDataContext';
import { formatCurrency, formatDate } from '../../core/config/constants';
import { TransactionService } from '../../services/transactionService';

export const TransactionsView: React.FC = () => {
  const { transactions } = useFinancialData();
  const [searchQuery, setSearchQuery] = useState('');
  const [recurringOnly, setRecurringOnly] = useState(false);

  const filtered = TransactionService.filterTransactions(transactions, {
    searchQuery,
    isRecurringOnly: recurringOnly,
  });

  return (
    <div className="panel-card">
      <div className="panel-header" style={{ flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Receipt size={20} color="#60A5FA" />
            Financial Ledger & Stream
          </h2>
          <p className="panel-subtitle">
            Historical charges analyzed by automated recurring pattern recognition
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
              placeholder="Search transaction description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '8px 10px',
                fontSize: '0.85rem',
                outline: 'none',
                width: 240,
              }}
            />
          </div>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.85rem',
              color: '#CBD5E1',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={recurringOnly}
              onChange={(e) => setRecurringOnly(e.target.checked)}
            />
            <span>Recurring Only</span>
          </label>
        </div>
      </div>

      <div className="data-table-container">
        <table className="fintech-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Merchant & Statement Line</th>
              <th>Category</th>
              <th>Payment Instrument</th>
              <th>Amount</th>
              <th>Recurring Status</th>
              <th>Audit Flag</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((tx) => (
              <tr key={tx.id}>
                <td>
                  <span style={{ fontSize: '0.85rem' }}>{formatDate(tx.date)}</span>
                </td>
                <td>
                  <div>
                    <div style={{ fontWeight: 600, color: '#F8FAFC' }}>{tx.merchantName}</div>
                    <div
                      style={{
                        fontSize: '0.74rem',
                        fontFamily: 'var(--font-mono)',
                        color: '#64748B',
                      }}
                    >
                      {tx.rawDescription}
                    </div>
                  </div>
                </td>
                <td>
                  <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                    {tx.category.replace('_', ' ')}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                    {tx.paymentMethodName || 'Card (Default)'}
                  </span>
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
                    {formatCurrency(tx.amount, tx.currency)}
                  </span>
                </td>
                <td>
                  {tx.isRecurring ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: '0.78rem',
                        color: '#818CF8',
                      }}
                    >
                      <CheckCircle size={13} />
                      Recurring ({(tx.confidenceScore * 100).toFixed(0)}%)
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.78rem', color: '#64748B' }}>One-time</span>
                  )}
                </td>
                <td>
                  {tx.status === 'flagged' ? (
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
                      Flagged
                    </span>
                  ) : (
                    <span style={{ color: '#94A3B8', fontSize: '0.75rem' }}>Posted</span>
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
