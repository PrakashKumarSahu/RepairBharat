import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Home.css';
import { FiUser, FiLock, FiEye, FiEyeOff, FiArrowRight, FiTool } from 'react-icons/fi';
import { MdBuild, MdStorefront } from 'react-icons/md';
import { getUserDetails, signin, useUserContext } from '../services';
import toast, { Toaster } from 'react-hot-toast';

const ROLES = [
  { id: 1,   label: 'Customer',   icon: <FiUser />,     desc: 'Get repairs done' },
  { id: 2,  label: 'Shop Owner', icon: <MdStorefront />, desc: 'Manage your shop'  },
  { id: 3, label: 'Technician', icon: <FiTool />,     desc: 'Offer repair skills' },
];

export default function Home() {
  const navigate = useNavigate();
  const [username, setUsername]       = useState('');
  const [password, setPassword]       = useState('');
  const [showPass, setShowPass]       = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading]         = useState(false);
  const [errors, setErrors]           = useState({});
  const {user, setUser} =useUserContext();

  const validate = () => {
    const e = {};
    if (!username.trim())   e.username = 'Username is required';
    if (password.length < 6) e.password = 'Password must be at least 6 characters';
    if (!selectedRole)       e.role     = 'Please select your role';
    return e;
  };

  const handleLogin = async(e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    setErrors({});
    setLoading(true);
    // Simulate API call
    const response = await signin({username,password});
    if(response.status == 200){
      navigate("/dashboard")
      setUser(getUserDetails(JSON.parse(localStorage.getItem("token")).key))
    }else{
      toast.error("User does not found");
      setLoading(false);
    }
  };

  useEffect(()=>{
    if(user !==null){
      navigate("/dashboard",{replace:true});
      
    }
  },[user]);

  return (
    <>
    <Toaster position='top-center'/>
    <div className="home-page">
      {/* ── Background particles ── */}
      <div className="home-bg-orb home-bg-orb--1" />
      <div className="home-bg-orb home-bg-orb--2" />
      <div className="home-bg-orb home-bg-orb--3" />

      <div className="home-card">

        {/* ── Brand ── */}
        <div className="home-brand">
          <div className="home-brand-icon">
            <MdBuild />
          </div>
          <span className="home-brand-name">RepairBharat</span>
        </div>

        {/* ── Heading ── */}
        <div className="home-heading">
          <h1>Welcome back</h1>
          <p>Sign in to continue to your account</p>
        </div>

        {/* ── Role Selector ── */}
        <div className="home-roles">
          <p className="home-roles-label">Continue as</p>
          <div className="home-roles-row">
            {ROLES.map((r) => (
              <button
                key={r.id}
                type="button"
                className={`home-role-btn ${selectedRole === r.id ? 'home-role-btn--active' : ''}`}
                onClick={() => { setSelectedRole(r.id); setErrors((p) => ({ ...p, role: '' })); }}
                aria-pressed={selectedRole === r.id}
              >
                <span className="home-role-icon">{r.icon}</span>
                <span className="home-role-label">{r.label}</span>
              </button>
            ))}
          </div>
          {errors.role && <p className="home-err">{errors.role}</p>}
        </div>

        {/* ── Form ── */}
        <form className="home-form" onSubmit={handleLogin} noValidate>

          {/* Username */}
          <div className={`home-field ${errors.username ? 'home-field--error' : ''}`}>
            <label htmlFor="login-username">Username</label>
            <div className="home-input-wrap">
              <FiUser className="home-input-icon" />
              <input
                id="login-username"
                type="text"
                placeholder="Enter your username"
                autoComplete="username"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setErrors((p) => ({ ...p, username: '' })); }}
              />
            </div>
            {errors.username && <span className="home-err">{errors.username}</span>}
          </div>

          {/* Password */}
          <div className={`home-field ${errors.password ? 'home-field--error' : ''}`}>
            <label htmlFor="login-password">Password</label>
            <div className="home-input-wrap">
              <FiLock className="home-input-icon" />
              <input
                id="login-password"
                type={showPass ? 'text' : 'password'}
                placeholder="Enter your password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })); }}
              />
              <button
                type="button"
                className="home-pass-toggle"
                onClick={() => setShowPass((v) => !v)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.password && <span className="home-err">{errors.password}</span>}
          </div>

          {/* Forgot */}
          <div className="home-forgot-row">
            <a href="/forgot-password" className="home-forgot-link">Forgot password?</a>
          </div>

          {/* Submit */}
          <button
            id="btn-login"
            type="submit"
            className={`home-submit-btn ${loading ? 'home-submit-btn--loading' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <span className="home-spinner" />
            ) : (
              <>Sign In <FiArrowRight className="home-submit-arrow" /></>
            )}
          </button>

        </form>

        {/* ── Footer ── */}
        <p className="home-footer">
          Don't have an account?{' '}
          <Link to="/signup" className="home-footer-link">Sign up for free</Link>
        </p>

      </div>
    </div>
    </>
  );
}
