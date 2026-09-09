export interface AIAuditPromptPreset {
  id: string;
  label: string;
  query: string;
  category: 'audit' | 'savings' | 'negotiation' | 'forecast';
  icon: string;
}

export interface AIAssistantMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  structuredAuditReport?: {
    headline: string;
    executiveSummary: string;
    keyFindings: string[];
    immediateActionItems: string[];
    potentialAnnualImpact: number;
    currency: string;
  };
}

export interface AIFinancialInsight {
  id: string;
  title: string;
  category: 'alert' | 'opportunity' | 'forecast';
  impactBadge: string;
  summary: string;
  confidence: number;
  timestamp: string;
}
