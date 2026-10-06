import { useState } from 'react';
import { Clock, ShieldAlert, XCircle, RefreshCw, Upload, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function VerificationPendingPage() {
  const { currentUser, refreshUser, logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [docUploaded, setDocUploaded] = useState(false);

  const status = currentUser?.verification_status || 'PENDING';
  const reason = currentUser?.rejection_reason;

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshUser();
    setRefreshing(false);
  };

  const handleFileUpload = (e) => {
    if (e.target.files?.[0]) {
      setDocUploaded(true);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card card" style={{ maxWidth: '620px', textAlign: 'center' }}>
        {status === 'REJECTED' ? (
          <div>
            <div
              className="role-icon-box"
              style={{ background: 'var(--red-100)', color: 'var(--red-600)', margin: '0 auto 16px' }}
            >
              <XCircle size={40} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--red-600)', marginBottom: 8 }}>
              Government Verification Rejected
            </h2>
            <p style={{ color: 'var(--gray-600)', fontSize: '0.92rem', marginBottom: 16 }}>
              Your government account application could not be verified by the Super Administrator.
            </p>

            {reason && (
              <div
                className="error-box"
                style={{ textAlign: 'left', marginBottom: 20, background: '#fee2e2', borderColor: '#f87171' }}
              >
                <div>
                  <strong>Reason for Rejection:</strong>
                  <p style={{ marginTop: 4 }}>{reason}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div
              className="role-icon-box"
              style={{ background: 'var(--amber-100)', color: 'var(--amber-600)', margin: '0 auto 16px' }}
            >
              <Clock size={40} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#92400e', marginBottom: 8 }}>
              Account Pending Verification
            </h2>
            <p style={{ color: 'var(--gray-600)', fontSize: '0.92rem', marginBottom: 20 }}>
              Welcome, <strong>{currentUser?.full_name}</strong>. Your official government officer account is currently undergoing compliance review by the Super Administrator.
            </p>

            <div
              style={{
                background: 'var(--gray-50)',
                padding: '16px',
                borderRadius: 'var(--radius)',
                textAlign: 'left',
                marginBottom: 20,
                fontSize: '0.85rem',
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 8, color: 'var(--gray-800)' }}>
                Application Details on File:
              </div>
              <div>• Officer Name: {currentUser?.full_name}</div>
              <div>• Email: {currentUser?.email}</div>
              <div>• Verification Status: <span className="chip chip-amber">{status}</span></div>
            </div>

            {/* Optional Document Upload Card */}
            <div
              style={{
                border: '1.5px dashed var(--gray-300)',
                padding: '18px',
                borderRadius: 'var(--radius)',
                marginBottom: 24,
                background: docUploaded ? 'var(--green-50)' : 'transparent',
              }}
            >
              {docUploaded ? (
                <div style={{ color: 'var(--green-700)', fontWeight: 600, fontSize: '0.85rem' }}>
                  <CheckCircle2 size={20} style={{ display: 'inline', marginRight: 6 }} />
                  ID document uploaded for administrator review.
                </div>
              ) : (
                <div>
                  <Upload size={24} style={{ margin: '0 auto 8px', color: 'var(--gray-500)' }} />
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-700)', marginBottom: 4 }}>
                    Upload Official ID / Authorization Letter (Optional)
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    style={{ fontSize: '0.78rem' }}
                    onChange={handleFileUpload}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button className="btn btn-primary" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw size={16} className={refreshing ? 'spinning' : ''} />
            {refreshing ? 'Checking Status…' : 'Check Approval Status'}
          </button>
          <button className="btn btn-secondary" onClick={logout}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
