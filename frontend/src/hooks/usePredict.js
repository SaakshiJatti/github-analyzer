import { useState, useEffect } from 'react'
import { api } from '../api'

export function usePredict(username) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    if (!username) return
    setLoading(true)
    setError(null)
    setData(null)
    api.predict(username)
      .then(r => setData(r.data))
      .catch(e => setError(e.response?.data?.error || 'Failed'))
      .finally(() => setLoading(false))
  }, [username])

  return { data, loading, error }
}