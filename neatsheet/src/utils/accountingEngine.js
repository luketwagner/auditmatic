import { classifyAccount } from './accountClassification'

function roundCurrency(value) {
  return Number((value || 0).toFixed(2))
}

function naturalBalanceForCategory(category, debit, credit) {
  if (category === 'Assets' || category === 'Expenses' || category === 'Other') {
    return debit - credit
  }
  return credit - debit
}

function toAccountSummaries(entries = []) {
  const map = new Map()

  entries.forEach((entry) => {
    const account = (entry.account || '').trim()
    if (!account) return

    const category = classifyAccount(account)
    const debit = Number(entry.debit) || 0
    const credit = Number(entry.credit) || 0
    const existing = map.get(account) || {
      account,
      category,
      totalDebit: 0,
      totalCredit: 0,
      balance: 0,
    }

    existing.totalDebit += debit
    existing.totalCredit += credit
    existing.balance = naturalBalanceForCategory(
      category,
      existing.totalDebit,
      existing.totalCredit,
    )
    map.set(account, existing)
  })

  return Array.from(map.values())
    .map((item) => ({
      ...item,
      totalDebit: roundCurrency(item.totalDebit),
      totalCredit: roundCurrency(item.totalCredit),
      balance: roundCurrency(item.balance),
    }))
    .sort((a, b) => a.account.localeCompare(b.account))
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value || 0)
}

function includeRowAmount(account) {
  return roundCurrency(Math.max(account.balance, 0))
}

function amountForAccounts(accounts = []) {
  return roundCurrency(accounts.reduce((sum, account) => sum + includeRowAmount(account), 0))
}

export function buildFinancialStatements(entries = []) {
  const accounts = toAccountSummaries(entries)

  const revenueAccounts = accounts
    .filter((account) => account.category === 'Revenue')
    .map((account) => ({ ...account, amount: includeRowAmount(account) }))
  const expenseAccounts = accounts
    .filter((account) => account.category === 'Expenses')
    .map((account) => ({ ...account, amount: includeRowAmount(account) }))

  const assetAccounts = accounts
    .filter((account) => account.category === 'Assets')
    .map((account) => ({ ...account, amount: includeRowAmount(account) }))
  const liabilityAccounts = accounts
    .filter((account) => account.category === 'Liabilities')
    .map((account) => ({ ...account, amount: includeRowAmount(account) }))

  const rawEquityAccounts = accounts
    .filter((account) => account.category === 'Equity')
    .map((account) => ({ ...account, amount: includeRowAmount(account) }))
  const drawAccounts = rawEquityAccounts.filter((account) =>
    /draw|dividend/i.test(account.account),
  )
  const contributedCapitalAccounts = rawEquityAccounts.filter(
    (account) => !/draw|dividend|retained earnings/i.test(account.account),
  )

  const totalRevenue = amountForAccounts(revenueAccounts)
  const totalExpenses = amountForAccounts(expenseAccounts)
  const netIncome = roundCurrency(totalRevenue - totalExpenses)

  const draws = amountForAccounts(drawAccounts)
  const retainedEarnings = roundCurrency(netIncome - draws)

  const equityAccounts = [
    ...contributedCapitalAccounts,
    { account: 'Retained Earnings', amount: retainedEarnings, category: 'Equity' },
  ]

  const totalAssets = amountForAccounts(assetAccounts)
  const totalLiabilities = amountForAccounts(liabilityAccounts)
  const totalEquity = amountForAccounts(equityAccounts)
  const isBalanced = Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01

  const cashAccounts = assetAccounts.filter((account) => /cash/i.test(account.account))
  const cashBalance = amountForAccounts(cashAccounts)
  const receivables = assetAccounts.filter((account) => /receivable/i.test(account.account))
  const inventory = assetAccounts.filter((account) => /inventory/i.test(account.account))
  const payables = liabilityAccounts.filter((account) => /payable/i.test(account.account))

  const operatingAdjustments = [
    {
      label: 'Increase in Accounts Receivable',
      amount: roundCurrency(-amountForAccounts(receivables)),
    },
    {
      label: 'Increase in Inventory',
      amount: roundCurrency(-amountForAccounts(inventory)),
    },
    {
      label: 'Increase in Accounts Payable',
      amount: roundCurrency(amountForAccounts(payables)),
    },
  ]
  const totalOperatingAdjustments = roundCurrency(
    operatingAdjustments.reduce((sum, row) => sum + row.amount, 0),
  )
  const netCashFromOperating = roundCurrency(netIncome + totalOperatingAdjustments)

  const investingAccounts = assetAccounts.filter((account) =>
    /equipment|building|vehicle|furniture|machine/i.test(account.account),
  )
  const netCashFromInvesting = roundCurrency(-amountForAccounts(investingAccounts))
  const netCashFromFinancing = roundCurrency(
    cashBalance - netCashFromOperating - netCashFromInvesting,
  )

  return {
    accountSummaries: accounts,
    incomeStatement: {
      revenues: revenueAccounts,
      expenses: expenseAccounts,
      totalRevenue,
      totalExpenses,
      netIncome,
    },
    balanceSheet: {
      assets: assetAccounts,
      liabilities: liabilityAccounts,
      equityAccounts,
      totalAssets,
      totalLiabilities,
      totalEquity,
      isBalanced,
    },
    stockholdersEquity: {
      beginningEquity: 0,
      additionalInvestments: amountForAccounts(contributedCapitalAccounts),
      netIncome,
      draws,
      endingEquity: totalEquity,
    },
    cashFlowStatement: {
      netIncome,
      operatingAdjustments,
      netCashFromOperating,
      netCashFromInvesting,
      netCashFromFinancing,
      netChangeInCash: cashBalance,
    },
    dashboard: {
      totalRevenue,
      totalExpenses,
      netIncome,
      totalAssets,
    },
  }
}
