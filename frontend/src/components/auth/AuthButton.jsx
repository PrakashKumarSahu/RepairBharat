import React from 'react'

const VARIANTS = {
  primary:   'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm disabled:bg-blue-300',
  secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400 disabled:bg-gray-50 disabled:text-gray-400',
  danger:    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm disabled:bg-red-300',
  ghost:     'text-blue-600 hover:bg-blue-50 focus:ring-blue-400 disabled:text-gray-400',
}

/**
 * Reusable auth button with loading spinner and variant support.
 * Usage: <AuthButton loading={isSubmitting} loadingText="Saving…">Save</AuthButton>
 */
export default function AuthButton({
  children,
  loading = false,
  loadingText = 'Please wait…',
  variant = 'primary',
  fullWidth = true,
  className = '',
  ...rest
}) {
  return (
    <button
      disabled={loading || rest.disabled}
      className={`
        inline-flex items-center justify-center gap-2
        px-5 py-2.5 rounded-xl text-sm font-semibold
        transition-all duration-150
        active:scale-[0.98] disabled:active:scale-100
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:cursor-not-allowed
        ${VARIANTS[variant] ?? VARIANTS.primary}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...rest}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin h-4 w-4 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12" cy="12" r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span>{loadingText}</span>
        </>
      ) : children}
    </button>
  )
}
