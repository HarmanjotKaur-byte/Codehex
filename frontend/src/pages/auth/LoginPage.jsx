import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function LoginPage({ onSwitchToRegister }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card card">
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 6 }}>🌾</div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--green-900)' }}>
            Welcome to ParaliPay
          </h2>
          <p style={{ color: 'var(--gray-600)', fontSize: '0.88rem' }}>
            Turn crop waste into value. Login to access your portal.
          </p>
        </div>

        {error && (
          <div className="error-box" style={{ marginBottom: 18 }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="e.g. farmer@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            <LogIn size={18} />
            {loading ? 'Authenticating…' : 'Sign In'}
          </button>
        </form>

        {loading && <LoadingSpinner message="Signing in..." />}

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: '0.85rem' }}>
          Don't have an account?{' '}
          <button
            onClick={onSwitchToRegister}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--green-700)',
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Create an account
          </button>
        </div>

        {/* Demo Fast Login Helper */}
        <div className="demo-credentials-box">
          <div style={{ fontWeight: 700, marginBottom: 8, fontSize: '0.78rem', color: '#92400e' }}>
            ⚡ DEMO QUICK FILL:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '0.72rem', padding: '4px 8px' }}
              onClick={() => fillDemo('admin@paralipay.gov.in', 'Admin@ParaliPay2026')}
            >
              Super Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
