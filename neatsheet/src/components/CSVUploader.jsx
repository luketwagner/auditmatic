import { useRef, useState } from 'react'
import { id } from '@instantdb/react'
import { db, instantAppId } from '../lib/instantdb'
import { parseCSV } from '../utils/parseCSV'

function isConfiguredAppId(value) {
  return value && value !== 'REPLACE_WITH_INSTANTDB_APP_ID'
}

export default function CSVUploader({ existingEntries = [], onUploadComplete }) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [errors, setErrors] = useState([])
  const [warnings, setWarnings] = useState([])
  const inputRef = useRef(null)

  const handleFile = async (file) => {
    if (!file) return
    if (!isConfiguredAppId(instantAppId)) {
      setErrors(['Missing InstantDB app ID. Set VITE_INSTANTDB_APP_ID in .env.'])
      return
    }

    setIsUploading(true)
    setStatusMessage('Reading CSV file...')
    setErrors([])
    setWarnings([])

    try {
      const text = await file.text()
      const parsed = parseCSV(text)

      if (parsed.errors.length > 0) {
        setErrors(parsed.errors)
        setIsUploading(false)
        return
      }

      setWarnings(parsed.warnings)
      setStatusMessage('Saving entries to InstantDB...')

      const deleteOps = existingEntries.map((entry) => db.tx.entries[entry.id].delete())

      const insertOps = parsed.entries.map((entry) =>
        db.tx.entries[id()].update({
          ...entry,
          uploadedAt: new Date().toISOString(),
        }),
      )

      await db.transact([...deleteOps, ...insertOps])

      setStatusMessage(`Uploaded ${parsed.entries.length} entries successfully.`)
      onUploadComplete?.({
        count: parsed.entries.length,
        warnings: parsed.warnings,
      })
    } catch (error) {
      setErrors([error?.message || 'Unable to upload CSV.'])
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div
        role="button"
        tabIndex={0}
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setIsDragging(false)
          handleFile(event.dataTransfer.files?.[0])
        }}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            inputRef.current?.click()
          }
        }}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition ${
          isDragging ? 'border-emerald-500 bg-emerald-50' : 'border-emerald-300 bg-white'
        }`}
      >
        <p className="text-sm text-emerald-800">Drag and drop CSV here, or click to choose a file</p>
        <p className="mt-2 text-xs text-emerald-700">
          Required columns: date, account, debit, credit, description
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <button
          type="button"
          className="rounded-md bg-emerald-700 px-4 py-2 font-medium text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : 'Select CSV file'}
        </button>
        <a
          href="/sample-transactions.csv"
          className="font-medium text-emerald-700 hover:text-emerald-600"
          download
        >
          Download demo CSV: Standard (24 rows)
        </a>
        <a href="/sample-clean-demo.csv" className="font-medium text-emerald-700 hover:text-emerald-600" download>
          Download demo CSV: Clean Dataset (30 rows)
        </a>
        <a
          href="/sample-fraud-heavy-demo.csv"
          className="font-medium text-rose-700 hover:text-rose-600"
          download
        >
          Download demo CSV: Fraud Heavy (32 rows)
        </a>
      </div>

      {statusMessage && <p className="text-sm text-emerald-800">{statusMessage}</p>}

      {warnings.length > 0 && (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          <p className="font-semibold">Warnings</p>
          <ul className="mt-1 list-disc pl-5">
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      {errors.length > 0 && (
        <div className="rounded-md border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800">
          <p className="font-semibold">Errors</p>
          <ul className="mt-1 list-disc pl-5">
            {errors.map((errorText) => (
              <li key={errorText}>{errorText}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
