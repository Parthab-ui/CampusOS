export interface AIAuditPromptPreset {
  id: string;
  label: string;
  query: string;
  category: 'audit' | 'savings' | 'negotiation' | 'forecast';
  icon: string;
}

export type CopilotProvider = 'gemini-flash' | 'deterministic-fallback';

export interface StructuredAuditReport {
  headline: string;
  executiveSummary: string;
  keyFindings: string[];
  immediateActionItems: string[];
  potentialAnnualImpact: number;
  currency: string;
}

export interface AIAssistantMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  provider?: CopilotProvider;
  modelName?: string;
  structuredAuditReport?: StructuredAuditReport;
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

export interface CopilotApiResponse {
  success: boolean;
  fallback: boolean;
  provider: CopilotProvider;
  model?: string;
  text?: string;
  structuredAuditReport?: StructuredAuditReport;
  error?: string;
}
