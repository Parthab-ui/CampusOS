import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  Send,
  CheckCircle2,
} from 'lucide-react';
import { useFinancialData } from '../../context/FinancialDataContext';
import {
  AIAssistantService,
  AI_AUDIT_PRESETS,
} from '../../services/aiAssistantService';
import { AIAssistantMessage } from '../../core/types';
import { formatCurrency } from '../../core/config/constants';

export const AIAssistantView: React.FC = () => {
  const { subscriptions, auditIssues, savingsOpportunities } = useFinancialData();
  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<AIAssistantMessage[]>([
    {
      id: 'initial-welcome',
      role: 'assistant',
      timestamp: 'Just now',
      content:
        'Hello! I am your autonomous **AI FinTech Audit Assistant**. I continuously monitor your subscription inventory, analyze statement recurring patterns, and identify silent price hikes or duplicate accounts. Select an audit objective below or ask me any custom financial question.',
    },
  ]);

  const handleSend = (queryToSend?: string) => {
    const query = queryToSend || inputQuery;
    if (!query.trim()) return;

    const userMessage: AIAssistantMessage = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: query,
    };

    const aiResponse = AIAssistantService.processUserPrompt(
      query,
      subscriptions,
      auditIssues,
      savingsOpportunities
    );

    setMessages((prev) => [...prev, userMessage, aiResponse]);
    if (!queryToSend) setInputQuery('');
  };

  return (
    <div className="ai-view-container">
      {/* AI Hero Banner */}
      <div className="ai-hero-card">
        <div className="ai-hero-header">
          <div className="ai-sparkle-badge">
            <Bot size={24} />
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700 }}>
              Autonomous FinTech Intelligence
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#CBD5E1' }}>
              Instant deep-dive reasoning over recurring transactions, contracts, and cash flow risk
            </p>
          </div>
        </div>

        {/* Quick Audit Prompt Chips */}
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: '#94A3B8', marginBottom: 6 }}>
            Recommended Audit Queries
          </div>
          <div className="prompt-chips-grid">
            {AI_AUDIT_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleSend(preset.query)}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#A78BFA', fontSize: '0.8rem', fontWeight: 600 }}>
                  <Sparkles size={14} />
                  <span>AuditPulse AI Analysis • {msg.timestamp}</span>
                </div>

                <div style={{ fontSize: '0.92rem', color: '#E2E8F0', lineHeight: 1.6 }}>
                  {msg.content}
                </div>

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
                    }}
                  >
                    <div className="ai-report-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div className="ai-report-headline">{msg.structuredAuditReport.headline}</div>
                      {msg.structuredAuditReport.potentialAnnualImpact > 0 && (
                        <div
                          style={{
                            background: 'rgba(239, 68, 68, 0.12)',
                            color: '#F87171',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
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
          placeholder="Ask AI FinTech Auditor (e.g. 'Audit all inactive seats', 'Find 15% budget cuts')..."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
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
          className="scan-audit-btn"
          style={{
            padding: '10px 18px',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <Send size={15} />
          <span>Analyze</span>
        </button>
      </div>
    </div>
  );
};
