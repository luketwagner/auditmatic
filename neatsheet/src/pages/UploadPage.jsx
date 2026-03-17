import { useMemo, useState } from 'react'
import CSVUploader from '../components/CSVUploader'
import EntriesTable from '../components/EntriesTable'
import { useEntries } from '../hooks/useTransactions'
import { db } from '../lib/instantdb'

function sortByNewestUpload(items = []) {
  return [...items].sort((a, b) => new Date(b.uploadedAt || 0) - new Date(a.uploadedAt || 0))
}

export default function UploadPage({ userEmail }) {
  const [uploadMeta, setUploadMeta] = useState(null)
  const [clearError, setClearError] = useState('')
  const [activeTab, setActiveTab] = useState('upload')
  const [selectedUploadId, setSelectedUploadId] = useState('all')
  const [isClearing, setIsClearing] = useState(false)
  const { entries, uploads, loading, error } = useEntries()

  const orderedUploads = useMemo(() => sortByNewestUpload(uploads), [uploads])
  const filteredEntries = useMemo(() => {
    if (selectedUploadId === 'all') return entries
    return entries.filter((entry) => entry.uploadId === selectedUploadId)
  }, [entries, selectedUploadId])
  const latestEntries = useMemo(
    () => sortByNewestUpload(filteredEntries).slice(0, 12),
    [filteredEntries],
  )

  async function handleClearAllData() {
    const confirmed = window.confirm(
      'Clear all uploaded data? This removes every uploaded CSV history record and all journal entries.',
    )
    if (!confirmed) return

    setIsClearing(true)
    setClearError('')
    try {
      const deleteEntryOps = entries.map((entry) => db.tx.entries[entry.id].delete())
      const deleteUploadOps = uploads.map((upload) => db.tx.uploads[upload.id].delete())
      await db.transact([...deleteEntryOps, ...deleteUploadOps])
      setUploadMeta(null)
      setSelectedUploadId('all')
      setActiveTab('upload')
    } catch (clearError) {
      setClearError(clearError?.message || 'Unable to clear uploaded data.')
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-emerald-200">
        <h1 className="text-2xl font-bold text-emerald-950">Upload Accounting Data</h1>
        <p className="mt-2 text-sm text-emerald-800">
          Upload journal entries CSV with columns: date, account, debit, credit, description.
        </p>
      </section>

      <section className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-emerald-200">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-emerald-950">Data reset</p>
            <p className="text-xs text-emerald-800">
              Clears all uploaded journal entries from statements and fraud scanner.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClearAllData}
            disabled={isClearing || (entries.length === 0 && uploads.length === 0)}
            className="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isClearing ? 'Clearing...' : 'Clear all uploaded data'}
          </button>
        </div>
        {clearError && <p className="mt-3 text-sm text-rose-700">{clearError}</p>}
      </section>

      <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-emerald-200">
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`rounded-md px-3 py-2 text-sm font-medium ${
              activeTab === 'upload'
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
            }`}
          >
            Upload CSV
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`rounded-md px-3 py-2 text-sm font-medium ${
              activeTab === 'history'
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
            }`}
          >
            Previously Uploaded Files
          </button>
        </div>

        {activeTab === 'upload' ? (
          <>
            <CSVUploader onUploadComplete={setUploadMeta} userEmail={userEmail} />
            {uploadMeta && (
              <p className="mt-3 text-sm text-emerald-700">
                Latest upload processed {uploadMeta.count} entries.
              </p>
            )}
          </>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-emerald-800">
              Select an upload to filter entries loaded in Auditmatic.
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-emerald-700">
                  <tr>
                    <th className="px-2 py-2 font-medium">Uploaded At</th>
                    <th className="px-2 py-2 font-medium">File Name</th>
                    <th className="px-2 py-2 font-medium">Uploader</th>
                    <th className="px-2 py-2 text-right font-medium">Rows</th>
                    <th className="px-2 py-2 text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orderedUploads.map((upload) => (
                    <tr key={upload.id} className="border-t border-emerald-100">
                      <td className="px-2 py-2">{new Date(upload.uploadedAt).toLocaleString()}</td>
                      <td className="px-2 py-2">{upload.fileName || 'Untitled CSV'}</td>
                      <td className="px-2 py-2">{upload.uploaderEmail || '-'}</td>
                      <td className="px-2 py-2 text-right">{upload.entryCount || 0}</td>
                      <td className="px-2 py-2 text-right">
                        <button
                          type="button"
                          className="rounded-md bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800 hover:bg-emerald-200"
                          onClick={() => {
                            setSelectedUploadId(upload.id)
                            setActiveTab('upload')
                          }}
                        >
                          View Entries
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {orderedUploads.length === 0 && (
              <p className="text-sm text-emerald-700">No upload history yet.</p>
            )}
          </div>
        )}
      </section>

      {loading && <p className="text-sm text-emerald-800">Loading entries...</p>}
      {error && <p className="text-sm text-rose-700">Failed to load entries: {error.message}</p>}

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-emerald-800">Viewing:</span>
          <button
            type="button"
            onClick={() => setSelectedUploadId('all')}
            className={`rounded-md px-2 py-1 ${
              selectedUploadId === 'all'
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
            }`}
          >
            All uploads
          </button>
          {orderedUploads.slice(0, 6).map((upload) => (
            <button
              key={upload.id}
              type="button"
              onClick={() => setSelectedUploadId(upload.id)}
              className={`rounded-md px-2 py-1 ${
                selectedUploadId === upload.id
                  ? 'bg-emerald-700 text-white'
                  : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
              }`}
            >
              {upload.fileName}
            </button>
          ))}
        </div>
        <EntriesTable rows={latestEntries} title="Current Stored Entries" />
      </div>
    </div>
  )
}
