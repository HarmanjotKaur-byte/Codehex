import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import bannerSunriseImg from '../../assets/farmer_login_sunrise.jpg';
import avatarImg from '../../assets/farmer_avatar_badge_hd.png';
import '../../styles/FarmerLoginPage.css';

export default function FarmerLoginPage({ onNavigateRegister, onNavigateBack }) {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!identifier || !password) {
      setError('Please enter your email or mobile number and password.');
      return;
    }

    setLoading(true);
    try {
      await login({ email: identifier, password });
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setIdentifier('e2e_farmer@punjab.in');
    setPassword('SecurePassword2026!');
    setError(null);
  };

  return (
    <div className="farmer-login-viewport">
      {/* Left Panel: Real High-Res Farmland Sunrise Artwork */}
      <div 
        className="farmer-login-left-banner"
        style={{ backgroundImage: `url(${bannerSunriseImg})` }}
      >
        <div className="farmer-banner-text-content">
          <h1 className="farmer-banner-title">
            Together for a<br />
            sustainable tomorrow
          </h1>
          <p className="farmer-banner-subtitle">
            Empowering farmers. Reducing residue.<br />
            Building a cleaner environment.
          </p>
        </div>
      </div>

      {/* Right Panel: Functional Split Screen Form */}
      <div className="farmer-login-right-panel">
        {/* Topbar: Brand Logo & Navigation */}
        <div className="farmer-login-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={onNavigateBack}>
            {/* Precision 2-tone leaf mark */}
            <svg width="26" height="26" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M6 26C6 26 8 15 16.5 9.5C24.5 4.5 28 6 28 6C28 6 26.5 15.5 19.5 22.5C13 29 6 26 6 26Z" 
                fill="#15803d" 
              />
              <path 
                d="M12.5 24.5C12.5 24.5 16.5 18.5 22.5 14.5C28 10.5 28 6 28 6C28 6 24 14 18 20.5C12.5 26.5 12.5 24.5 12.5 24.5Z" 
                fill="#4ade80" 
                opacity="0.85" 
              />
              <path 
                d="M6 26C11 20.5 17 14.5 27 7" 
                stroke="#0f382c" 
                strokeWidth="1.8" 
                strokeLinecap="round" 
              />
            </svg>
            <span style={{ fontSize: '22px', fontWeight: 800, color: '#0f382c', letterSpacing: '-0.4px' }}>
              ParaliPay
            </span>
          </div>

          <button 
            type="button" 
            className="farmer-login-back-btn"
            onClick={onNavigateBack}
          >
            <ArrowLeft size={16} />
            <span>Back to Role Selection</span>
          </button>
        </div>

        {/* Center: Avatar, Title, and Form */}
        <div className="farmer-login-center-wrapper">
          {/* Illustrated Farmer Avatar Badge */}
          <div className="farmer-avatar-circle">
            <img 
              src={avatarImg} 
              alt="Farmer avatar" 
              className="farmer-avatar-img" 
            />
          </div>

          <h2 className="farmer-login-title">Farmer Login</h2>
          <p className="farmer-login-subtitle">Welcome back! Please login to your account.</p>

          {error && <div className="farmer-error-banner">{error}</div>}

          <form onSubmit={handleSubmit} className="farmer-login-form">
            {/* Field 1: Email or Mobile */}
            <div className="farmer-input-group">
              <span className="farmer-input-icon-left">
                <User size={18} />
              </span>
              <input
                type="text"
                className="farmer-input-field"
                placeholder="Email or Mobile Number"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>

            {/* Field 2: Password */}
            <div className="farmer-input-group">
              <span className="farmer-input-icon-left">
                <Lock size={18} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                className="farmer-input-field"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="farmer-input-icon-right"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Forgot Password Row */}
            <div className="farmer-forgot-row">
              <button
                type="button"
                className="farmer-forgot-btn"
                onClick={() => alert('Please contact support at support@paralipay.com to reset your credentials.')}
              >
                Forgot password?
              </button>
            </div>

            {/* Login Submit Button */}
            <button
              type="submit"
              className="farmer-submit-btn"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Quick Demo Credentials Fill */}
          <div className="farmer-demo-fill-box">
            <span>Quick testing:</span>
            <button
              type="button"
              className="farmer-demo-pill"
              onClick={handleDemoFill}
            >
              🌾 Auto-fill Demo Farmer
            </button>
          </div>

          {/* Registration link */}
          <div className="farmer-login-footer">
            Don't have an account?{' '}
            <button
              type="button"
              className="farmer-register-link"
              onClick={onNavigateRegister}
            >
              Register
            </button>
          </div>
        </div>

        {/* Empty bottom spacer for layout balance */}
        <div style={{ height: '20px' }}></div>
      </div>
    </div>
  );
}
