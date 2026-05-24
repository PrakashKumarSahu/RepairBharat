import React from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '../../layouts/AuthLayout'
import AuthCard from '../../components/auth/AuthCard'

export default function ChangePasswordSuccess() {
  return (
    <AuthLayout>
      <AuthCard showBrand={true}>
        <div className="text-center py-4">
          {/* Success icon */}
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5 border-2 border-green-200">
            <span className="text-3xl">🔐</span>
          </div>

          <h1 className="text-[1.375rem] font-bold text-gray-900 mb-2">
            Password updated!
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed mb-6">
            Your password has been changed successfully. For security, you may
            want to sign out of other devices.
          </p>

          <div className="flex flex-col gap-2">
            <Link
              to="/"
              className="w-full inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              Back to dashboard
            </Link>
            <Link
              to="/logout"
              className="w-full inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Sign out all sessions
            </Link>
          </div>
        </div>
      </AuthCard>
    </AuthLayout>
  )
}
