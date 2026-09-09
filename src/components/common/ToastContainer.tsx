import React from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import { useFinancialData } from '../../context/FinancialDataContext';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useFinancialData();

  if (toasts.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} color="#34D399" />;
      case 'warning':
        return <AlertTriangle size={18} color="#FBBF24" />;
      case 'error':
        return <XCircle size={18} color="#F87171" />;
      default:
        return <Info size={18} color="#818CF8" />;
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'rgba(16, 185, 129, 0.4)';
      case 'warning':
        return 'rgba(245, 158, 11, 0.4)';
      case 'error':
        return 'rgba(239, 68, 68, 0.4)';
      default:
        return 'rgba(99, 102, 241, 0.4)';
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        maxWidth: 380,
        width: 'calc(100vw - 48px)',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="toast-notification"
          style={{
            pointerEvents: 'auto',
            background: 'rgba(14, 20, 36, 0.92)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: `1px solid ${getBorderColor(toast.type)}`,
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            animation: 'toastSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        >
          <div style={{ marginTop: 2, flexShrink: 0 }}>{getIcon(toast.type)}</div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: '0.86rem',
                fontWeight: 600,
                color: '#F8FAFC',
                marginBottom: 2,
              }}
            >
              {toast.title}
            </div>
            <div
              style={{
                fontSize: '0.78rem',
                color: '#CBD5E1',
                lineHeight: 1.45,
                wordBreak: 'break-word',
              }}
            >
              {toast.message}
            </div>
          </div>

          <button
            onClick={() => dismissToast(toast.id)}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748B',
              cursor: 'pointer',
              padding: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color var(--transition-fast)',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#F8FAFC')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = '#64748B')}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
