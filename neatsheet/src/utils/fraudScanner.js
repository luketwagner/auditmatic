function parseAmount(entry) {
  return Math.max(Math.abs(Number(entry.debit) || 0), Math.abs(Number(entry.credit) || 0))
}

function isRoundNumber(value) {
  if (!value) return false
  return value % 1000 === 0 || value % 10000 === 0
}

export function scanJournalEntryRisks(entries = []) {
  const duplicateCounter = new Map()

  entries.forEach((entry) => {
    const amount = parseAmount(entry)
    const key = `${entry.date}|${amount}|${(entry.description || '').trim().toLowerCase()}`
    duplicateCounter.set(key, (duplicateCounter.get(key) || 0) + 1)
  })

  return entries
    .map((entry, index) => {
      const debit = Number(entry.debit) || 0
      const credit = Number(entry.credit) || 0
      const amount = parseAmount(entry)
      const duplicateKey = `${entry.date}|${amount}|${(entry.description || '').trim().toLowerCase()}`
      const reasons = []

      if (isRoundNumber(debit) || isRoundNumber(credit)) {
        reasons.push('Round number transaction')
      }

      if (duplicateCounter.get(duplicateKey) > 1) {
        reasons.push('Duplicate transaction pattern')
      }

      if (amount > 10000) {
        reasons.push('Large transaction (over $10,000)')
      }

      if (reasons.length === 0) return null

      return {
        id: entry.id || `${entry.date}-${entry.account}-${index}`,
        entry,
        amount,
        reasons,
      }
    })
    .filter(Boolean)
}
