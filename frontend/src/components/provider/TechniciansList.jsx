import React, { useState } from 'react'
import { UserRound, Wrench, Star, CheckCircle2, Clock } from 'lucide-react'

export function TechniciansList({ technicians }) {
  const [expandedId, setExpandedId] = useState(null)

  if (!technicians || technicians.length === 0) {
    return null
  }

  return (
    <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Technicians Working Here</h2>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {technicians.map((technician) => (
          <div
            key={technician.id}
            className="cursor-pointer rounded-lg border border-gray-200 bg-gray-50 p-4 transition-all hover:border-blue-300 hover:bg-blue-50"
            onClick={() => setExpandedId(expandedId === technician.id ? null : technician.id)}
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                {technician.profile_image ? (
                  <img
                    src={technician.profile_image}
                    alt={technician.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <UserRound className="h-6 w-6" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{technician.name}</h3>
                    <div className="mt-1 flex items-center gap-1 text-sm text-gray-600">
                      <Wrench className="h-3.5 w-3.5" />
                      <span>{technician.specialization || 'General repair'}</span>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      technician.is_available
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {technician.is_available ? 'Available' : 'Unavailable'}
                  </span>
                </div>

                <p className="text-sm text-gray-600">
                  {technician.years_of_experience} years experience
                </p>

                {(technician.avg_rating || technician.trust_score || technician.jobs_completed) && (
                  <div className="mt-3 flex gap-3">
                    {technician.avg_rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-medium text-gray-700">
                          {Number(technician.avg_rating).toFixed(1)}
                        </span>
                      </div>
                    )}
                    {technician.jobs_completed ? (
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                        <span className="text-xs font-medium text-gray-700">
                          {technician.jobs_completed} jobs
                        </span>
                      </div>
                    ) : null}
                    {technician.trust_score && (
                      <div className="flex items-center gap-1">
                        <div className="relative h-3.5 w-8 rounded-full bg-gray-200">
                          <div
                            className="h-3.5 rounded-full bg-blue-500"
                            style={{
                              width: `${Math.min((Number(technician.trust_score) / 100) * 100, 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-700">
                          {Number(technician.trust_score).toFixed(0)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {expandedId === technician.id && (
              <div className="mt-4 space-y-3 border-t border-gray-200 pt-4">
                {technician.avg_rating && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Average Rating</span>
                    <span className="font-medium text-gray-900">{Number(technician.avg_rating).toFixed(2)}/5.0</span>
                  </div>
                )}
                {technician.review_count !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Reviews</span>
                    <span className="font-medium text-gray-900">{technician.review_count}</span>
                  </div>
                )}
                {technician.jobs_completed !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Jobs Completed</span>
                    <span className="font-medium text-gray-900">{technician.jobs_completed}</span>
                  </div>
                )}
                {technician.repeat_customer_rate !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Repeat Customer Rate</span>
                    <span className="font-medium text-gray-900">{Number(technician.repeat_customer_rate).toFixed(1)}%</span>
                  </div>
                )}
                {technician.trust_score !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Trust Score</span>
                    <span className="font-medium text-gray-900">{Number(technician.trust_score).toFixed(2)}/100</span>
                  </div>
                )}
                {technician.average_response_time_minutes !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Avg Response Time</span>
                    <span className="font-medium text-gray-900">{technician.average_response_time_minutes} min</span>
                  </div>
                )}

                {technician.services && technician.services.length > 0 && (
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <h4 className="mb-2 text-sm font-medium text-gray-900">Services Offered</h4>
                    <div className="space-y-2">
                      {technician.services.map((service) => (
                        <div key={service.id} className="rounded bg-white p-2 text-xs text-gray-700">
                          <div className="font-medium">{service.name}</div>
                          {service.estimated_price && <div className="text-gray-600">₹{service.estimated_price}</div>}
                          {service.duration_minutes && (
                            <div className="flex items-center gap-1 text-gray-600">
                              <Clock className="h-3 w-3" />
                              <span>{service.duration_minutes} min</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
