import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Signup.css';
import {
  FiUser, FiLock, FiMail, FiEye, FiEyeOff,
  FiArrowRight, FiArrowLeft, FiTool,
} from 'react-icons/fi';
import { MdBuild, MdStorefront } from 'react-icons/md';
import { signup } from '../services';
import toast, { Toaster } from 'react-hot-toast';

const ROLES = [
  { id: 'customer',   label: 'Customer',   icon: '👤', desc: 'Get repairs done' },
  { id: 'shopowner',  label: 'Shop Owner', icon: '🏪', desc: 'Manage your shop'  },
  { id: 'technician', label: 'Technician', icon: '🔧', desc: 'Offer repair skills' },
];

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username:            '',
    email:               '',
    password:            '',
    confirmPassword:     '',
    role:                '',
    shop_to_which_he_belong: '',
  });
  const [showPass, setShowPass]         = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [loading, setLoading]           = useState(false);
  const [errors, setErrors]             = useState({});

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
    if (!form.username.trim())           e.username = 'Username is required';
    else if (form.username.length < 3)   e.username = 'At least 3 characters';
    if (!form.email.trim())              e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (form.password.length < 8)        e.password = 'Minimum 8 characters needed';
    if (form.confirmPassword !== form.password) e.confirmPassword = 'Passwords do not match';
    if (!form.role)                      e.role     = 'Please select your role';
    if (form.role === 'technician' && !form.shop_to_which_he_belong.trim())
      e.shop_to_which_he_belong = 'Please enter the shop name';
    return e;
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    
    const response = await signup(form);

    if(response.status == 201){
      toast.success("Signed up successfully")
      setTimeout(() => {
        navigate("/")
      }, 1000);
    }
    if(response.status == 400){
      const data = response.data;
      if(data.username){
        setErrors((prev)=>({...prev, username:"username already exists"}));
      }
      if(data.password){
        setErrors((p)=>({...p, password:"password must contain number and characters"}))
      }
      setLoading(false);
    }

  };

  return (
    <div className="su-page">
      <Toaster position='top'/>
      <div className="su-bg-orb su-bg-orb--1" />
      <div className="su-bg-orb su-bg-orb--2" />
      <div className="su-bg-orb su-bg-orb--3" />

      <div className="su-card">

        {/* ── Brand ── */}
        <div className="su-brand">
          <div className="su-brand-icon"><MdBuild /></div>
          <span className="su-brand-name">RepairBharat</span>
        </div>

        {/* ── Heading ── */}
        <div className="su-heading">
          <h1>Create account</h1>
          <p>Join thousands of users on the platform</p>
        </div>

        <form className="su-form" onSubmit={handleSubmit} noValidate>

          {/* ── Row 1: Username + Email ── */}
          <div className="su-row">
            <Field
              id="su-username" label="Username" error={errors.username}
              icon={<FiUser />}
              input={
                <input
                  id="su-username" type="text" placeholder="Choose a username"
                  autoComplete="username" value={form.username} onChange={set('username')}
                />
              }
            />
            <Field
              id="su-email" label="Email" error={errors.email}
              icon={<FiMail />}
              input={
                <input
                  id="su-email" type="email" placeholder="your@email.com"
                  autoComplete="email" value={form.email} onChange={set('email')}
                />
              }
            />
          </div>

          {/* ── Row 2: Password + Confirm ── */}
          <div className="su-row">
            <Field
              id="su-password" label="Password" error={errors.password}
              icon={<FiLock />}
              toggle={
                <button type="button" className="su-eye" onClick={() => setShowPass(v => !v)}
                  aria-label={showPass ? 'Hide' : 'Show'}>
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </button>
              }
              input={
                <input
                  id="su-password" type={showPass ? 'text' : 'password'}
                  placeholder="Min. 8 characters" autoComplete="new-password"
                  value={form.password} onChange={set('password')}
                />
              }
            />
            <Field
              id="su-confirm" label="Confirm Password" error={errors.confirmPassword}
              icon={<FiLock />}
              toggle={
                <button type="button" className="su-eye" onClick={() => setShowConfirm(v => !v)}
                  aria-label={showConfirm ? 'Hide' : 'Show'}>
                  {showConfirm ? <FiEyeOff /> : <FiEye />}
                </button>
              }
              input={
                <input
                  id="su-confirm" type={showConfirm ? 'text' : 'password'}
                  placeholder="Repeat password" autoComplete="new-password"
                  value={form.confirmPassword} onChange={set('confirmPassword')}
                />
              }
            />
          </div>

          {/* ── Role Selector ── */}
          <div className="su-roles-wrap">
            <p className="su-field-label">I am a</p>
            <div className="su-roles">
              {ROLES.map((r) => (
                <button
                  key={r.id} type="button"
                  className={`su-role ${form.role === r.id ? 'su-role--active' : ''}`}
                  onClick={() => setRole(r.id)}
                  aria-pressed={form.role === r.id}
                >
                  <span className="su-role-icon">{r.icon}</span>
                  <span className="su-role-name">{r.label}</span>
                  <span className="su-role-desc">{r.desc}</span>
                  {form.role === r.id && <span className="su-role-check">✓</span>}
                </button>
              ))}
            </div>
            {errors.role && <p className="su-err">{errors.role}</p>}
          </div>

          {/* ── Technician: shop field (animated reveal) ── */}
          <div className={`su-shop-field ${form.role === 'technician' ? 'su-shop-field--visible' : ''}`}>
            <Field
              id="su-shop" label="Shop You Belong To" error={errors.shop_to_which_he_belong}
              icon={<MdStorefront />}
              input={
                <input
                  id="su-shop" type="text" placeholder="Enter the shop name or ID"
                  value={form.shop_to_which_he_belong}
                  onChange={set('shop_to_which_he_belong')}
                />
              }
            />
          </div>

          {/* ── Submit ── */}
          <button
            id="btn-signup" type="submit"
            className={`su-submit ${loading ? 'su-submit--loading' : ''}`}
            disabled={loading}
          >
            {loading
              ? <span className="su-spinner" />
              : <><FiTool style={{ marginRight: 8 }} /> Create Account <FiArrowRight className="su-arrow" /></>
            }
          </button>

        </form>

        {/* ── Footer ── */}
        <p className="su-footer">
          Already have an account?{' '}
          <Link to="/" className="su-footer-link">Sign in</Link>
        </p>

      </div>
    </div>
  );
}

function Field({ id, label, icon, toggle, input, error }) {
  return (
    <div className={`su-field ${error ? 'su-field--error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      <div className="su-input-wrap">
        <span className="su-input-icon">{icon}</span>
        {input}
        {toggle}
      </div>
      {error && <span className="su-err">{error}</span>}
    </div>
  );
}
