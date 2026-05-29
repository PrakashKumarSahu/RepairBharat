import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup } from '../services';
import toast, { Toaster } from 'react-hot-toast';

const ROLES = [
  { id: 'customer', label: 'Customer', icon: 'person', desc: 'Get repairs done' },
  { id: 'shop_owner', label: 'Shop Owner', icon: 'storefront', desc: 'Manage your shop' },
  { id: 'technician', label: 'Technician', icon: 'handyman', desc: 'Offer repair skills' },
];

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: '',
    shop_to_which_he_belong: '',
  });

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    setErrors((p) => ({ ...p, [field]: '' }));
  };

  const setRole = (id) => {
    setForm((p) => ({ ...p, role: id, shop_to_which_he_belong: '' }));
    setErrors((p) => ({ ...p, role: '', shop_to_which_he_belong: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = 'Username is required';
    else if (form.username.length < 3) e.username = 'At least 3 characters';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(form.phone)) e.phone = 'Enter a valid 10 digit phone number';
    if (form.password.length < 8) e.password = 'Minimum 8 characters needed';
    if (form.confirmPassword !== form.password) e.confirmPassword = 'Passwords do not match';
    if (!form.role) e.role = 'Please select your role';
    if (form.role === 'technician' && !form.shop_to_which_he_belong.trim())
      e.shop_to_which_he_belong = 'Please enter the shop name';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      const response = await signup(form);
      if (response.status === 201) {
        toast.success("Account created successfully!");
        setTimeout(() => {
          navigate("/login");
        }, 1000);
      } else if (response.status === 400) {
        const data = response.data;
        if (data.username) {
          setErrors((prev) => ({ ...prev, username: "Username already exists" }));
        }
        if (data.password) {
          setErrors((p) => ({ ...p, password: "Password must contain numbers & characters" }));
        }
        setLoading(false);
      } else {
        toast.error("Registration failed. Please check details.");
        setLoading(false);
      }
    } catch (err) {
      toast.error("Network error during registration");
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className="bg-background text-on-background min-h-screen flex flex-col justify-center py-8">
        <main className="flex-grow flex flex-col justify-between px-margin-mobile md:px-margin-desktop max-w-xl mx-auto w-full">
          
          {/* Header */}
          <div className="flex flex-col items-center text-center">
            <div className="mb-4">
              <div className="w-14 h-14 bg-primary-container rounded-xl flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-[32px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>handyman</span>
              </div>
            </div>
            <h1 className="font-headline-xl text-[28px] text-primary font-bold">RepairBharat</h1>
            <p className="font-body-md text-on-surface-variant font-semibold">Join Bharat's Unified Repair System</p>
          </div>

          {/* Canvas */}
          <div className="flex flex-col mt-6">
            <div className="mb-4 text-center">
              <h2 className="font-headline-lg text-[22px] text-on-surface font-bold">Create Account</h2>
              <p className="font-body-md text-on-surface-variant text-[14px] mt-xs">Establish your workstation profile on the platform.</p>
            </div>

            {/* Choose Station */}
            <div className="mb-4">
              <label className="font-label-md text-label-md text-on-surface-variant mb-2 block">Choose Workstation Role</label>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`flex flex-col items-center p-3 rounded-xl border transition-all duration-200 ${
                      form.role === r.id
                        ? 'bg-primary text-on-primary border-primary shadow-md scale-105'
                        : 'bg-surface-container-lowest text-on-surface-variant border-outline hover:bg-surface-container'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-[22px] mb-1 ${form.role === r.id ? 'text-on-primary' : 'text-primary'}`}>{r.icon}</span>
                    <span className="font-label-sm text-[12px] font-bold">{r.label}</span>
                  </button>
                ))}
              </div>
              {errors.role && <p className="text-error text-label-sm mt-1 ml-1 font-semibold">{errors.role}</p>}
            </div>

            {/* Fields Form */}
            <form className="space-y-3" onSubmit={handleSubmit} noValidate>
              
              {/* Row 1: Username & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-xs">
                  <label className="font-label-md text-[13px] text-on-surface-variant ml-xs" htmlFor="reg-username">Username *</label>
                  <div className="relative flex items-center">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <span className="material-symbols-outlined text-[18px] text-outline">person</span>
                    </div>
                    <input
                      className={`w-full h-11 pl-10 pr-md bg-surface-container-lowest border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all font-body-md text-[14px] ${
                        errors.username ? 'border-error' : 'border-outline'
                      }`}
                      id="reg-username"
                      placeholder="Username"
                      type="text"
                      value={form.username}
                      onChange={set('username')}
                    />
                  </div>
                  {errors.username && <p className="text-error text-[11px] mt-0.5 ml-1 font-semibold">{errors.username}</p>}
                </div>

                <div className="space-y-xs">
                  <label className="font-label-md text-[13px] text-on-surface-variant ml-xs" htmlFor="reg-email">Email Address *</label>
                  <div className="relative flex items-center">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <span className="material-symbols-outlined text-[18px] text-outline">mail</span>
                    </div>
                    <input
                      className={`w-full h-11 pl-10 pr-md bg-surface-container-lowest border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all font-body-md text-[14px] ${
                        errors.email ? 'border-error' : 'border-outline'
                      }`}
                      id="reg-email"
                      placeholder="email@example.com"
                      type="email"
                      value={form.email}
                      onChange={set('email')}
                    />
                  </div>
                  {errors.email && <p className="text-error text-[11px] mt-0.5 ml-1 font-semibold">{errors.email}</p>}
                </div>
              </div>

              {/* Row 2: Phone & Optional Shop Assignment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-xs">
                  <label className="font-label-md text-[13px] text-on-surface-variant ml-xs" htmlFor="reg-phone">Phone Number *</label>
                  <div className="relative flex items-center">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <span className="material-symbols-outlined text-[18px] text-outline">call</span>
                    </div>
                    <input
                      className={`w-full h-11 pl-10 pr-md bg-surface-container-lowest border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all font-body-md text-[14px] ${
                        errors.phone ? 'border-error' : 'border-outline'
                      }`}
                      id="reg-phone"
                      placeholder="10-digit number"
                      type="tel"
                      value={form.phone}
                      onChange={set('phone')}
                    />
                  </div>
                  {errors.phone && <p className="text-error text-[11px] mt-0.5 ml-1 font-semibold">{errors.phone}</p>}
                </div>

                {form.role === 'technician' ? (
                  <div className="space-y-xs animate-fadeIn">
                    <label className="font-label-md text-[13px] text-on-surface-variant ml-xs" htmlFor="reg-shop">Shop Assignment *</label>
                    <div className="relative flex items-center">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <span className="material-symbols-outlined text-[18px] text-outline">storefront</span>
                      </div>
                      <input
                        className={`w-full h-11 pl-10 pr-md bg-surface-container-lowest border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all font-body-md text-[14px] ${
                          errors.shop_to_which_he_belong ? 'border-error' : 'border-outline'
                        }`}
                        id="reg-shop"
                        placeholder="Assigned Shop Name"
                        type="text"
                        value={form.shop_to_which_he_belong}
                        onChange={set('shop_to_which_he_belong')}
                      />
                    </div>
                    {errors.shop_to_which_he_belong && <p className="text-error text-[11px] mt-0.5 ml-1 font-semibold">{errors.shop_to_which_he_belong}</p>}
                  </div>
                ) : (
                  <div className="hidden md:block"></div>
                )}
              </div>

              {/* Row 3: Password & Confirm Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-xs">
                  <label className="font-label-md text-[13px] text-on-surface-variant ml-xs" htmlFor="reg-password">Password *</label>
                  <div className="relative flex items-center">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <span className="material-symbols-outlined text-[18px] text-outline">lock</span>
                    </div>
                    <input
                      className={`w-full h-11 pl-10 pr-10 bg-surface-container-lowest border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all font-body-md text-[14px] ${
                        errors.password ? 'border-error' : 'border-outline'
                      }`}
                      id="reg-password"
                      placeholder="Min 8 characters"
                      type={showPass ? 'text' : 'password'}
                      value={form.password}
                      onChange={set('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-outline hover:text-on-background"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showPass ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                  {errors.password && <p className="text-error text-[11px] mt-0.5 ml-1 font-semibold">{errors.password}</p>}
                </div>

                <div className="space-y-xs">
                  <label className="font-label-md text-[13px] text-on-surface-variant ml-xs" htmlFor="reg-confirm">Confirm Password *</label>
                  <div className="relative flex items-center">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <span className="material-symbols-outlined text-[18px] text-outline">lock</span>
                    </div>
                    <input
                      className={`w-full h-11 pl-10 pr-10 bg-surface-container-lowest border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all font-body-md text-[14px] ${
                        errors.confirmPassword ? 'border-error' : 'border-outline'
                      }`}
                      id="reg-confirm"
                      placeholder="Repeat password"
                      type={showConfirm ? 'text' : 'password'}
                      value={form.confirmPassword}
                      onChange={set('confirmPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-outline hover:text-on-background"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showConfirm ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-error text-[11px] mt-0.5 ml-1 font-semibold">{errors.confirmPassword}</p>}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col space-y-md">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-touch-target bg-primary text-on-primary font-bold rounded-lg shadow-sm hover:bg-primary-container active:scale-95 transition-all duration-150 flex items-center justify-center gap-sm disabled:opacity-50"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-on-primary border-t-transparent" />
                  ) : (
                    <>
                      <span>Establish Workstation</span>
                      <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center pt-2">
                  <p className="font-label-sm text-label-sm text-on-surface-variant">
                    Already registered?{' '}
                    <Link to="/login" className="text-primary font-bold hover:underline">Log in here</Link>
                  </p>
                </div>
              </div>

            </form>
          </div>

        </main>
        {/* Accent bar */}
        <div className="fixed bottom-0 left-0 w-full h-1 bg-primary"></div>
      </div>
    </>
  );
}
