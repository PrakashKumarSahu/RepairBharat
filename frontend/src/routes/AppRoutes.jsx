import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../store/authStore';
import MainLayout from '../layouts/MainLayout';

import Login from '../pages/auth/Login';
import Logout from '../pages/auth/Logout';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ForgotPasswordSuccess from '../pages/auth/ForgotPasswordSuccess';
import ResetPassword from '../pages/auth/ResetPassword';
import ResetPasswordSuccess from '../pages/auth/ResetPasswordSuccess';
import ChangePassword from '../pages/auth/ChangePassword';
import ChangePasswordSuccess from '../pages/auth/ChangePasswordSuccess';
import Dashboard from '../pages/Dashboard';
import Providers from '../pages/Providers';
import ProviderDetail from '../pages/ProviderDetail';
import NotFound from '../pages/NotFound';

function ProtectedRoute({ children }) {
  const auth = useAuth();
  if (!auth?.access) {
    return <Navigate to="/login" replace />;
  }
  return <MainLayout>{children}</MainLayout>;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/logout" element={<Logout />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/forgot-password/success" element={<ForgotPasswordSuccess />} />
      <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
      <Route path="/reset-password/success" element={<ResetPasswordSuccess />} />

      {/* Protected routes — wrapped in MainLayout */}
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/providers" element={<ProtectedRoute><Providers /></ProtectedRoute>} />
      <Route path="/providers/:id" element={<ProtectedRoute><ProviderDetail /></ProtectedRoute>} />
      <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
      <Route path="/change-password/success" element={<ProtectedRoute><ChangePasswordSuccess /></ProtectedRoute>} />

      {/* 404 fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
