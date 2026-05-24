import React, { useEffect, useState } from 'react'
import API from '../services/api'
import { Link } from 'react-router-dom'

export default function Providers() {
  const [providers, setProviders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    API.get('/providers')
      .then(res => {
        if (mounted) {
          // Handle both plain array and paginated {results:[]} responses
          const data = res.data
          setProviders(Array.isArray(data) ? data : (data.results || []))
        }
      })
      .catch(err => setError(err.response?.data?.detail || err.message || 'Failed to load providers'))
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-6">Providers</h1>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-4 border rounded-lg animate-pulse bg-white">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Providers</h1>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          Error: {error}
        </div>
      </div>
    )
  }

  if (providers.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Providers</h1>
        <p className="text-gray-500">No providers found.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Providers</h1>
      <ul className="space-y-3">
        {providers.map(p => (
          <li key={p.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all">
            <Link to={`/providers/${p.id}`} className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900 text-base">
                    {p.shop_name || p.name || `Provider ${p.id}`}
                  </span>
                  {p.verified && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                      Verified
                    </span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.is_open ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {p.is_open ? 'Open' : 'Closed'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 truncate">{p.address}</p>
              </div>
              <div className="flex-shrink-0 text-right">
                {p.avg_rating != null && (
                  <div className="text-sm font-semibold text-gray-800">
                    ★ {Number(p.avg_rating).toFixed(1)}
                    <span className="font-normal text-gray-500 ml-1">({p.review_count || 0})</span>
                  </div>
                )}
                {p.trust_score != null && (
                  <div className="text-xs text-gray-500 mt-0.5">
                    Trust: {Number(p.trust_score).toFixed(0)}/100
                  </div>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
