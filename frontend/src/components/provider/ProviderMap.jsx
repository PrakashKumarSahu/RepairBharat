import React from 'react'
import { generateMapsLink } from '../../lib/utils'
import { MapPin } from 'lucide-react'

export function ProviderMap({ provider, address, shopName, onNavigate }) {
  const lat = provider?.lat
  const lng = provider?.lng
  const addr = address || provider?.address
  const link = generateMapsLink({ lat, lng, address: addr })

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Location</h2>
      <div className="flex items-center gap-3">
        <MapPin className="w-5 h-5 text-gray-600" />
        <div>
          <div className="text-sm text-gray-700">{addr}</div>
          <div className="flex gap-3 mt-1">
            <a href={link} target="_blank" rel="noreferrer" className="text-sm text-blue-600">Open in Maps</a>
            {onNavigate && (
              <button onClick={onNavigate} className="text-sm text-gray-600">Directions</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
