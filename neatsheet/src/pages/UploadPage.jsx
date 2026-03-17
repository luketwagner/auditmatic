import { useState } from 'react'
import CSVUploader from '../components/CSVUploader'
import EntriesTable from '../components/EntriesTable'
import { useEntries } from '../hooks/useTransactions'

export default function UploadPage() {
  const [uploadMeta, setUploadMeta] = useState(null)
  const { entries, loading, error } = useEntries()
  const latestEntries = [...entries].slice(0, 10)

  return (
    <div className="space-y-6">
      <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-emerald-200">
        <h1 className="text-2xl font-bold text-emerald-950">Upload Accounting Data</h1>
        <p className="mt-2 text-sm text-emerald-800">
          Upload journal entries CSV with columns: date, account, debit, credit, description.
        </p>
      </section>

      <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-emerald-200">
        <CSVUploader existingEntries={entries} onUploadComplete={setUploadMeta} />
        {uploadMeta && (
          <p className="mt-3 text-sm text-emerald-700">
            Latest upload processed {uploadMeta.count} entries.
          </p>
        )}
      </section>

      {loading && <p className="text-sm text-emerald-800">Loading entries...</p>}
      {error && <p className="text-sm text-rose-700">Failed to load entries: {error.message}</p>}

      <EntriesTable rows={latestEntries} title="Current Stored Entries" />
    </div>
  )
}
