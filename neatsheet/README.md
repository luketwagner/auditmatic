# Auditmatic

Auditmatic is a full-stack React web app for accountants to ingest journal entries, auto-classify accounts, generate financial statements, and scan for suspicious entries.

The app uses:

- React (Vite frontend)
- InstantDB (`@instantdb/react`) for data storage
- Vercel-ready deployment setup

## Features

- CSV upload for journal entries with required columns:
  - `date`
  - `account`
  - `debit`
  - `credit`
  - `description`
- Automatic account classification:
  - Assets, Liabilities, Equity, Revenue, Expenses
  - Unknown accounts default to `Other`
- Financial statements:
  - Income Statement (`Revenue - Expenses`)
  - Balance Sheet (`Assets = Liabilities + Equity`)
- Fraud / anomaly scanner rules:
  - Round numbers
  - Duplicate transactions (same date + amount + description)
  - Large transactions (> $10,000)
- Route-based pages:
  - Home
  - Upload Data
  - Financial Statements
  - Fraud Scanner Dashboard

## InstantDB Configuration

This project defaults to the provided public app ID:

`030027bb-363b-4147-85a2-9ae83c580d43`

You can override it with an environment variable:

```bash
VITE_INSTANTDB_APP_ID=030027bb-363b-4147-85a2-9ae83c580d43
```

## Local Development

```bash
npm install
npm run dev
```

## Demo CSV Datasets

The upload page includes labeled downloads for:

- `public/sample-transactions.csv` (standard set, 24 rows)
- `public/sample-clean-demo.csv` (clean set, 30 rows)
- `public/sample-fraud-heavy-demo.csv` (high-risk set, 32 rows)

## Vercel Deployment

1. Import this project into Vercel.
2. Set `VITE_INSTANTDB_APP_ID` in Project Settings (Environment Variables).
3. Deploy.

This is a client-rendered Vite app and works with standard Vercel static deployment.
