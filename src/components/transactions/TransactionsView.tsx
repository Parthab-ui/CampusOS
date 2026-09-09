import React, { useState } from 'react';
import {
  Search,
  Receipt,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import { useFinancialData } from '../../context/FinancialDataContext';
import { formatCurrency, formatDate } from '../../core/config/constants';
import { TransactionDrawer } from './TransactionDrawer';

export const TransactionsView: React.FC = () => {
  const { transactions, setSelectedTransaction } = useFinancialData();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'recurring' | 'duplicates' | 'onetime'>('all');
  const [showRawStatements, setShowRawStatements] = useState(false);

  const filtered = transactions.filter((tx) => {
    // Mode filter
    if (filterMode === 'recurring' && !tx.isRecurring) return false;
    if (filterMode === 'duplicates' && !tx.duplicateAlert?.isDuplicate) return false;
    if (filterMode === 'onetime' && tx.isRecurring) return false;

    // Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchMerchant = tx.merchantName.toLowerCase().includes(q);
      const matchRaw = tx.rawDescription.toLowerCase().includes(q);
      const matchNotes = tx.notes?.toLowerCase().includes(q) ?? false;
      if (!matchMerchant && !matchRaw && !matchNotes) return false;
    }

    return true;
  });

  const duplicatesCount = transactions.filter((t) => t.duplicateAlert?.isDuplicate).length;
  const recurringCount = transactions.filter((t) => t.isRecurring).length;

  return (
    <div className="panel-card">
      {/* Header & Controls */}
      <div className="panel-header" style={{ flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Receipt size={20} color="#60A5FA" />
            Transaction Stream & Intelligence Ledger
          </h2>
          <p className="panel-subtitle">
            {transactions.length} total debits analyzed with automated merchant cleansing, cadence intervals, and duplicate checks
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search Box */}
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
              placeholder="Search merchant or raw statement..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '8px 10px',
                fontSize: '0.85rem',
                outline: 'none',
                width: 220,
              }}
            />
          </div>

          {/* Raw Statement Toggle */}
          <button
            onClick={() => setShowRawStatements(!showRawStatements)}
            className="btn-dismiss"
            style={{
              fontSize: '0.78rem',
              border: '1px solid var(--border-subtle)',
              background: showRawStatements ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
            }}
          >
            {showRawStatements ? 'Hide Raw Codes' : 'Show Raw Codes'}
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 12 }}>
        <button
          onClick={() => setFilterMode('all')}
          className={`filter-pill ${filterMode === 'all' ? 'active' : ''}`}
        >
          All Transactions ({transactions.length})
        </button>
        <button
          onClick={() => setFilterMode('recurring')}
          className={`filter-pill ${filterMode === 'recurring' ? 'active' : ''}`}
        >
          Recurring Subscriptions ({recurringCount})
        </button>
        <button
          onClick={() => setFilterMode('duplicates')}
          className={`filter-pill filter-pill-danger ${filterMode === 'duplicates' ? 'active' : ''}`}
        >
          Duplicate Alerts ({duplicatesCount})
        </button>
        <button
          onClick={() => setFilterMode('onetime')}
          className={`filter-pill ${filterMode === 'onetime' ? 'active' : ''}`}
        >
          One-Off Expenses
        </button>
      </div>

      {/* Table */}
      <div className="data-table-container">
        <table className="fintech-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Canonical Merchant</th>
              <th>Category</th>
              <th>Card / Account</th>
              <th>Amount</th>
              <th>Recurring Intelligence</th>
              <th>Audit Signal</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((tx) => {
              const intel = tx.recurringIntelligence;
              const hasDup = tx.duplicateAlert?.isDuplicate;

              return (
                <tr
                  key={tx.id}
                  onClick={() => setSelectedTransaction(tx)}
                  style={{ cursor: 'pointer' }}
                  title="Click to inspect transaction intelligence"
                >
                  <td>
                    <span style={{ fontSize: '0.85rem' }}>{formatDate(tx.date)}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="merchant-avatar-small">
                        {tx.merchantName.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#F8FAFC' }}>
                          {tx.merchantName}
                        </div>
                        {showRawStatements ? (
                          <div
                            style={{
                              fontSize: '0.72rem',
                              fontFamily: 'var(--font-mono)',
                              color: '#94A3B8',
                            }}
                          >
                            {tx.rawDescription}
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                            {tx.merchantIntelligence?.domain || 'Direct Statement'}
                          </div>
                        )}
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
                    {intel?.isRecurring ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            color: '#34D399',
                          }}
                        >
                          <CheckCircle size={13} />
                          Recurring ({(intel.confidenceScore * 100).toFixed(0)}%)
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                          {intel.detectedCadence} • {intel.cadenceRegularity}
                        </span>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                        Non-recurring
                      </span>
                    )}
                  </td>
                  <td>
                    {hasDup ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          color: '#F87171',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: 'rgba(239, 68, 68, 0.1)',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        <AlertTriangle size={12} />
                        Duplicate
                      </span>
                    ) : tx.status === 'flagged' ? (
                      <span
                        style={{
                          color: '#FBBF24',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                      >
                        Flagged
                      </span>
                    ) : (
                      <span style={{ color: '#64748B', fontSize: '0.75rem' }}>Normal</span>
                    )}
                  </td>
                  <td>
                    <ChevronRight size={16} color="#64748B" />
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '48px 20px', color: '#94A3B8' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#E2E8F0', marginBottom: 4 }}>
                    No ledger transactions found
                  </div>
                  <div style={{ fontSize: '0.82rem' }}>
                    No transactions matched your search or category filter. Try clearing your search query.
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Drawer */}
      <TransactionDrawer />
    </div>
  );
};
