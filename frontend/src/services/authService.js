import API from './api';

// Auth-specific endpoints live under /auth/
// We reuse the main API instance (which already handles JWT headers and 401s)

export async function login(credentials) {
  // credentials: { username, password }
  const res = await API.post('/auth/login/', credentials);
  return res.data;
}

export async function register(data) {
  const res = await API.post('/auth/register/', data);
  return res.data;
}

export async function logout(refresh) {
  const res = await API.post('/auth/logout/', { refresh });
  return res.data;
}

export async function passwordReset(email) {
  const res = await API.post('/auth/password-reset/', { email });
  return res.data;
}

export async function passwordResetConfirm(payload) {
  // payload: { uid, token, new_password }
  const res = await API.post('/auth/password-reset-confirm/', payload);
  return res.data;
}

export async function changePassword(payload) {
  // payload: { old_password, new_password }
  // Auth header is automatically attached by the API interceptor
  const res = await API.post('/auth/change-password/', payload);
  return res.data;
}
