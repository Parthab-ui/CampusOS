import { TransactionCategory, BillingCycle } from '../types';

export const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  cloud_infrastructure: 'Cloud & Infrastructure',
  software_saas: 'Software & SaaS',
  ai_tools: 'AI & Machine Learning',
  streaming_media: 'Streaming & Media',
  productivity: 'Productivity & Office',
  cybersecurity: 'Security & Privacy',
  developer_tools: 'Developer Tools',
  telecom_utilities: 'Telecom & Utilities',
  health_fitness: 'Health & Fitness',
  finance_banking: 'Finance & Banking',
  miscellaneous: 'Miscellaneous',
};

export const CATEGORY_COLORS: Record<TransactionCategory, { bg: string; text: string; border: string }> = {
  cloud_infrastructure: { bg: 'rgba(59, 130, 246, 0.12)', text: '#60A5FA', border: 'rgba(59, 130, 246, 0.3)' },
  software_saas: { bg: 'rgba(139, 92, 246, 0.12)', text: '#A78BFA', border: 'rgba(139, 92, 246, 0.3)' },
  ai_tools: { bg: 'rgba(236, 72, 153, 0.12)', text: '#F472B6', border: 'rgba(236, 72, 153, 0.3)' },
  streaming_media: { bg: 'rgba(239, 68, 68, 0.12)', text: '#F87171', border: 'rgba(239, 68, 68, 0.3)' },
  productivity: { bg: 'rgba(16, 185, 129, 0.12)', text: '#34D399', border: 'rgba(16, 185, 129, 0.3)' },
  cybersecurity: { bg: 'rgba(245, 158, 11, 0.12)', text: '#FBBF24', border: 'rgba(245, 158, 11, 0.3)' },
  developer_tools: { bg: 'rgba(6, 182, 212, 0.12)', text: '#22D3EE', border: 'rgba(6, 182, 212, 0.3)' },
  telecom_utilities: { bg: 'rgba(107, 114, 128, 0.12)', text: '#9CA3AF', border: 'rgba(107, 114, 128, 0.3)' },
  health_fitness: { bg: 'rgba(34, 197, 94, 0.12)', text: '#4ADE80', border: 'rgba(34, 197, 94, 0.3)' },
  finance_banking: { bg: 'rgba(99, 102, 241, 0.12)', text: '#818CF8', border: 'rgba(99, 102, 241, 0.3)' },
  miscellaneous: { bg: 'rgba(156, 163, 175, 0.12)', text: '#D1D5DB', border: 'rgba(156, 163, 175, 0.3)' },
};

export const BILLING_CYCLE_MULTIPLIERS: Record<BillingCycle, number> = {
  weekly: 52 / 12, // approx 4.333
  monthly: 1,
  quarterly: 1 / 3,
  biannual: 1 / 6,
  annual: 1 / 12,
};

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function getDaysDifference(targetDateString: string, baseDateString: string = '2026-09-09'): number {
  const target = new Date(targetDateString).getTime();
  const base = new Date(baseDateString).getTime();
  const diffTime = target - base;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
