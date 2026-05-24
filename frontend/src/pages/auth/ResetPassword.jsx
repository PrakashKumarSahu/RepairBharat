import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { passwordResetConfirm } from '../../services/authService'
import AuthLayout from '../../layouts/AuthLayout'
import AuthCard from '../../components/auth/AuthCard'
import AuthInput from '../../components/auth/AuthInput'
import AuthButton from '../../components/auth/AuthButton'

export default function ResetPassword() {
  const { uid, token } = useParams()
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm()
  const [apiError, setApiError] = useState(null)

  const newPassword = watch('new_password')

  async function onSubmit({ new_password, confirm_password }) { // eslint-disable-line no-unused-vars
    setApiError(null)
    try {
      await passwordResetConfirm({ uid, token, new_password })
      navigate('/reset-password/success', { replace: true })
    } catch (err) {
      const d = err.response?.data
      if (d?.detail) setApiError(d.detail)
      else if (d?.token) setApiError('This reset link is invalid or has expired. Please request a new one.')
      else if (d?.new_password) setApiError(Array.isArray(d.new_password) ? d.new_password.join(', ') : d.new_password)
      else setApiError('Something went wrong. The link may have expired.')
    }
  }

  // Invalid link — uid or token missing from URL
  if (!uid || !token) {
    return (
      <AuthLayout>
        <AuthCard title="Invalid link" subtitle="This reset link is missing required parameters." backTo="/forgot-password" backLabel="Request a new reset link">
          <div className="flex items-start gap-2.5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
            <span className="shrink-0">⚠️</span>
            <span>Your reset link appears to be broken. Please click the link in your email again, or request a new one.</span>
          </div>
        </AuthCard>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Set a new password"
        subtitle="Choose a strong password you haven't used before."
        backTo="/login"
        backLabel="Back to sign in"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <AuthInput
            label="New password"
            type="password"
            placeholder="Min. 8 characters"
            required
            autoComplete="new-password"
            error={errors.new_password?.message}
            hint="Use at least 8 characters with a mix of letters and numbers."
            {...register('new_password', {
              required: 'New password is required',
              minLength: { value: 8, message: 'Minimum 8 characters' },
            })}
          />

          <AuthInput
            label="Confirm new password"
            type="password"
            placeholder="Repeat your new password"
            required
            autoComplete="new-password"
            error={errors.confirm_password?.message}
            {...register('confirm_password', {
              required: 'Please confirm your password',
              validate: (val) => val === newPassword || 'Passwords do not match',
            })}
          />

          {apiError && (
            <div className="flex items-start gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <span className="shrink-0 mt-0.5">⚠️</span>
              <span>{apiError}</span>
            </div>
          )}

          <div className="pt-1">
            <AuthButton loading={isSubmitting} loadingText="Resetting password…">
              Reset password →
            </AuthButton>
          </div>
        </form>
      </AuthCard>
    </AuthLayout>
  )
}
