# SubGuard AI — Subscription Manager & FinTech Audit Tool

[![React 19](https://img.shields.io/badge/React-19.0.0-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Security](https://img.shields.io/badge/FinTech-Synthetic_Sandbox-10B981)](#security--synthetic-data-sandbox)

> An enterprise-grade AI subscription manager, recurring-payment intelligence engine, and automated financial auditing platform for identifying spend leakage, silent price hikes, duplicate card charges, and inactive SaaS seats.

---

## 🌟 Executive Overview

Modern organizations and power consumers bleed between 15% to 30% of software spend into forgotten subscriptions, unannounced vendor price increases, redundant cloud storage, and unutilized licenses. 

**SubGuard AI** introduces automated algorithmic auditing and generative financial intelligence to continuously analyze transaction streams, track recurring cadences, and proactively generate spend optimization playbooks.

---

## 🚀 Key Architectural Capabilities

| Domain | Architecture Boundary | Description |
| :--- | :--- | :--- |
| **Merchant Normalization** | `MerchantNormalizer` | Standardizes raw, noisy bank statement lines into canonical merchant profiles, domain identifiers, and category mappings. |
| **Recurring Intelligence** | `RecurringIntelligenceEngine` | Computes statistical interval means, variances, cadence classification (weekly/monthly/annual), and human-readable explainability narratives. |
| **Duplicate Billing Engine**| `DuplicateDetector` | Flags same-day double swipes and multi-card subscription redundancies with quantifiable loss calculations. |
| **Renewal Forecasting** | `RenewalForecaster` | Projects deterministic next renewal dates with calendar month boundary clamping and projected annual commitments. |
| **Spend Normalization** | `SubscriptionService` | Normalizes spend across weekly, monthly, quarterly, and annual billing cycles into true Monthly Recurring Spend (MRR) and Annual Run-Rate (ARR). |
| **FinTech Audit Engine** | `AuditEngine` | Continuous heuristic audit rules detecting silent price creeps (e.g. Netflix +15%), multi-card duplicate charges (e.g. Spotify), and zombie seats (>60 days inactive). |
| **Savings Optimizer** | `SavingsAdvisor` | Identifies concrete low-friction actions (unbundling, annual billing transitions, de-provisioning) with instant annual ROI calculations. |
| **AI Financial Copilot** | `AIAssistantService` | Autonomous conversational intelligence powered by Google Gemini 3.5 / 2.5 Flash with zero-downtime fallback to deterministic logic. |

---

## 📐 Project Structure

```
SubGuard_AI/
├── .env.example                     # Environment configuration and audit thresholds
├── .gitignore                       # Strict ignore rules for secrets, envs, and banking credentials
├── README.md                        # Primary documentation & quickstart
├── docs/
│   └── ARCHITECTURE.md              # In-depth architectural specifications & domain models
├── index.html                       # HTML5 entrypoint with Google Fonts typography
├── package.json                     # Scripts and dependencies
├── tsconfig.json                    # Strict TypeScript compiler options & path aliases
├── tsconfig.node.json               # Node compiler options for Vite configuration
├── vite.config.ts                   # Fast Vite bundler and path resolution
└── src/
    ├── core/                        # Pure domain models, types, and mock datasets
    │   ├── config/                  # Environment validator and financial constants
    │   ├── mock/                    # Realistic synthetic fintech datasets
    │   └── types/                   # Foundational TypeScript interfaces (Transactions, Subscriptions, Audits)
    ├── services/                    # Autonomous business logic and intelligence engines
    │   ├── merchantNormalizer.ts    # Canonical merchant name and domain cleansing
    │   ├── recurringIntelligence.ts # Statistical interval variance & cadence classifier
    │   ├── duplicateDetector.ts     # Same-day and multi-card duplicate detection
    │   ├── renewalForecaster.ts     # Deterministic renewal projection & calendar clamping
    │   ├── transactionService.ts    # Ledger filtering and recurring pattern recognition
    │   ├── subscriptionService.ts   # Cadence normalization and ARR computation
    │   ├── auditEngine.ts           # Anomaly rules (price hikes, duplicates, zombies, expiring trials)
    │   ├── forecastEngine.ts        # 14-day renewal radar and cash flow runway
    │   ├── savingsAdvisor.ts        # Savings aggregation and quick-win prioritization
    │   └── aiAssistantService.ts    # AI prompt orchestrator and structured audit generation
    ├── context/
    │   └── FinancialDataContext.tsx # Reactive React Context state and action dispatcher
    ├── components/
    │   ├── common/                  # MetricCard, Badge, Button
    │   ├── layout/                  # Sidebar, TopBar, CriticalAlertBanner
    │   ├── dashboard/               # OverviewView, RenewalRadar
    │   ├── subscriptions/           # SubscriptionsView & SubscriptionDetailsModal
    │   ├── audit/                   # AuditView (anomaly resolution center)
    │   ├── transactions/            # TransactionsView & TransactionDrawer
    │   ├── savings/                 # SavingsView (optimization opportunities)
    │   └── ai/                      # AIAssistantView (interactive AI FinTech auditor)
    ├── styles/
    │   ├── tokens.css               # Curated obsidian fintech color tokens and glassmorphism
    │   ├── reset.css                # CSS reset
    │   └── app.css                  # Shell layout and component styles
    ├── App.tsx                      # Top-level shell and tab switcher
    ├── main.tsx                     # React 19 entry point
    └── vite-env.d.ts                # Vite environment type declarations
```

---

## 🔒 Security & Synthetic Data Sandbox

- **Zero Real Banking Credentials**: In this foundational architecture phase, SubGuard AI operates strictly on realistic, high-fidelity synthetic financial datasets.
- **Strict `.gitignore`**: All environment files (`.env*`), private keys (`*.pem`, `*.key`), certificates, banking tokens, and secrets are strictly blocked from version control.
- **Read-Only / Sandboxed State**: State mutations (e.g., resolving issues, toggling auto-renew, applying savings) are contained within the client-side context.

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 20+ (Node.js 24 recommended)
- npm 10+

### Installation
```bash
# Clone the repository
git clone https://github.com/Parthab-ui/SubGuard-AI.git
cd SubGuard-AI

# Install dependencies
npm install
```

### Local Development
```bash
# Launch Vite development server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Type-Checking & Production Build
```bash
# Run strict TypeScript validation
npm run typecheck

# Generate production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 🔮 Roadmap & Future Expansion

1. **OpenBanking / Plaid Sandbox Integration**: Direct read-only transaction webhook ingestion.
2. **LLM Provider Switching**: Seamless transition from synthetic deterministic AI to Google Gemini 1.5/2.0 API with structured tool-calling.
3. **Automated Cancellation Workflows**: Virtual card instant-freeze APIs and one-click cancellation email dispatchers.
4. **Exportable Audit PDF Reports**: Board-level and executive quarterly financial leakage audits.
