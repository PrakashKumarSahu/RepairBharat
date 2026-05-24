import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { passwordReset } from '../../services/authService'
import AuthLayout from '../../layouts/AuthLayout'
import AuthCard from '../../components/auth/AuthCard'
import AuthInput from '../../components/auth/AuthInput'
import AuthButton from '../../components/auth/AuthButton'

export default function ForgotPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm()
  const navigate = useNavigate()
  const [apiError, setApiError] = useState(null)

  async function onSubmit({ email }) {
    setApiError(null)
    try {
      await passwordReset(email)
      navigate('/forgot-password/success')
    } catch (err) {
      const d = err.response?.data
      if (d?.detail) setApiError(d.detail)
      else if (d?.email) setApiError(d.email.join ? d.email.join(', ') : d.email)
      else setApiError('Something went wrong. Please try again.')
    }
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Forgot your password?"
        subtitle="Enter your email address and we'll send you a reset link."
        backTo="/login"
        backLabel="Back to sign in"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <AuthInput
            label="Email address"
            type="email"
            placeholder="you@example.com"
            required
            autoComplete="email"
            error={errors.email?.message}
            hint="We'll send a password reset link to this address."
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^\S+@\S+\.\S+$/,
                message: 'Enter a valid email address',
              },
            })}
          />

          {apiError && (
            <div className="flex items-start gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <span className="shrink-0 mt-0.5">⚠️</span>
              <span>{apiError}</span>
            </div>
          )}

          <div className="pt-1">
            <AuthButton loading={isSubmitting} loadingText="Sending link…">
              Send reset link →
            </AuthButton>
          </div>
        </form>
      </AuthCard>
    </AuthLayout>
  )
}
