const CATEGORY_MAP = {
  // Assets
  cash: 'Assets',
  'accounts receivable': 'Assets',
  inventory: 'Assets',

  // Liabilities
  'accounts payable': 'Liabilities',
  'notes payable': 'Liabilities',

  // Equity
  'owner equity': 'Equity',
  'retained earnings': 'Equity',

  // Revenue
  revenue: 'Revenue',
  'sales revenue': 'Revenue',
  'service revenue': 'Revenue',

  // Expenses
  expense: 'Expenses',
  'rent expense': 'Expenses',
  'salary expense': 'Expenses',
  'utilities expense': 'Expenses',
}

function normalizeAccountName(account = '') {
  return account.trim().toLowerCase()
}

export function classifyAccount(account = '') {
  const normalized = normalizeAccountName(account)
  if (!normalized) return 'Other'

  if (CATEGORY_MAP[normalized]) {
    return CATEGORY_MAP[normalized]
  }

  if (normalized.includes('revenue')) return 'Revenue'
  if (normalized.includes('expense')) return 'Expenses'
  if (normalized.includes('cash')) return 'Assets'
  if (normalized.includes('receivable')) return 'Assets'
  if (normalized.includes('inventory')) return 'Assets'
  if (normalized.includes('payable')) return 'Liabilities'
  if (normalized.includes('equity')) return 'Equity'

  return 'Other'
}
