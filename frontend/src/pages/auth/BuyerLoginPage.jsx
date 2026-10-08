import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Lock, Eye, EyeOff, ArrowLeft, Store } from 'lucide-react';
import bannerBiomassImg from '../../assets/buyer_login_banner.jpg';
import '../../styles/BuyerLoginPage.css';

export default function BuyerLoginPage({ onNavigateRegister, onNavigateBack }) {
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
    setIdentifier('e2e_buyer@biomassenergy.com');
    setPassword('SecurePassword2026!');
    setError(null);
  };

  return (
    <div className="buyer-login-viewport">
      {/* Left Panel: Real High-Res Biomass Facility & Professional Artwork */}
      <div 
        className="buyer-login-left-banner"
        style={{ backgroundImage: `url(${bannerBiomassImg})` }}
      >
        <div className="buyer-banner-text-content">
          <h1 className="buyer-banner-title">
            Better Connections.<br />
            Bigger Opportunities.
          </h1>
          <p className="buyer-banner-subtitle">
            Find quality crop residue, connect with<br />
            farmers, and grow your business.
          </p>
        </div>
      </div>

      {/* Right Panel: Functional Split Screen Form */}
      <div className="buyer-login-right-panel">
        {/* Topbar: Brand Logo & Navigation */}
        <div className="buyer-login-topbar">
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
            className="buyer-login-back-btn"
            onClick={onNavigateBack}
          >
            <ArrowLeft size={16} />
            <span>Back to Role Selection</span>
          </button>
        </div>

        {/* Center: Avatar, Title, and Form */}
        <div className="buyer-login-center-wrapper">
          {/* Clean Store Badge without image artifact */}
          <div className="buyer-avatar-circle">
            <Store size={38} color="#166534" strokeWidth={1.9} />
          </div>

          <h2 className="buyer-login-title">Buyer Login</h2>
          <p className="buyer-login-subtitle">Welcome back! Please login to your account.</p>

          {error && <div className="buyer-error-banner">{error}</div>}

          <form onSubmit={handleSubmit} className="buyer-login-form">
            {/* Field 1: Email or Mobile */}
            <div className="buyer-input-group">
              <span className="buyer-input-icon-left">
                <User size={18} />
              </span>
              <input
                type="text"
                className="buyer-input-field"
                placeholder="Email or Mobile Number"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>

            {/* Field 2: Password */}
            <div className="buyer-input-group">
              <span className="buyer-input-icon-left">
                <Lock size={18} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                className="buyer-input-field"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="buyer-input-icon-right"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Forgot Password Row */}
            <div className="buyer-forgot-row">
              <button
                type="button"
                className="buyer-forgot-btn"
                onClick={() => alert('Please contact support at support@paralipay.com to reset your credentials.')}
              >
                Forgot password?
              </button>
            </div>

            {/* Login Submit Button */}
            <button
              type="submit"
              className="buyer-submit-btn"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Quick Demo Credentials Fill */}
          <div className="buyer-demo-fill-box">
            <span>Quick testing:</span>
            <button
              type="button"
              className="buyer-demo-pill"
              onClick={handleDemoFill}
            >
              🏭 Auto-fill Demo Buyer
            </button>
          </div>

          {/* Registration link */}
          <div className="buyer-login-footer">
            Don't have an account?{' '}
            <button
              type="button"
              className="buyer-register-link"
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
