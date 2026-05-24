import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { register as registerApi } from '../../services/authService';
import { useNavigate, Link } from 'react-router-dom';

const ROLES = [
  {
    value: 'customer',
    label: 'Customer',
    emoji: '🙋',
    description: 'I need repair services for my devices',
    accent: 'blue',
  },
  {
    value: 'technician',
    label: 'Technician',
    emoji: '🔧',
    description: 'I am a skilled repair technician',
    accent: 'purple',
  },
  {
    value: 'provider',
    label: 'Provider',
    emoji: '🏪',
    description: 'I own or manage a repair shop',
    accent: 'orange',
  },
];

const ACCENT = {
  blue:   { ring: 'ring-blue-500',   bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-400',   badge: 'bg-blue-100 text-blue-700'   },
  purple: { ring: 'ring-purple-500', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-400', badge: 'bg-purple-100 text-purple-700' },
  orange: { ring: 'ring-orange-500', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-400', badge: 'bg-orange-100 text-orange-700' },
};

export default function Register() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const [selectedRole, setSelectedRole] = useState('customer');
  const [apiError, setApiError] = useState(null);
  const navigate = useNavigate();

  async function onSubmit(data) {
    setApiError(null);
    try {
      await registerApi({ ...data, role: selectedRole });
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      const errData = err.response?.data;
      if (errData && typeof errData === 'object') {
        const messages = Object.entries(errData)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join(' | ');
        setApiError(messages);
      } else {
        setApiError('Registration failed. Please try again.');
      }
    }
  }

  const activeRole = ROLES.find(r => r.value === selectedRole);
  const accent = ACCENT[activeRole.accent];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-4xl">🔧</span>
          <h1 className="mt-3 text-3xl font-bold text-gray-900">Join RepairBharat</h1>
          <p className="mt-1 text-gray-500 text-sm">Create your account — choose how you want to use the platform</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          {/* Role selector */}
          <div className="p-6 pb-0">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">I am a…</p>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {ROLES.map(role => {
                const a = ACCENT[role.accent];
                const isActive = selectedRole === role.value;
                return (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setSelectedRole(role.value)}
                    className={`
                      relative flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition-all duration-150 cursor-pointer text-center
                      ${isActive
                        ? `${a.border} ${a.bg} ring-2 ${a.ring} ring-offset-1`
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    <span className="text-2xl">{role.emoji}</span>
                    <span className={`text-sm font-semibold ${isActive ? a.text : 'text-gray-700'}`}>
                      {role.label}
                    </span>
                    {isActive && (
                      <span className={`absolute top-2 right-2 w-2 h-2 rounded-full ${a.text.replace('text', 'bg')}`} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Role description pill */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${accent.badge} text-xs font-medium mb-6`}>
              <span>{activeRole.emoji}</span>
              <span>{activeRole.description}</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="px-6 pb-6 space-y-4">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">First name</label>
                <input
                  {...register('first_name')}
                  placeholder="Aarav"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Last name</label>
                <input
                  {...register('last_name')}
                  placeholder="Sharma"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                {...register('username', { required: 'Username is required' })}
                placeholder="aarav_sharma"
                autoComplete="username"
                className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                  errors.username ? 'border-red-400 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.username && (
                <p className="mt-1 text-xs text-red-600">{errors.username.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
                })}
                placeholder="aarav@example.com"
                autoComplete="email"
                className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                  errors.email ? 'border-red-400 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Minimum 8 characters' },
                })}
                placeholder="Min. 8 characters"
                autoComplete="new-password"
                className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                  errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* API error */}
            {apiError && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                <span className="mt-0.5">⚠️</span>
                <span>{apiError}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`
                w-full py-3 rounded-xl font-semibold text-sm text-white transition-all duration-150
                ${isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : `${accent.border.replace('border', 'bg')} hover:opacity-90 active:scale-[0.98] shadow-sm`
                }
              `}
            >
              {isSubmitting
                ? 'Creating account…'
                : `Create ${activeRole.label} account ${activeRole.emoji}`}
            </button>

            {/* Footer */}
            <p className="text-center text-xs text-gray-500 pt-1">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
