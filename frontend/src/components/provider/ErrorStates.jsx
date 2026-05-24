import React from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, RefreshCw } from 'lucide-react'

export function ErrorPage({ error, onRetry, title = 'Error' }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
      <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-600 mb-6">{error}</p>
      {onRetry && (
        <button onClick={onRetry} className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  )
}

export function NotFoundPage() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
      <AlertCircle className="w-16 h-16 text-orange-600 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Provider Not Found</h2>
      <p className="text-gray-600 mb-6">The provider you are looking for does not exist or has been removed.</p>
      <Link to="/providers" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">View All Providers</Link>
    </div>
  )
}

export function EmptyReviewsState() {
  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
      <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
      <p className="text-gray-600">This provider has not received any reviews yet.</p>
    </div>
  )
}

export function EmptyServicesState() {
  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
      <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Services Available</h3>
      <p className="text-gray-600">No services have been added by this provider yet.</p>
    </div>
  )
}
