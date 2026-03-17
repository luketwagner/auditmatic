import { useMemo } from 'react'
import { useEntries } from '../hooks/useTransactions'
import { buildFinancialStatements, formatCurrency } from '../utils/accountingEngine'

function StatementLine({ label, amount, isTotal = false }) {
  return (
    <div
      className={`flex items-center justify-between py-1 text-sm ${
        isTotal ? 'mt-1 border-t border-emerald-300 pt-2 font-semibold text-emerald-950' : 'text-emerald-900'
      }`}
    >
      <span>{label}</span>
      <span>{formatCurrency(amount)}</span>
    </div>
  )
}

export default function StatementsPage() {
  const { entries, loading, error } = useEntries()
  const statements = useMemo(() => buildFinancialStatements(entries), [entries])

  return (
    <div className="space-y-6">
      <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-emerald-200">
        <h1 className="text-2xl font-bold text-emerald-950">Financial Statements</h1>
        <p className="mt-2 text-sm text-emerald-800">
          Generated directly from InstantDB journal entries and automatic account classification.
        </p>
      </section>

      {loading && <p className="text-sm text-emerald-800">Loading entries...</p>}
      {error && <p className="text-sm text-rose-700">Failed to load entries: {error.message}</p>}

      <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-emerald-200">
        <h2 className="text-lg font-semibold text-emerald-950">Income Statement</h2>
        <p className="mt-1 text-xs text-emerald-700">For the period presented</p>
        <div className="mt-4 space-y-1">
          {statements.incomeStatement.revenues.map((row) => (
            <StatementLine key={`rev-${row.account}`} label={row.account} amount={row.amount} />
          ))}
          <StatementLine
            label="Total Revenue"
            amount={statements.incomeStatement.totalRevenue}
            isTotal
          />
          {statements.incomeStatement.expenses.map((row) => (
            <StatementLine key={`exp-${row.account}`} label={row.account} amount={row.amount} />
          ))}
          <StatementLine
            label="Total Expenses"
            amount={statements.incomeStatement.totalExpenses}
            isTotal
          />
          <StatementLine label="Net Income" amount={statements.incomeStatement.netIncome} isTotal />
        </div>
      </section>

      <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-emerald-200">
        <h2 className="text-lg font-semibold text-emerald-950">Balance Sheet</h2>
        <p className="mt-1 text-xs text-emerald-700">As of report date</p>
        <div className="mt-4 grid gap-6 lg:grid-cols-3">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-800">Assets</h3>
            <div className="mt-2">
              {statements.balanceSheet.assets.map((row) => (
                <StatementLine key={`asset-${row.account}`} label={row.account} amount={row.amount} />
              ))}
              <StatementLine label="Total Assets" amount={statements.balanceSheet.totalAssets} isTotal />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-800">Liabilities</h3>
            <div className="mt-2">
              {statements.balanceSheet.liabilities.map((row) => (
                <StatementLine key={`liab-${row.account}`} label={row.account} amount={row.amount} />
              ))}
              <StatementLine
                label="Total Liabilities"
                amount={statements.balanceSheet.totalLiabilities}
                isTotal
              />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-800">Equity</h3>
            <div className="mt-2">
              {statements.balanceSheet.equityAccounts.map((row) => (
                <StatementLine key={`eq-${row.account}`} label={row.account} amount={row.amount} />
              ))}
              <StatementLine label="Total Equity" amount={statements.balanceSheet.totalEquity} isTotal />
            </div>
          </div>
        </div>
        <p
          className={`mt-4 text-sm font-semibold ${
            statements.balanceSheet.isBalanced ? 'text-emerald-700' : 'text-rose-700'
          }`}
        >
          Accounting Equation: {formatCurrency(statements.balanceSheet.totalAssets)} ={' '}
          {formatCurrency(statements.balanceSheet.totalLiabilities + statements.balanceSheet.totalEquity)} (
          {statements.balanceSheet.isBalanced ? 'Balanced' : 'Not Balanced'})
        </p>
      </section>

      <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-emerald-200">
        <h2 className="text-lg font-semibold text-emerald-950">Statement of Cash Flows</h2>
        <p className="mt-1 text-xs text-emerald-700">Indirect method</p>
        <div className="mt-4 space-y-1">
          <StatementLine label="Net Income" amount={statements.cashFlowStatement.netIncome} />
          {statements.cashFlowStatement.operatingAdjustments.map((row) => (
            <StatementLine key={row.label} label={row.label} amount={row.amount} />
          ))}
          <StatementLine
            label="Net Cash from Operating Activities"
            amount={statements.cashFlowStatement.netCashFromOperating}
            isTotal
          />
          <StatementLine
            label="Net Cash from Investing Activities"
            amount={statements.cashFlowStatement.netCashFromInvesting}
          />
          <StatementLine
            label="Net Cash from Financing Activities"
            amount={statements.cashFlowStatement.netCashFromFinancing}
          />
          <StatementLine
            label="Net Change in Cash"
            amount={statements.cashFlowStatement.netChangeInCash}
            isTotal
          />
        </div>
      </section>

      <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-emerald-200">
        <h2 className="text-lg font-semibold text-emerald-950">
          Statement of Stockholders&apos; Equity
        </h2>
        <div className="mt-4 space-y-1">
          <StatementLine
            label="Beginning Stockholders' Equity"
            amount={statements.stockholdersEquity.beginningEquity}
          />
          <StatementLine
            label="Additional Investments"
            amount={statements.stockholdersEquity.additionalInvestments}
          />
          <StatementLine label="Net Income" amount={statements.stockholdersEquity.netIncome} />
          <StatementLine
            label="Less: Draws / Dividends"
            amount={-statements.stockholdersEquity.draws}
          />
          <StatementLine
            label="Ending Stockholders' Equity"
            amount={statements.stockholdersEquity.endingEquity}
            isTotal
          />
        </div>
      </section>
    </div>
  )
}
