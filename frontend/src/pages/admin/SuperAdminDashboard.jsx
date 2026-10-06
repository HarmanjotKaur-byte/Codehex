import { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  Clock,
  XCircle,
  CheckCircle,
  Eye,
  AlertCircle,
  RefreshCw,
  X,
} from 'lucide-react';
import {
  getSuperAdminStats,
  getVerifications,
  approveVerification,
  rejectVerification,
} from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState(null);
  const [verifications, setVerifications] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState(null);
  const [rejectionModalUser, setRejectionModalUser] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [msg, setMsg] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [sData, vData] = await Promise.all([
        getSuperAdminStats(),
        getVerifications(filter === 'ALL' ? null : filter),
      ]);
      setStats(sData);
      setVerifications(vData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filter]);

  const handleApprove = async (userId) => {
    setActionLoading(true);
    try {
      await approveVerification(userId);
      setMsg('Government officer approved and verified successfully.');
      setTimeout(() => setMsg(''), 4000);
      await loadData();
    } catch (err) {
      alert(err.message || 'Approval failed.');
    } finally {
      setActionLoading(false);
      setSelectedOfficer(null);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return;
    setActionLoading(true);
    try {
      await rejectVerification(rejectionModalUser.user_id, rejectionReason);
      setMsg('Government officer application rejected.');
      setTimeout(() => setMsg(''), 4000);
      setRejectionModalUser(null);
      setRejectionReason('');
      await loadData();
    } catch (err) {
      alert(err.message || 'Rejection failed.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>🛡️ Super Admin — Government Officer Verification</h2>
        <p>Review, approve, or reject official credentials submitted by regional government personnel.</p>
      </div>

      {msg && (
        <div className="success-banner" style={{ marginBottom: 20 }}>
          <CheckCircle size={18} />
          <span>{msg}</span>
        </div>
      )}

      {/* Stats Summary */}
      <div className="stats-grid" style={{ marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: 'var(--amber-100)', color: 'var(--amber-600)' }}>
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Pending Verification</span>
            <span className="stat-value">{stats?.pending_verifications ?? '...'}</span>
            <span className="stat-sub">Requires admin action</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: 'var(--green-100)', color: 'var(--green-700)' }}>
            <ShieldCheck size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Verified Officers</span>
            <span className="stat-value">{stats?.verified_government ?? '...'}</span>
            <span className="stat-sub">Active government accounts</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: 'var(--red-100)', color: 'var(--red-600)' }}>
            <XCircle size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Rejected Applications</span>
            <span className="stat-value">{stats?.rejected_government ?? '...'}</span>
            <span className="stat-sub">Access blocked</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: 'var(--blue-100)', color: 'var(--blue-600)' }}>
            <Users size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Platform Users</span>
            <span className="stat-value">{stats?.total_users ?? '...'}</span>
            <span className="stat-sub">Farmers, Buyers & Govt</span>
          </div>
        </div>
      </div>

      {/* Verification Management Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div className="card-title" style={{ marginBottom: 0 }}>
            Official Verification Requests
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button className="btn btn-secondary" style={{ padding: '6px 12px' }} onClick={loadData}>
              <RefreshCw size={14} /> Refresh
            </button>
            <select
              className="form-select"
              style={{ width: 'auto', padding: '6px 12px' }}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="ALL">All Applications</option>
              <option value="PENDING">Pending Review Only</option>
              <option value="VERIFIED">Verified</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading verification records from database…" />
        ) : verifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--gray-400)' }}>
            <ShieldCheck size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p>No government verification requests found for this filter.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="metrics-table">
              <thead>
                <tr>
                  <th>Officer Name</th>
                  <th>Department & Role</th>
                  <th>Jurisdiction</th>
                  <th>Employee ID</th>
                  <th>Official Email</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {verifications.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <strong>{v.full_name}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{v.email}</div>
                    </td>
                    <td>
                      <div>{v.designation}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{v.department}</div>
                    </td>
                    <td>
                      {v.district}, {v.state}
                    </td>
                    <td>
                      <code>{v.employee_id}</code>
                    </td>
                    <td>{v.official_email || '—'}</td>
                    <td>
                      {v.verification_status === 'VERIFIED' ? (
                        <span className="chip chip-green">VERIFIED</span>
                      ) : v.verification_status === 'REJECTED' ? (
                        <span className="chip chip-red">REJECTED</span>
                      ) : (
                        <span className="chip chip-amber">PENDING</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          onClick={() => setSelectedOfficer(v)}
                        >
                          <Eye size={12} /> View
                        </button>

                        {v.verification_status !== 'VERIFIED' && (
                          <button
                            className="btn btn-primary"
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                            onClick={() => handleApprove(v.user_id)}
                            disabled={actionLoading}
                          >
                            Approve
                          </button>
                        )}

                        {v.verification_status !== 'REJECTED' && (
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '0.75rem', color: 'var(--red-600)' }}
                            onClick={() => setRejectionModalUser(v)}
                            disabled={actionLoading}
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Details Modal */}
      {selectedOfficer && (
        <div className="modal-overlay" onClick={() => setSelectedOfficer(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                Officer Verification Dossier: {selectedOfficer.full_name}
              </h3>
              <button
                className="btn btn-secondary"
                style={{ padding: '4px 8px' }}
                onClick={() => setSelectedOfficer(null)}
              >
                <X size={16} />
              </button>
            </div>

            <table className="metrics-table" style={{ marginBottom: 20 }}>
              <tbody>
                <tr><td>Officer Name</td><td><strong>{selectedOfficer.full_name}</strong></td></tr>
                <tr><td>Account Email</td><td>{selectedOfficer.email}</td></tr>
                <tr><td>Contact Phone</td><td>{selectedOfficer.phone || 'Not supplied'}</td></tr>
                <tr><td>Department</td><td>{selectedOfficer.department}</td></tr>
                <tr><td>Designation</td><td>{selectedOfficer.designation}</td></tr>
                <tr><td>Jurisdiction District</td><td>{selectedOfficer.district}, {selectedOfficer.state}</td></tr>
                <tr><td>Employee / Badge ID</td><td><code>{selectedOfficer.employee_id}</code></td></tr>
                <tr><td>Official Government Email</td><td>{selectedOfficer.official_email || 'None'}</td></tr>
                <tr><td>Submission Date</td><td>{new Date(selectedOfficer.submitted_date).toLocaleString()}</td></tr>
                <tr>
                  <td>Verification Status</td>
                  <td>
                    <span className={`chip chip-${selectedOfficer.verification_status === 'VERIFIED' ? 'green' : selectedOfficer.verification_status === 'REJECTED' ? 'red' : 'amber'}`}>
                      {selectedOfficer.verification_status}
                    </span>
                  </td>
                </tr>
                {selectedOfficer.rejection_reason && (
                  <tr>
                    <td>Rejection Reason</td>
                    <td style={{ color: 'var(--red-600)' }}>{selectedOfficer.rejection_reason}</td>
                  </tr>
                )}
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button className="btn btn-secondary" onClick={() => setSelectedOfficer(null)}>
                Close
              </button>
              {selectedOfficer.verification_status !== 'VERIFIED' && (
                <button
                  className="btn btn-primary"
                  onClick={() => handleApprove(selectedOfficer.user_id)}
                >
                  Approve Officer
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectionModalUser && (
        <div className="modal-overlay" onClick={() => setRejectionModalUser(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--red-600)' }}>
                Reject Verification Application
              </h3>
              <button
                className="btn btn-secondary"
                style={{ padding: '4px 8px' }}
                onClick={() => setRejectionModalUser(null)}
              >
                <X size={16} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', marginBottom: 14 }}>
              Specify the compliance reason for rejecting <strong>{rejectionModalUser.full_name}</strong>'s application. This will be shown to the user.
            </p>

            <form onSubmit={handleRejectSubmit}>
              <div className="form-group">
                <label className="form-label">Rejection Reason</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="e.g. Unable to verify official department or employee badge ID."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setRejectionModalUser(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-secondary"
                  style={{ background: 'var(--red-600)', color: '#fff' }}
                  disabled={actionLoading}
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
