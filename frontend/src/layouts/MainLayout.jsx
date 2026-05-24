import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/authStore'
import { logout as logoutApi } from '../services/authService'

export default function MainLayout({ children }) {
  const auth = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    try {
      if (auth.refresh) {
        await logoutApi(auth.refresh)
      }
    } catch {
      // ignore API errors on logout — still clear local state
    } finally {
      auth.logout()
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo / Brand */}
          <Link
            to="/"
            className="text-lg font-bold text-blue-600 tracking-tight hover:text-blue-700 transition-colors"
          >
            🔧 RepairBharat
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-4">
            <Link
              to="/"
              className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              Home
            </Link>
            <Link
              to="/providers"
              className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              Providers
            </Link>
            {auth?.user?.username && (
              <span className="text-sm text-gray-500 hidden sm:inline">
                Hi, {auth.user.username}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="text-sm font-medium px-3 py-1.5 rounded-md bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-600 transition-colors"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="py-4 text-center text-xs text-gray-400 border-t border-gray-200">
        © {new Date().getFullYear()} RepairBharat
      </footer>
    </div>
  )
}
