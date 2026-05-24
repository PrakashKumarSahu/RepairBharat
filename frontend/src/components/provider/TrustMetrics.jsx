import React from 'react'
import { getTrustScoreInfo, getResponseTimeLabel } from '../../lib/utils'
import { TrendingUp, Users, Zap, Clock } from 'lucide-react'

export function TrustMetrics({ provider }) {
  const trustInfo = getTrustScoreInfo(provider.trust_score)
  const responseTimeInfo = getResponseTimeLabel(provider.average_response_time_minutes)
  const repeatCustomerRate =
    typeof provider.repeat_customer_rate === 'string'
      ? parseFloat(provider.repeat_customer_rate)
      : provider.repeat_customer_rate ?? provider.repeat_customer_percentage ?? 0

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Trust Metrics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">Trust Score</p>
              <p className={`text-3xl font-bold ${trustInfo.color}`}>{trustInfo.score}</p>
              <p className="text-xs text-gray-600 mt-1">{trustInfo.label}</p>
            </div>
            <div className="p-3 bg-white rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">Repeat Customers</p>
              <p className="text-3xl font-bold text-green-600">{repeatCustomerRate.toFixed(1)}%</p>
              <p className="text-xs text-gray-600 mt-1">Return customers</p>
            </div>
            <div className="p-3 bg-white rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">Avg Response Time</p>
              <p className="text-lg font-semibold text-gray-900">{provider.average_response_time_minutes} min</p>
              <p className="text-xs text-gray-600 mt-1">{responseTimeInfo.label}</p>
            </div>
            <div className="p-3 bg-white rounded-lg">
              <Clock className="w-5 h-5 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">Trust Summary</p>
              <p className="text-xs text-gray-600 mt-1">{trustInfo.label}</p>
            </div>
            <div className="p-3 bg-white rounded-lg">
              <Zap className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
