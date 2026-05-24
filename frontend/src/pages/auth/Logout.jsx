import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { logout as logoutApi } from '../../services/authService'
import { useAuth } from '../../store/authStore'
import AuthLayout from '../../layouts/AuthLayout'

export default function Logout() {
  const auth = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    async function doLogout() {
      try {
        if (auth.refresh) {
          await logoutApi(auth.refresh)
        }
      } catch {
        // Ignore API errors — always clear local state
      } finally {
        auth.logout()
        navigate('/login', { replace: true })
      }
    }

    doLogout()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AuthLayout>
      <div className="flex flex-col items-center gap-4">
        {/* Animated spinner */}
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
          <span className="absolute inset-0 flex items-center justify-center text-xl">🔧</span>
        </div>
        <div className="text-center">
          <p className="text-gray-700 font-medium">Signing you out…</p>
          <p className="text-sm text-gray-400 mt-1">Please wait a moment</p>
        </div>
      </div>
    </AuthLayout>
  )
}
