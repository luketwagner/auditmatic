import { useMemo } from 'react'
import EntriesTable from '../components/EntriesTable'
import SuspiciousEntriesTable from '../components/SuspiciousEntriesTable'
import { useEntries } from '../hooks/useTransactions'
import { scanJournalEntryRisks } from '../utils/fraudScanner'

function sortByDateDesc(entries) {
  return [...entries].sort((a, b) => new Date(b.date) - new Date(a.date))
}

export default function FraudDashboardPage() {
  const { entries, loading, error } = useEntries()
  const flagged = useMemo(() => scanJournalEntryRisks(entries), [entries])
  const recentEntries = useMemo(() => sortByDateDesc(entries).slice(0, 8), [entries])

  return (
    <div className="space-y-6">
      <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-emerald-200">
        <h1 className="text-2xl font-bold text-emerald-950">Fraud Scanner Dashboard</h1>
        <p className="mt-2 text-sm text-emerald-800">
          Rules: round numbers, duplicates, and large transactions above $10,000.
        </p>
      </section>

      {loading && <p className="text-sm text-emerald-800">Loading entries...</p>}
      {error && <p className="text-sm text-rose-700">Failed to load entries: {error.message}</p>}

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-emerald-200">
          <p className="text-xs uppercase tracking-wide text-emerald-700">Total Entries</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-950">{entries.length}</p>
        </article>
        <article className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-emerald-200">
          <p className="text-xs uppercase tracking-wide text-emerald-700">Flagged Entries</p>
          <p className="mt-2 text-2xl font-semibold text-rose-700">{flagged.length}</p>
        </article>
      </section>

      <SuspiciousEntriesTable flagged={flagged} />
      <EntriesTable rows={recentEntries} title="Recent Journal Entries" />
    </div>
  )
}
