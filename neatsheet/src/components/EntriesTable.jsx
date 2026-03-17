import { formatCurrency } from '../utils/accountingEngine'

export default function EntriesTable({ rows = [], title }) {
  return (
    <section className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-emerald-200">
      <h3 className="text-base font-semibold text-emerald-950">{title}</h3>
      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-emerald-700">
            <tr>
              <th className="px-2 py-2 font-medium">Date</th>
              <th className="px-2 py-2 font-medium">Account</th>
              <th className="px-2 py-2 font-medium">Description</th>
              <th className="px-2 py-2 text-right font-medium">Debit</th>
              <th className="px-2 py-2 text-right font-medium">Credit</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-emerald-100">
                <td className="px-2 py-2">{row.date}</td>
                <td className="px-2 py-2">{row.account}</td>
                <td className="px-2 py-2">{row.description}</td>
                <td className="px-2 py-2 text-right">{formatCurrency(row.debit)}</td>
                <td className="px-2 py-2 text-right">{formatCurrency(row.credit)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && <p className="mt-3 text-sm text-emerald-700">No entries available.</p>}
    </section>
  )
}
