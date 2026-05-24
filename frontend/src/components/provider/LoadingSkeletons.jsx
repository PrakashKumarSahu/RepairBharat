import React from 'react'

export function ProviderHeaderSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6 animate-pulse">
      <div className="flex gap-6 mb-6">
        <div className="w-24 h-24 rounded-lg bg-gray-200 flex-shrink-0" />

        <div className="flex-1">
          <div className="h-8 bg-gray-200 rounded w-2/3 mb-3" />
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
          <div className="flex gap-6 mb-4">
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-4 bg-gray-200 rounded w-24" />
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-6 border-t border-gray-200">
        <div className="flex-1 h-12 bg-gray-200 rounded" />
        <div className="flex-1 h-12 bg-gray-200 rounded" />
        <div className="flex-1 h-12 bg-gray-200 rounded" />
      </div>
    </div>
  )
}

export function ProviderOverviewSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
      <div className="space-y-2 mb-6">
        <div className="h-4 bg-gray-200 rounded" />
        <div className="h-4 bg-gray-200 rounded" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 bg-gray-100 rounded-lg">
            <div className="h-4 bg-gray-200 rounded mb-2" />
            <div className="h-6 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function TrustMetricsSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 bg-gray-100 rounded-lg">
            <div className="h-4 bg-gray-200 rounded mb-2" />
            <div className="h-8 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function ServicesListSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 bg-gray-100 rounded-lg">
            <div className="h-4 bg-gray-200 rounded mb-2" />
            <div className="flex gap-4">
              <div className="h-4 bg-gray-200 rounded w-24" />
              <div className="h-4 bg-gray-200 rounded w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ReviewsSectionSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 border border-gray-200 rounded-lg">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-24 mb-2" />
                <div className="space-y-1">
                  <div className="h-3 bg-gray-200 rounded" />
                  <div className="h-3 bg-gray-200 rounded w-5/6" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ProviderMapSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
      <div className="w-full h-64 bg-gray-200 rounded-lg mb-4" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-10 bg-gray-200 rounded" />
        <div className="h-10 bg-gray-200 rounded" />
      </div>
    </div>
  )
}
