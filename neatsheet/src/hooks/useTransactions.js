import { db } from '../lib/instantdb'

export function useEntries() {
  const { isLoading, error, data } = db.useQuery({
    entries: {},
  })

  return {
    loading: isLoading,
    error,
    entries: data?.entries || [],
  }
}

export const useTransactions = useEntries
