/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME?: string;
  readonly VITE_APP_ENV?: string;
  readonly VITE_APP_VERSION?: string;
  readonly VITE_FINANCIAL_DATA_MODE?: string;
  readonly VITE_DEFAULT_CURRENCY?: string;
  readonly VITE_AUDIT_PRICE_HIKE_THRESHOLD_PCT?: string;
  readonly VITE_AUDIT_ZOMBIE_DAYS_THRESHOLD?: string;
  readonly VITE_AUDIT_RENEWAL_RADAR_DAYS?: string;
  readonly VITE_AI_PROVIDER?: string;
  readonly VITE_AI_MODEL?: string;
  readonly VITE_GEMINI_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
