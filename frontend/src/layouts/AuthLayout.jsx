import React from 'react'

/**
 * Full-page layout wrapper for all authentication pages.
 * Provides a gradient background with subtle decorative blobs,
 * centers content vertically, and renders a footer.
 */
export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Decorative background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-52 -right-40 w-[32rem] h-[32rem] rounded-full bg-blue-100/60 blur-3xl" />
        <div className="absolute -bottom-52 -left-40 w-[32rem] h-[32rem] rounded-full bg-indigo-100/60 blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-4 py-12">
        {children}
      </div>

      {/* Footer */}
      <div className="relative py-4 text-center text-xs text-gray-400 select-none">
        © {new Date().getFullYear()} RepairBharat. All rights reserved.
      </div>
    </div>
  )
}
