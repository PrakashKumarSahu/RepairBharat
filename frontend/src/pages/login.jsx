import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getUserDetails, signin, useUserContext } from '../services';
import toast, { Toaster } from 'react-hot-toast';

const ROLES = [
  { id: 'customer', label: 'Customer', icon: 'person', desc: 'Get repairs done' },
  { id: 'shop_owner', label: 'Shop Owner', icon: 'storefront', desc: 'Manage your shop' },
  { id: 'technician', label: 'Technician', icon: 'handyman', desc: 'Offer repair skills' },
];

export default function Home() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { user, setUser } = useUserContext();

  const validate = () => {
    const e = {};
    if (!username.trim()) e.username = 'Username is required';
    if (password.length < 6) e.password = 'Password must be at least 6 characters';
    if (!selectedRole) e.role = 'Please select your role';
    return e;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) {
      setErrors(e2);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      const response = await signin({ username, password });
      if (response.status === 200) {
        const token = JSON.parse(localStorage.getItem("token")).key;
        const details = await getUserDetails(token);
        setUser(details);
        toast.success("Successfully logged in!");
        navigate("/dashboard");
      } else {
        toast.error("Invalid credentials or user not found");
        setLoading(false);
      }
    } catch (err) {
      toast.error("Unable to connect to the authentication server");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user !== null) {
      navigate("/dashboard", { replace: true });
    }
  }, [user]);

  return (
    <>
      <Toaster position="top-center" />
      <div className="bg-background text-on-background min-h-screen flex flex-col justify-center">
        <main className="flex-grow flex flex-col justify-between px-margin-mobile md:px-margin-desktop py-xl max-w-lg mx-auto w-full">
          
          {/* Header Section with Brand Identity */}
          <div className="flex flex-col items-center text-center mt-6">
            <div className="mb-6">
              <div className="w-16 h-16 bg-primary-container rounded-xl flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-[36px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>handyman</span>
              </div>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-primary font-bold mb-xs">RepairBharat</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant font-semibold">Bharat Repair Operating System</p>
          </div>

          {/* Content Canvas */}
          <div className="flex flex-col mt-8">
            <div className="mb-6 text-center md:text-left">
              <h2 className="font-headline-lg text-headline-lg text-on-surface">Welcome Back</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Select your dashboard workstation and log in.</p>
            </div>

            {/* Workstation Role Selector */}
            <div className="mb-6">
              <label className="font-label-md text-label-md text-on-surface-variant ml-xs mb-2 block">Choose Workstation</label>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      setSelectedRole(r.id);
                      setErrors((p) => ({ ...p, role: '' }));
                    }}
                    className={`flex flex-col items-center p-3 rounded-xl border transition-all duration-200 ${
                      selectedRole === r.id
                        ? 'bg-primary text-on-primary border-primary shadow-md scale-105'
                        : 'bg-surface-container-lowest text-on-surface-variant border-outline hover:bg-surface-container'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-[24px] mb-1 ${selectedRole === r.id ? 'text-on-primary' : 'text-primary'}`}>{r.icon}</span>
                    <span className="font-label-sm text-[12px] font-bold">{r.label}</span>
                  </button>
                ))}
              </div>
              {errors.role && <p className="text-error text-label-sm mt-1 ml-1 font-semibold">{errors.role}</p>}
            </div>

            {/* Input Groups */}
            <form className="space-y-4" onSubmit={handleLogin} noValidate>
              
              {/* Username field */}
              <div className="space-y-sm">
                <label className="font-label-md text-label-md text-on-surface-variant ml-xs" htmlFor="login-username">Username</label>
                <div className="relative flex items-center">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-md pointer-events-none">
                    <span className="material-symbols-outlined text-[20px] text-outline">person</span>
                  </div>
                  <input
                    className={`w-full h-touch-target pl-12 pr-md bg-surface-container-lowest border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all font-body-md text-body-md ${
                      errors.username ? 'border-error' : 'border-outline'
                    }`}
                    id="login-username"
                    name="username"
                    placeholder="Enter username"
                    type="text"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setErrors((p) => ({ ...p, username: '' }));
                    }}
                  />
                </div>
                {errors.username && <p className="text-error text-label-sm mt-1 ml-1 font-semibold">{errors.username}</p>}
              </div>

              {/* Password field */}
              <div className="space-y-sm">
                <label className="font-label-md text-label-md text-on-surface-variant ml-xs" htmlFor="login-password">Password</label>
                <div className="relative flex items-center">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-md pointer-events-none">
                    <span className="material-symbols-outlined text-[20px] text-outline">lock</span>
                  </div>
                  <input
                    className={`w-full h-touch-target pl-12 pr-12 bg-surface-container-lowest border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all font-body-md text-body-md ${
                      errors.password ? 'border-error' : 'border-outline'
                    }`}
                    id="login-password"
                    name="password"
                    placeholder="Enter password"
                    type={showPass ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors((p) => ({ ...p, password: '' }));
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute inset-y-0 right-0 flex items-center pr-md text-outline hover:text-on-background"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPass ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {errors.password && <p className="text-error text-label-sm mt-1 ml-1 font-semibold">{errors.password}</p>}
              </div>

              {/* Submit Action */}
              <div className="pt-4 flex flex-col space-y-md">
                <button
                  id="btn-login"
                  type="submit"
                  disabled={loading}
                  className="w-full h-touch-target bg-primary text-on-primary font-bold rounded-lg shadow-sm hover:bg-primary-container active:scale-95 transition-all duration-150 flex items-center justify-center gap-sm disabled:opacity-50"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-on-primary border-t-transparent" />
                  ) : (
                    <>
                      <span>Enter Workstation</span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center pt-2">
                  <p className="font-label-sm text-label-sm text-on-surface-variant">
                    New to RepairBharat?{' '}
                    <Link to="/signup" className="text-primary font-bold hover:underline">Register account</Link>
                  </p>
                </div>
              </div>

            </form>
          </div>

        </main>
        {/* Decorative accent footer bar */}
        <div className="fixed bottom-0 left-0 w-full h-1 bg-primary"></div>
      </div>
    </>
  );
}
