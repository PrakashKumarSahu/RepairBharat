import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { login as loginApi } from '../../services/authService'
import { useAuth } from '../../store/authStore'
import AuthLayout from '../../layouts/AuthLayout'
import AuthCard from '../../components/auth/AuthCard'
import AuthInput from '../../components/auth/AuthInput'
import AuthButton from '../../components/auth/AuthButton'

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm()
  const auth = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [apiError, setApiError] = useState(null)

  const justRegistered = location.state?.registered

  async function onSubmit(data) {
    setApiError(null)
    try {
      const res = await loginApi(data)
      auth.login(res)
      navigate('/')
    } catch (err) {
      const d = err.response?.data
      if (d?.detail) setApiError(d.detail)
      else if (d && typeof d === 'object') setApiError(Object.values(d).flat().join(' '))
      else setApiError('Invalid username or password.')
    }
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Welcome back"
        subtitle="Sign in to continue to RepairBharat"
        backTo="/register"
        backLabel="Don't have an account? Create one"
      >
        {/* Registration success banner */}
        {justRegistered && (
          <div className="mb-5 flex items-center gap-2.5 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-medium">
            <span>✅</span>
            <span>Account created! Sign in to continue.</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Username */}
          <AuthInput
            label="Username"
            placeholder="your_username"
            required
            autoComplete="username"
            error={errors.username?.message}
            {...register('username', { required: 'Username is required' })}
          />

          {/* Password with "Forgot password?" inline */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-gray-700">
                Password <span className="text-red-500">*</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <AuthInput
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password', { required: 'Password is required' })}
            />
          </div>

          {/* API error */}
          {apiError && (
            <div className="flex items-start gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <span className="shrink-0 mt-0.5">⚠️</span>
              <span>{apiError}</span>
            </div>
          )}

          <div className="pt-1">
            <AuthButton loading={isSubmitting} loadingText="Signing in…">
              Sign in →
            </AuthButton>
          </div>
        </form>
      </AuthCard>
    </AuthLayout>
  )
}
