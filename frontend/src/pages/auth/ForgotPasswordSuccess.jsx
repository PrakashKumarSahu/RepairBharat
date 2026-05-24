import React from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '../../layouts/AuthLayout'
import AuthCard from '../../components/auth/AuthCard'

export default function ForgotPasswordSuccess() {
  return (
    <AuthLayout>
      <AuthCard showBrand={true}>
        <div className="text-center py-4">
          {/* Icon */}
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <span className="text-3xl">📬</span>
          </div>

          <h1 className="text-[1.375rem] font-bold text-gray-900 mb-2">
            Check your inbox
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed mb-6">
            If that email address is in our system, we've sent you a link to
            reset your password. Check your spam folder if you don't see it.
          </p>

          {/* Tip box */}
          <div className="flex items-start gap-2.5 text-left px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700 mb-6">
            <span className="shrink-0 mt-0.5">💡</span>
            <span>
              The reset link expires in <strong>24 hours</strong>. If it expires,
              request a new one.
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <Link
              to="/forgot-password"
              className="w-full inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Resend link
            </Link>
            <Link
              to="/login"
              className="text-sm text-gray-500 hover:text-blue-600 transition-colors py-1"
            >
              ← Back to sign in
            </Link>
          </div>
        </div>
      </AuthCard>
    </AuthLayout>
  )
}
