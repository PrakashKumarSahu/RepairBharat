import React, { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import API from '../services/api'
import { ProviderDetailPage } from '../components/provider/ProviderDetailPage'

export default function ProviderDetail() {
  const { id } = useParams()
  const [provider, setProvider] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProvider = useCallback(() => {
    setLoading(true)
    setError(null)

    // Fetch provider detail and reviews in parallel
    Promise.all([
      API.get(`/providers/${id}`),
      API.get(`/providers/${id}/reviews`).catch(() => ({ data: { results: [] } })),
    ])
      .then(([providerRes, reviewsRes]) => {
        setProvider(providerRes.data)
        // Reviews endpoint returns paginated: { results: [...] }
        const reviewData = reviewsRes.data
        setReviews(Array.isArray(reviewData) ? reviewData : (reviewData.results || []))
      })
      .catch((err) => {
        setError(err.response?.data?.detail || err.message || 'Failed to load provider')
      })
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    fetchProvider()
  }, [fetchProvider])

  const phoneNumber = provider?.phone || provider?.phone_number || ''

  return (
    <ProviderDetailPage
      provider={loading ? null : provider}
      reviews={reviews}
      isLoading={loading}
      isError={!!error && !loading}
      error={error}
      onRetry={fetchProvider}
      phoneNumber={phoneNumber}
    />
  )
}
