import React from 'react'
import { formatRating, getTrustScoreInfo } from '../../lib/utils'
import { MapPin, Phone, MessageCircle, CheckCircle } from 'lucide-react'

export function ProviderHeader({ provider, onCall, onWhatsApp, onCreateRequest, onNavigate }) {
  const trustScore = getTrustScoreInfo(provider.trust_score)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex gap-6 mb-6">
        <div className="flex-shrink-0">
          {provider.profile_image ? (
            <img
              src={provider.profile_image}
              alt={provider.shop_name}
              className="w-24 h-24 rounded-lg object-cover border border-gray-200"
            />
          ) : (
            <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
              {provider.shop_name?.charAt(0)?.toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{provider.shop_name}</h1>
              {provider.verified && <CheckCircle className="w-5 h-5 text-blue-600" fill="currentColor" />}
            </div>
            <p className="text-gray-600 text-sm">{provider.user?.first_name} {provider.user?.last_name}</p>
          </div>

          <div className="flex items-center gap-6 mb-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <span className="text-2xl font-bold text-gray-900">{formatRating(provider.avg_rating)}</span>
                <span className="ml-1 text-yellow-400">★</span>
              </div>
              <div className="text-sm text-gray-600">
                <p>{provider.review_count} reviews</p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{provider.address}</span>
            </div>

            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${provider.is_open ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm font-medium text-gray-700">{provider.is_open ? 'Open' : 'Closed'}</span>
            </div>
          </div>

          <div className="inline-block bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            <span className={`text-sm font-semibold ${trustScore.color}`}>Trust Score: {trustScore.score}/100</span>
          </div>
        </div>
      </div>

      <div className="hidden md:flex gap-3 pt-6 border-t border-gray-200">
        <button onClick={onCall} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
          <Phone className="w-4 h-4" /> Call
        </button>
        <button onClick={onWhatsApp} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
          <MessageCircle className="w-4 h-4" /> WhatsApp
        </button>
        <button onClick={onCreateRequest} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium">Create Request</button>
      </div>

      <div className="md:hidden mt-6 grid grid-cols-3 gap-2">
        <button onClick={onCall} className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"><Phone className="w-4 h-4" /></button>
        <button onClick={onWhatsApp} className="flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium"><MessageCircle className="w-4 h-4" /></button>
        <button onClick={onCreateRequest} className="flex items-center justify-center gap-1 px-3 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium">Request</button>
      </div>
    </div>
  )
}
