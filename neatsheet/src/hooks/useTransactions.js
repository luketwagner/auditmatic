import { db } from '../lib/instantdb'

export function useEntries() {
  const { isLoading, error, data } = db.useQuery({
    entries: {},
    uploads: {},
  })

  return {
    loading: isLoading,
    error,
    entries: data?.entries || [],
    uploads: data?.uploads || [],
  }
}

export const useTransactions = useEntries
