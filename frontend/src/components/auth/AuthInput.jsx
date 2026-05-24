import React, { forwardRef } from 'react'

const AuthInput = forwardRef(function AuthInput(
  {
    label,
    type = 'text',
    placeholder,
    error,
    required,
    hint,
    className = '',
    ...rest
  },
  ref
) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}

      <input
        ref={ref}
        type={type}
        placeholder={placeholder}
        className={`
          w-full px-4 py-2.5 rounded-xl border text-sm text-gray-900
          placeholder:text-gray-400 transition-all duration-150
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          ${
            error
              ? 'border-red-300 bg-red-50 focus:ring-red-400'
              : 'border-gray-300 bg-white hover:border-gray-400'
          }
          ${className}
        `}
        {...rest}
      />

      {error && (
        <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}

      {hint && !error && (
        <p className="mt-1.5 text-xs text-gray-500">{hint}</p>
      )}
    </div>
  )
})

export default AuthInput