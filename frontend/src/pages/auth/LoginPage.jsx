import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function LoginPage({ onNavigateRegister, onNavigateBack }) {
  const { login } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError(t('errors.requiredField'));
      return;
    }

    setLoading(true);
    try {
      await login({ email, password });
    } catch (err) {
      setError(err.message || t('auth.invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError(null);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-badge">{t('auth.secureAuth')}</div>
          <h2 className="auth-title">{t('auth.welcome')}</h2>
          <p className="auth-subtitle">
            {t('auth.subtitle')}
          </p>
        </div>

        {error && <div className="auth-error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">{t('auth.emailAddress')}</label>
            <input
              type="email"
              className="form-input"
              placeholder="e.g. farmer@punjab.gov.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('auth.password')}</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit-btn"
            disabled={loading}
          >
            {loading ? <LoadingSpinner text={t('auth.authenticating')} /> : t('auth.signInBtn')}
          </button>
        </form>

        <div className="demo-accounts-box">
          <div className="demo-header">
            <span className="demo-badge">{t('auth.quickDemo')}</span>
          </div>
          <div className="demo-grid">
            <button
              type="button"
              className="demo-pill"
              onClick={() => fillDemo('e2e_farmer@punjab.in', 'SecurePassword2026!')}
            >
              🌾 {t('roles.FARMER')}
            </button>
            <button
              type="button"
              className="demo-pill"
              onClick={() => fillDemo('e2e_buyer@biomassenergy.com', 'SecurePassword2026!')}
            >
              🏭 {t('roles.BUYER')}
            </button>
          </div>
        </div>

        <div className="auth-footer">
          <p>
            {t('auth.noAccount')}{' '}
            <button
              type="button"
              className="auth-link-btn"
              onClick={onNavigateRegister}
            >
              {t('auth.createAccountBtn')}
            </button>
          </p>
          {onNavigateBack && (
            <p style={{ marginTop: '12px' }}>
              <button
                type="button"
                className="auth-link-btn"
                style={{ color: '#6b7280', fontSize: '13px' }}
                onClick={onNavigateBack}
              >
                ← Back to Role Selection
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
