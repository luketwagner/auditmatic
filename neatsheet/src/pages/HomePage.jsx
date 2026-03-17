import { useMemo } from 'react'
import EntriesTable from '../components/EntriesTable'
import MetricCard from '../components/MetricCard'
import { useEntries } from '../hooks/useTransactions'
import { buildFinancialStatements } from '../utils/accountingEngine'
import { scanJournalEntryRisks } from '../utils/fraudScanner'

function sortByDateDesc(entries) {
  return [...entries].sort((a, b) => new Date(b.date) - new Date(a.date))
}

export default function HomePage() {
  const { entries, loading, error } = useEntries()
  const statements = useMemo(() => buildFinancialStatements(entries), [entries])
  const flagged = useMemo(() => scanJournalEntryRisks(entries), [entries])
  const recentEntries = useMemo(() => sortByDateDesc(entries).slice(0, 8), [entries])

  return (
    <div className="space-y-6">
      <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-emerald-200">
        <h1 className="text-3xl font-bold text-emerald-950">Auditmatic</h1>
        <p className="mt-2 text-sm text-emerald-800">
          Upload journal entries, auto-classify accounts, generate financial statements, and scan
          for risky transaction patterns.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Revenue" value={statements.dashboard.totalRevenue} />
        <MetricCard label="Total Expenses" value={statements.dashboard.totalExpenses} />
        <MetricCard label="Net Income" value={statements.dashboard.netIncome} />
        <MetricCard label="Total Assets" value={statements.dashboard.totalAssets} />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-emerald-200">
          <p className="text-xs uppercase tracking-wide text-emerald-700">Entries Loaded</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-950">{entries.length}</p>
        </article>
        <article className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-emerald-200">
          <p className="text-xs uppercase tracking-wide text-emerald-700">Risk Flags</p>
          <p className="mt-2 text-2xl font-semibold text-rose-700">{flagged.length}</p>
        </article>
      </section>

      {loading && <p className="text-sm text-emerald-800">Loading entries...</p>}
      {error && <p className="text-sm text-rose-700">Failed to load entries: {error.message}</p>}

      <EntriesTable rows={recentEntries} title="Recent Journal Entries" />
    </div>
  )
}
