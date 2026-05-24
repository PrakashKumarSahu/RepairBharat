import React from 'react'
import { formatCurrency, formatDuration } from '../../lib/utils'
import { Tag, Clock } from 'lucide-react'

export function ServicesList({ services }) {
  if (!services || services.length === 0) return null

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Services Offered</h2>
      <div className="grid grid-cols-1 gap-3">
        {services.map((s) => (
          <div key={s.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
            <div>
              <div className="font-medium text-gray-900">{s.name}</div>
              {s.description && <div className="text-sm text-gray-600">{s.description}</div>}
            </div>
            <div className="flex items-center gap-3">
              {s.duration_minutes && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{formatDuration(s.duration_minutes)}</span>
                </div>
              )}
              <div className="text-sm font-semibold text-gray-900">{formatCurrency(s.estimated_price)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
