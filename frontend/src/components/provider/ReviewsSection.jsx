import React from 'react'
import { formatTimeAgo } from '../../lib/utils'
import { Star } from 'lucide-react'

export function ReviewsSection({ reviews }) {
  if (!reviews || reviews.length === 0) return null

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Reviews</h2>
      <div className="space-y-4">
        {reviews.map((r) => (
          <div key={r.id} className="rounded-lg border border-gray-100 p-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-100" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="font-medium text-gray-900">{r.user_name || r.user}</div>
                    <div className="flex items-center text-yellow-400">
                      <Star className="w-4 h-4" />
                      <span className="ml-1 text-sm font-medium">{Number(r.rating).toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">{formatTimeAgo(r.created_at)}</div>
                </div>
                <p className="mt-2 text-sm text-gray-700">{r.comment}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
