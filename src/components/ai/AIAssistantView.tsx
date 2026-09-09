import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  Send,
  CheckCircle2,
  Cpu,
  RefreshCw,
  Check,
  Copy,
} from 'lucide-react';
import { useFinancialData } from '../../context/FinancialDataContext';
import {
  AIAssistantService,
  AI_AUDIT_PRESETS,
} from '../../services/aiAssistantService';
import { AIAssistantMessage } from '../../core/types';
import { formatCurrency } from '../../core/config/constants';

export const AIAssistantView: React.FC = () => {
  const {
    subscriptions,
    transactions,
    auditIssues,
    savingsOpportunities,
    subscriptionSummary,
    auditSummary,
    savingsSummary,
    forecast,
  } = useFinancialData();

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AIAssistantMessage[]>([
    {
      id: 'initial-welcome',
      role: 'assistant',
      timestamp: 'Just now',
      provider: 'gemini-flash',
      modelName: 'Gemini Flash AI',
      content:
        'Hello! I am your **AI Financial Copilot**. I analyze your live recurring payments, identify hidden price hikes, detect duplicate accounts across credit cards, and prioritize concrete savings opportunities.\n\nSelect a common investigation below or ask any question about your software spending.',
    },
  ]);

  const handleSend = async (queryToSend?: string) => {
    const query = queryToSend || inputQuery;
    if (!query.trim() || isLoading) return;

    const userMessage: AIAssistantMessage = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: query,
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!queryToSend) setInputQuery('');
    setIsLoading(true);

    try {
      const response = await AIAssistantService.queryCopilot(query, {
        subscriptions,
        transactions,
        auditIssues,
        savingsOpportunities,
        subscriptionSummary,
        auditSummary,
        savingsSummary,
        forecast,
      });

      setMessages((prev) => [...prev, response]);
    } catch {
      // Emergency fallback
      const fallback = AIAssistantService.processDeterministicPrompt(
        query,
        subscriptions,
        auditIssues,
        savingsOpportunities
      );
      setMessages((prev) => [
        ...prev,
        { ...fallback, provider: 'deterministic-fallback', modelName: 'Deterministic Engine' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ai-view-container">
      {/* AI Hero Banner */}
      <div className="ai-hero-card">
        <div className="ai-hero-header" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="ai-sparkle-badge">
              <Bot size={24} />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700 }}>
                AI Financial Copilot
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#CBD5E1' }}>
                Natural language investigation grounded in your actual statement ledger and contracts
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              color: '#A78BFA',
            }}
          >
            <Cpu size={13} />
            <span>Gemini 3.5 / 2.5 Flash Free API + Deterministic Engine</span>
          </div>
        </div>

        {/* Quick Audit Prompt Chips */}
        <div>
          <div style={{ fontSize: '0.74rem', fontWeight: 600, textTransform: 'uppercase', color: '#94A3B8', marginBottom: 8 }}>
            Recommended Investigations
          </div>
          <div className="prompt-chips-grid">
            {AI_AUDIT_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleSend(preset.query)}
                disabled={isLoading}
                className="prompt-chip"
              >
                <Sparkles size={14} color="#A78BFA" />
                <span>{preset.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Message Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {messages.map((msg) => (
          <div key={msg.id}>
            {msg.role === 'user' ? (
              <div
                style={{
                  alignSelf: 'flex-end',
                  marginLeft: 'auto',
                  maxWidth: '75%',
                  background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                  padding: '12px 18px',
                  borderRadius: '16px 16px 4px 16px',
                  color: '#FFFFFF',
                  fontSize: '0.9rem',
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                {msg.content}
              </div>
            ) : (
              <div className="ai-report-card">
                {/* Message Header & Provider Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#A78BFA', fontSize: '0.8rem', fontWeight: 600 }}>
                    <Sparkles size={14} />
                    <span>SubGuard AI Analysis • {msg.timestamp}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(msg.content);
                        setCopiedMsgId(msg.id);
                        setTimeout(() => setCopiedMsgId(null), 2000);
                      }}
                      style={{
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '3px 8px',
                        fontSize: '0.72rem',
                        color: copiedMsgId === msg.id ? '#34D399' : '#94A3B8',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      {copiedMsgId === msg.id ? <Check size={11} /> : <Copy size={11} />}
                      <span>{copiedMsgId === msg.id ? 'Copied' : 'Copy'}</span>
                    </button>

                    <span
                      className="badge"
                      style={{
                        fontSize: '0.7rem',
                        background: msg.provider === 'gemini-flash' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        color: msg.provider === 'gemini-flash' ? '#C084FC' : '#34D399',
                        border: msg.provider === 'gemini-flash' ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
                      }}
                    >
                      {msg.provider === 'gemini-flash' ? '✨ Gemini Flash' : '⚡ Deterministic Engine'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div style={{ fontSize: '0.92rem', color: '#E2E8F0', lineHeight: 1.65, whiteSpace: 'pre-line' }}>
                  {msg.content}
                </div>

                {/* Structured Audit Component */}
                {msg.structuredAuditReport && (
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: 18,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 16,
                      marginTop: 6,
                    }}
                  >
                    <div className="ai-report-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div className="ai-report-headline">{msg.structuredAuditReport.headline}</div>
                      {msg.structuredAuditReport.potentialAnnualImpact > 0 && (
                        <div
                          style={{
                            background: 'rgba(16, 185, 129, 0.12)',
                            color: '#34D399',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-md)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          Potential Yield: {formatCurrency(msg.structuredAuditReport.potentialAnnualImpact)}/yr
                        </div>
                      )}
                    </div>

                    <p style={{ fontSize: '0.86rem', color: '#CBD5E1', lineHeight: 1.55 }}>
                      {msg.structuredAuditReport.executiveSummary}
                    </p>

                    <div>
                      <div className="ai-report-section-title">Key Audit Findings</div>
                      <ul className="ai-report-list">
                        {msg.structuredAuditReport.keyFindings.map((finding, idx) => (
                          <li key={idx} dangerouslySetInnerHTML={{ __html: finding.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                        ))}
                      </ul>
                    </div>

                    <div>
                      <div className="ai-report-section-title">Immediate Action Steps</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {msg.structuredAuditReport.immediateActionItems.map((action, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              fontSize: '0.85rem',
                              color: '#34D399',
                            }}
                          >
                            <CheckCircle2 size={15} />
                            <span>{action}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="ai-report-card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 18 }}>
            <RefreshCw size={18} className="spinning" color="#A78BFA" />
            <span style={{ fontSize: '0.88rem', color: '#CBD5E1' }}>
              Gemini Financial Copilot is reasoning over your ledger and contracts...
            </span>
          </div>
        )}
      </div>

      {/* Prompt Input Bar */}
      <div
        style={{
          position: 'sticky',
          bottom: 24,
          background: 'rgba(14, 20, 36, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-card)',
          padding: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <input
          type="text"
          placeholder="Ask AI Financial Copilot (e.g. 'Why was Netflix flagged?', 'How to save 20%?')..."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={isLoading}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            padding: '10px 14px',
            fontSize: '0.9rem',
            color: '#F8FAFC',
          }}
        />

        <button
          onClick={() => handleSend()}
          disabled={isLoading}
          className="scan-audit-btn"
          style={{
            padding: '10px 18px',
            borderRadius: 'var(--radius-md)',
          }}
        >
          {isLoading ? (
            <RefreshCw size={15} className="spinning" />
          ) : (
            <Send size={15} />
          )}
          <span>{isLoading ? 'Analyzing...' : 'Ask Copilot'}</span>
        </button>
      </div>
    </div>
  );
};
