import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserPlus, AlertCircle, Wheat, ShoppingBag, ShieldAlert } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function RegisterPage({ onSwitchToLogin }) {
  const { register } = useAuth();

  // Role: FARMER | BUYER | GOVERNMENT (SUPER_ADMIN strictly excluded from public registration)
  const [selectedRole, setSelectedRole] = useState('FARMER');

  // Common Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Farmer Fields
  const [state, setState] = useState('Punjab');
  const [district, setDistrict] = useState('Ludhiana');
  const [village, setVillage] = useState('');

  // Buyer Fields
  const [businessName, setBusinessName] = useState('');
  const [buyerType, setBuyerType] = useState('Biomass Aggregator');
  const [preferredMaterial, setPreferredMaterial] = useState('Paddy Straw Bales');

  // Government Fields
  const [department, setDepartment] = useState('Department of Agriculture & Farmers Welfare');
  const [designation, setDesignation] = useState('Assistant Agricultural Officer (AAO)');
  const [employeeId, setEmployeeId] = useState('');
  const [officialEmail, setOfficialEmail] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    const payload = {
      full_name: fullName,
      email,
      phone: phone || null,
      password,
      role: selectedRole,
    };

    if (selectedRole === 'FARMER') {
      payload.state = state;
      payload.district = district;
      payload.village = village;
    } else if (selectedRole === 'BUYER') {
      payload.business_name = businessName || `${fullName}'s Agro Enterprise`;
      payload.buyer_type = buyerType;
      payload.state = state;
      payload.district = district;
      payload.preferred_material = preferredMaterial;
    } else if (selectedRole === 'GOVERNMENT') {
      payload.department = department;
      payload.designation = designation;
      payload.state = state;
      payload.district = district;
      payload.employee_id = employeeId || `OFFICER-${Math.floor(1000 + Math.random() * 9000)}`;
      payload.official_email = officialEmail || email;
    }

    try {
      await register(payload);
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card card" style={{ maxWidth: '640px' }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--green-900)' }}>
            Join ParaliPay Platform
          </h2>
          <p style={{ color: 'var(--gray-600)', fontSize: '0.88rem' }}>
            Select your account type to get started.
          </p>
        </div>

        {/* Role Picker */}
        <div className="role-toggle-group" style={{ marginBottom: 24 }}>
          <button
            type="button"
            className={`role-toggle-btn ${selectedRole === 'FARMER' ? 'active' : ''}`}
            onClick={() => setSelectedRole('FARMER')}
          >
            <Wheat size={18} />
            <span>Farmer</span>
          </button>

          <button
            type="button"
            className={`role-toggle-btn ${selectedRole === 'BUYER' ? 'active' : ''}`}
            onClick={() => setSelectedRole('BUYER')}
          >
            <ShoppingBag size={18} />
            <span>Buyer</span>
          </button>

          <button
            type="button"
            className={`role-toggle-btn ${selectedRole === 'GOVERNMENT' ? 'active' : ''}`}
            onClick={() => setSelectedRole('GOVERNMENT')}
          >
            <ShieldAlert size={18} />
            <span>Government</span>
          </button>
        </div>

        {error && (
          <div className="error-box" style={{ marginBottom: 18 }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister}>
          {/* Common Credentials */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Jaswant Singh"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-input"
                placeholder="e.g. +91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="e.g. name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password (min 8 chars)</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Role-Specific Fields */}
          {selectedRole === 'FARMER' && (
            <div className="role-specific-box">
              <div style={{ fontWeight: 700, marginBottom: 10, fontSize: '0.85rem', color: 'var(--green-800)' }}>
                🌾 Farmer Parcel Location
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">State</label>
                  <select className="form-select" value={state} onChange={(e) => setState(e.target.value)}>
                    <option value="Punjab">Punjab</option>
                    <option value="Haryana">Haryana</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">District</label>
                  <select className="form-select" value={district} onChange={(e) => setDistrict(e.target.value)}>
                    <option value="Ludhiana">Ludhiana</option>
                    <option value="Patiala">Patiala</option>
                    <option value="Bathinda">Bathinda</option>
                    <option value="Jalandhar">Jalandhar</option>
                    <option value="Sangrur">Sangrur</option>
                    <option value="Karnal">Karnal</option>
                    <option value="Ambala">Ambala</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Village / Tehsil</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Sahnewal, Ludhiana"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                />
              </div>
            </div>
          )}

          {selectedRole === 'BUYER' && (
            <div className="role-specific-box">
              <div style={{ fontWeight: 700, marginBottom: 10, fontSize: '0.85rem', color: 'var(--blue-700)' }}>
                🏢 Buyer Business Profile
              </div>
              <div className="form-group">
                <label className="form-label">Business / Enterprise Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Malwa Bio-Energy Briquetting Works"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Buyer Type</label>
                  <select className="form-select" value={buyerType} onChange={(e) => setBuyerType(e.target.value)}>
                    <option value="Biomass Aggregator">Biomass Aggregator</option>
                    <option value="Pellet Mill">Pellet Mill</option>
                    <option value="Thermal Power Plant">Thermal Power Plant</option>
                    <option value="Bio-CNG Facility">Bio-CNG Facility</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Operating District</label>
                  <select className="form-select" value={district} onChange={(e) => setDistrict(e.target.value)}>
                    <option value="Ludhiana">Ludhiana</option>
                    <option value="Patiala">Patiala</option>
                    <option value="Bathinda">Bathinda</option>
                    <option value="Karnal">Karnal</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {selectedRole === 'GOVERNMENT' && (
            <div className="role-specific-box" style={{ background: '#fef3c7', borderColor: '#fde68a' }}>
              <div style={{ fontWeight: 700, marginBottom: 6, fontSize: '0.85rem', color: '#92400e' }}>
                🏛️ Official Government Officer Verification
              </div>
              <p style={{ fontSize: '0.78rem', color: '#b45309', marginBottom: 12 }}>
                Note: Government accounts start as <strong>PENDING</strong> and require manual approval from Super Admin.
              </p>
              <div className="form-group">
                <label className="form-label">Department / Agency</label>
                <input
                  type="text"
                  className="form-input"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Designation / Role</label>
                  <input
                    type="text"
                    className="form-input"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Employee / Officer ID</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. PB-AGRI-2024-889"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Official Govt Email</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="e.g. officer@punjab.gov.in"
                  value={officialEmail}
                  onChange={(e) => setOfficialEmail(e.target.value)}
                />
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: 16 }}>
            <UserPlus size={18} />
            {loading ? 'Creating Account…' : `Register as ${selectedRole}`}
          </button>
        </form>

        {loading && <LoadingSpinner message="Creating account..." />}

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: '0.85rem' }}>
          Already registered?{' '}
          <button
            onClick={onSwitchToLogin}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--green-700)',
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Sign in here
          </button>
        </div>
      </div>
    </div>
  );
}
