import { useState } from 'react'
import { api } from '../api'

export function useAI() {
  const [results,  setResults]  = useState({})
  const [loading,  setLoading]  = useState({})

  const fetch = (type, username) => {
    setLoading(p => ({ ...p, [type]: true }))
    api[`ai_${type}`](username)
      .then(r => setResults(p => ({ ...p, [type]: r.data })))
      .catch(e => setResults(p => ({ ...p, [type]: { error: e.response?.data?.error || 'Failed' } })))
      .finally(() => setLoading(p => ({ ...p, [type]: false })))
  }

  return { results, loading, fetch }
}