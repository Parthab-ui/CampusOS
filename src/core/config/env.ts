export interface AppConfig {
  appName: string;
  appEnv: 'development' | 'production' | 'test';
  appVersion: string;
  financialDataMode: 'mock' | 'live';
  defaultCurrency: string;
  auditThresholds: {
    priceHikePercentage: number;
    zombieDaysThreshold: number;
    renewalRadarDays: number;
  };
  ai: {
    provider: string;
    model: string;
    apiKey?: string;
  };
}

function parseNumber(val: unknown, fallback: number): number {
  if (typeof val === 'string') {
    const parsed = parseFloat(val);
    return isNaN(parsed) ? fallback : parsed;
  }
  if (typeof val === 'number') return val;
  return fallback;
}

export const env: AppConfig = {
  appName: (import.meta.env.VITE_APP_NAME as string) || 'AuditPulse AI',
  appEnv: ((import.meta.env.VITE_APP_ENV as string) || 'development') as AppConfig['appEnv'],
  appVersion: (import.meta.env.VITE_APP_VERSION as string) || '0.1.0',
  financialDataMode: ((import.meta.env.VITE_FINANCIAL_DATA_MODE as string) || 'mock') as 'mock' | 'live',
  defaultCurrency: (import.meta.env.VITE_DEFAULT_CURRENCY as string) || 'USD',
  auditThresholds: {
    priceHikePercentage: parseNumber(import.meta.env.VITE_AUDIT_PRICE_HIKE_THRESHOLD_PCT, 5.0),
    zombieDaysThreshold: parseNumber(import.meta.env.VITE_AUDIT_ZOMBIE_DAYS_THRESHOLD, 60),
    renewalRadarDays: parseNumber(import.meta.env.VITE_AUDIT_RENEWAL_RADAR_DAYS, 14),
  },
  ai: {
    provider: (import.meta.env.VITE_AI_PROVIDER as string) || 'local-synthetic',
    model: (import.meta.env.VITE_AI_MODEL as string) || 'gemini-1.5-flash',
    apiKey: import.meta.env.VITE_GEMINI_API_KEY as string | undefined,
  },
};
