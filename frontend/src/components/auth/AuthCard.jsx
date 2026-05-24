import React from 'react'
import { Link } from 'react-router-dom'

/**
 * Auth card container: brand header + title/subtitle + card body + optional back link.
 * Usage:
 *   <AuthCard title="Sign in" subtitle="Welcome back" backTo="/register" backLabel="Create account">
 *     <form>…</form>
 *   </AuthCard>
 */
export default function AuthCard({
  title,
  subtitle,
  children,
  backTo,
  backLabel = 'Go back',
  showBrand = true,
}) {
  return (
    <div className="w-full max-w-md">
      {/* Brand */}
      {showBrand && (
        <div className="text-center mb-7">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <span className="text-3xl transition-transform duration-300 group-hover:rotate-12 inline-block">
              🔧
            </span>
            <span className="text-xl font-bold text-gray-900 tracking-tight">
              Repair<span className="text-blue-600">Bharat</span>
            </span>
          </Link>
        </div>
      )}

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Header */}
        {(title || subtitle) && (
          <div className="px-8 pt-7 pb-5">
            {title && (
              <h1 className="text-[1.375rem] font-bold text-gray-900 leading-snug">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {(title || subtitle) && <div className="border-t border-gray-100" />}

        {/* Body */}
        <div className="px-8 py-7">{children}</div>
      </div>

      {/* Back link */}
      {backTo && (
        <div className="text-center mt-5">
          <Link
            to={backTo}
            className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
          >
            ← {backLabel}
          </Link>
        </div>
      )}
    </div>
  )
}
