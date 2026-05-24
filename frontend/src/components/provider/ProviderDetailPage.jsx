import React, { useState, useCallback } from 'react'
import { generateCallLink, generateWhatsAppLink, generateMapsLink } from '../../lib/utils'

import { ProviderHeader } from './ProviderHeader.jsx'
import { ProviderOverview } from './ProviderOverview.jsx'
import { TrustMetrics } from './TrustMetrics.jsx'
import { ServicesList } from './ServicesList.jsx'
import { ReviewsSection } from './ReviewsSection.jsx'
import { ContactActions } from './ContactActions.jsx'
import { ProviderMap } from './ProviderMap.jsx'
import { TechniciansList } from './TechniciansList.jsx'

import {
  ProviderHeaderSkeleton,
  ProviderOverviewSkeleton,
  TrustMetricsSkeleton,
  ServicesListSkeleton,
  ReviewsSectionSkeleton,
  ProviderMapSkeleton,
} from './LoadingSkeletons.jsx'

import { ErrorPage } from './ErrorStates.jsx'

export function ProviderDetailPage({ provider, reviews, totalReviews, currentPage, totalPages, ratingDistribution, isLoading = false, isError = false, error, onPageChange, onRetry, phoneNumber }) {
  const [, setSelectedService] = useState(null)

  const handleCall = useCallback(() => {
    if (phoneNumber) window.location.href = generateCallLink(phoneNumber)
  }, [phoneNumber])

  const handleWhatsApp = useCallback(() => {
    if (phoneNumber) window.open(generateWhatsAppLink(phoneNumber), '_blank')
  }, [phoneNumber])

  const handleCreateRequest = useCallback(() => {
    if (!provider) return
    console.log('Create repair request for:', provider.id)
  }, [provider])

  const handleNavigate = useCallback(() => {
    if (!provider) return
    const mapsLink = generateMapsLink({ address: provider.address, lat: provider.lat, lng: provider.lng })
    window.open(mapsLink, '_blank')
  }, [provider])

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <ErrorPage error={error || 'Failed to load provider'} onRetry={onRetry} />
      </div>
    )
  }

  if (!provider) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <ProviderHeaderSkeleton />
        <ProviderOverviewSkeleton />
        <TrustMetricsSkeleton />
        <ServicesListSkeleton />
        <ReviewsSectionSkeleton />
        <ProviderMapSkeleton />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {isLoading ? <ProviderHeaderSkeleton /> : <ProviderHeader provider={provider} onCall={handleCall} onWhatsApp={handleWhatsApp} onCreateRequest={handleCreateRequest} onNavigate={handleNavigate} />}

      {isLoading ? <ProviderOverviewSkeleton /> : <ProviderOverview provider={provider} />}

      {!isLoading && <TechniciansList technicians={provider.technicians} />}

      {isLoading ? <TrustMetricsSkeleton /> : <TrustMetrics provider={provider} />}

      {isLoading ? <ServicesListSkeleton /> : <ServicesList services={provider.services} />}

      {isLoading ? <ReviewsSectionSkeleton /> : <ReviewsSection reviews={reviews} />}

      {isLoading ? <ProviderMapSkeleton /> : <ProviderMap provider={provider} onNavigate={handleNavigate} />}

      <ContactActions onCall={handleCall} onWhatsApp={handleWhatsApp} onCreateRequest={handleCreateRequest} phoneNumber={phoneNumber} isLoading={isLoading} />
    </div>
  )
}
