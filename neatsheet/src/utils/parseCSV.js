const REQUIRED_COLUMNS = ['date', 'account', 'debit', 'credit', 'description']

function toNumber(value) {
  if (value === undefined || value === null || value === '') return 0

  const cleaned = String(value).replace(/[$,]/g, '').trim()
  const parsed = Number(cleaned)
  return Number.isFinite(parsed) ? parsed : NaN
}

function parseHeaders(headerLine) {
  return headerLine
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
}

export function parseCSV(csvText) {
  if (!csvText || !csvText.trim()) {
    return { entries: [], errors: ['CSV file is empty.'], warnings: [] }
  }

  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length < 2) {
    return { entries: [], errors: ['CSV file must include headers and at least one row.'], warnings: [] }
  }

  const headers = parseHeaders(lines[0])
  const headerMap = headers.reduce((acc, key, index) => {
    acc[key] = index
    return acc
  }, {})

  const missingColumns = REQUIRED_COLUMNS.filter((column) => headerMap[column] === undefined)
  if (missingColumns.length > 0) {
    return {
      entries: [],
      errors: [`Missing required column(s): ${missingColumns.join(', ')}`],
      warnings: [],
    }
  }

  const entries = []
  const warnings = []

  for (let i = 1; i < lines.length; i += 1) {
    const rowIndex = i + 1
    const cells = lines[i].split(',').map((value) => value.trim())

    const date = cells[headerMap.date]
    const account = cells[headerMap.account]
    const rawDebit = cells[headerMap.debit]
    const rawCredit = cells[headerMap.credit]
    const description = cells[headerMap.description]

    if (!date || !account || !description) {
      warnings.push(`Skipped row ${rowIndex}: missing date, account, or description.`)
      continue
    }

    const parsedDate = new Date(date)
    if (Number.isNaN(parsedDate.getTime())) {
      warnings.push(`Skipped row ${rowIndex}: invalid date "${date}".`)
      continue
    }

    const debit = toNumber(rawDebit)
    const credit = toNumber(rawCredit)
    if (Number.isNaN(debit) || Number.isNaN(credit)) {
      warnings.push(`Skipped row ${rowIndex}: invalid debit/credit amount.`)
      continue
    }

    entries.push({
      date,
      account,
      debit,
      credit,
      description,
    })
  }

  return {
    entries,
    errors: [],
    warnings,
  }
}
