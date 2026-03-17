import { formatCurrency } from '../utils/accountingEngine'

export default function MetricCard({ label, value }) {
  return (
    <article className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-emerald-200">
      <p className="text-xs uppercase tracking-wide text-emerald-700">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-emerald-950">{formatCurrency(value)}</p>
    </article>
  )
}
