import React from 'react'
import { Briefcase, Medal, Wrench } from 'lucide-react'

export function ProviderOverview({ provider }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">About</h2>
        <p className="text-gray-700 leading-relaxed">{provider.bio}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="p-3 bg-blue-50 rounded-lg">
            <Medal className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Experience</p>
            <p className="text-lg font-semibold text-gray-900">{provider.years_of_experience} years</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-3 bg-purple-50 rounded-lg">
            <Wrench className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Specialization</p>
            <p className="text-lg font-semibold text-gray-900">{provider.specialization}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-3 bg-green-50 rounded-lg">
            <Briefcase className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Jobs Completed</p>
            <p className="text-lg font-semibold text-gray-900">{provider.jobs_completed}</p>
          </div>
        </div>
      </div>

      {provider.supported_brands && provider.supported_brands.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Brands Supported</h3>
          <div className="flex flex-wrap gap-2">
            {provider.supported_brands.map((brand, index) => (
              <span key={index} className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium border border-gray-200">{brand}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
