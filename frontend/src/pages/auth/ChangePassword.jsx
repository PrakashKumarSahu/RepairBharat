import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { changePassword } from '../../services/authService'
import AuthLayout from '../../layouts/AuthLayout'
import AuthCard from '../../components/auth/AuthCard'
import AuthInput from '../../components/auth/AuthInput'
import AuthButton from '../../components/auth/AuthButton'

export default function ChangePassword() {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm()
  const navigate = useNavigate()
  const [apiError, setApiError] = useState(null)

  const newPassword = watch('new_password')

  async function onSubmit({ old_password, new_password }) {
    setApiError(null)
    try {
      await changePassword({ old_password, new_password })
      reset()
      navigate('/change-password/success')
    } catch (err) {
      const d = err.response?.data
      if (d?.old_password) setApiError(Array.isArray(d.old_password) ? d.old_password.join(', ') : d.old_password)
      else if (d?.new_password) setApiError(Array.isArray(d.new_password) ? d.new_password.join(', ') : d.new_password)
      else if (d?.detail) setApiError(d.detail)
      else setApiError('Failed to change password. Please try again.')
    }
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Change your password"
        subtitle="Enter your current password, then choose a new one."
        backTo="/"
        backLabel="Back to dashboard"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <AuthInput
            label="Current password"
            type="password"
            placeholder="Your current password"
            required
            autoComplete="current-password"
            error={errors.old_password?.message}
            {...register('old_password', {
              required: 'Current password is required',
            })}
          />

          <div className="border-t border-gray-100 pt-4">
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
          </div>

          <AuthInput
            label="Confirm new password"
            type="password"
            placeholder="Repeat new password"
            required
            autoComplete="new-password"
            error={errors.confirm_password?.message}
            {...register('confirm_password', {
              required: 'Please confirm your new password',
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
            <AuthButton loading={isSubmitting} loadingText="Updating password…">
              Update password →
            </AuthButton>
          </div>
        </form>
      </AuthCard>
    </AuthLayout>
  )
}
