import React from 'react'
import { useAuth } from '../store/authStore'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const auth = useAuth()
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Welcome{auth?.user?.username ? `, ${auth.user.username}` : ''}!</h1>
      <p className="mb-4">You are signed in. Use the links below to navigate.</p>
      <div className="space-x-3">
        <Link to="/providers" className="px-4 py-2 bg-blue-600 text-white rounded">View Providers</Link>
        <Link to="/change-password" className="px-4 py-2 bg-gray-200 rounded">Change Password</Link>
      </div>
    </div>
  )
}
