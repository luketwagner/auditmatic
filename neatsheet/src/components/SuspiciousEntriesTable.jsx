import { formatCurrency } from '../utils/accountingEngine'

export default function SuspiciousEntriesTable({ flagged = [] }) {
  return (
    <section className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-emerald-200">
      <h3 className="text-base font-semibold text-emerald-950">Suspicious Transactions</h3>
      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-emerald-700">
            <tr>
              <th className="px-2 py-2 font-medium">Date</th>
              <th className="px-2 py-2 font-medium">Account</th>
              <th className="px-2 py-2 font-medium">Amount</th>
              <th className="px-2 py-2 font-medium">Flags</th>
            </tr>
          </thead>
          <tbody>
            {flagged.map((item) => (
              <tr key={item.id} className="border-t border-emerald-100 align-top">
                <td className="px-2 py-2">{item.entry.date}</td>
                <td className="px-2 py-2">{item.entry.account}</td>
                <td className="px-2 py-2">{formatCurrency(item.amount)}</td>
                <td className="px-2 py-2">
                  <div className="flex flex-wrap gap-1">
                    {item.reasons.map((reason) => (
                      <span
                        key={`${item.id}-${reason}`}
                        className="rounded-full bg-rose-100 px-2 py-1 text-xs text-rose-700"
                      >
                        {reason}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {flagged.length === 0 && (
        <p className="mt-3 text-sm text-emerald-700">No suspicious entries found.</p>
      )}
    </section>
  )
}
