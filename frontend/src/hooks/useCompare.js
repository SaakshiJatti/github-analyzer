import { useState } from 'react'
import { api } from '../api'

export function useCompare() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const compare = (user1, user2) => {
    setLoading(true)
    setError(null)
    setData(null)
    api.compare(user1, user2)
      .then(r => setData(r.data))
      .catch(e => setError(e.response?.data?.error || 'Failed to compare users'))
      .finally(() => setLoading(false))
  }

  return { data, loading, error, compare }
}