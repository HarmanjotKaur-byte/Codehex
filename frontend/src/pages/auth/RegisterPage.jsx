import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import LocationSelector from '../../components/LocationSelector';

export default function RegisterPage({ onNavigateLogin, initialRole, onNavigateBack }) {
  const { register } = useAuth();
  const { t } = useLanguage();
  const [role, setRole] = useState(initialRole || 'FARMER'); // FARMER, BUYER
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Location fields
  const [selectedState, setSelectedState] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedVillage, setSelectedVillage] = useState(null);

  // Buyer fields
  const [businessName, setBusinessName] = useState('');
  const [buyerType, setBuyerType] = useState('Biomass Aggregator');
  const [preferredMaterial, setPreferredMaterial] = useState('Paddy Straw Bales');

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError(t('auth.passwordMinLength'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('auth.passwordsMismatch'));
      return;
    }

    if (!selectedState || !selectedDistrict) {
      setError("Please select a state and district.");
      return;
    }
    
    if (role === 'FARMER' && (!selectedVillage || (typeof selectedVillage === 'string' && !selectedVillage.trim()))) {
      setError("Please enter your village name.");
      return;
    }

    const payload = {
      full_name: fullName,
      email,
      phone: phone || undefined,
      password,
      role,
      state: selectedState.name,
      district: selectedDistrict.name,
      state_id: selectedState.id,
      district_id: selectedDistrict.id,
    };

    if (role === 'FARMER') {
      const villageName = typeof selectedVillage === 'object' && selectedVillage !== null 
        ? selectedVillage.name 
        : selectedVillage;
      payload.village = (villageName || '').trim();
      payload.village_id = typeof selectedVillage === 'object' && selectedVillage !== null 
        ? selectedVillage.id 
        : null;
    } else if (role === 'BUYER') {
      payload.business_name = businessName || `${fullName}'s Biomass Enterprise`;
      payload.buyer_type = buyerType;
      payload.preferred_material = preferredMaterial;
    }

    setLoading(true);
    try {
      await register(payload);
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card auth-card-wide">
        <div className="auth-header">
          <div className="auth-badge">{t('auth.userRegistration')}</div>
          <h2 className="auth-title">{t('common.appName')} - {t('auth.createAccountBtn')}</h2>
          <p className="auth-subtitle">
            {t('auth.chooseRole')}
          </p>
        </div>

        {error && <div className="auth-error-banner">{error}</div>}

        <div className="role-selector-pills">
          <button
            type="button"
            className={`role-pill-btn ${role === 'FARMER' ? 'active' : ''}`}
            onClick={() => setRole('FARMER')}
          >
            🌾 {t('roles.FARMER')}
          </button>
          <button
            type="button"
            className={`role-pill-btn ${role === 'BUYER' ? 'active' : ''}`}
            onClick={() => setRole('BUYER')}
          >
            🏭 Biomass Buyer
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Gurpreet Singh"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-input"
                placeholder="e.g. gurpreet@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              className="form-input"
              placeholder="e.g. 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <LocationSelector 
            selectedState={selectedState} 
            setSelectedState={setSelectedState}
            selectedDistrict={selectedDistrict}
            setSelectedDistrict={setSelectedDistrict}
            selectedVillage={selectedVillage}
            setSelectedVillage={setSelectedVillage}
            showVillage={false}
          />

          {/* Role specific profile fields */}
          {role === 'FARMER' && (
            <div className="role-specific-section">
              <div className="section-tag">LOCATION</div>
              <div className="notice-box-amber" style={{ marginBottom: '15px' }}>
                📍 Location is used to link your profile to stubble availability in the region.
              </div>
              <div className="form-group">
                <label className="form-label">{t('location.villageLabel') || 'Village *'}</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    className="form-input"
                    disabled={!selectedDistrict}
                    placeholder={
                      !selectedDistrict 
                        ? (t('location.selectDistrictFirst') || 'Select District first...') 
                        : (t('location.enterVillage') || 'Enter your village name (e.g. Rampur)')
                    }
                    value={selectedVillage || ''}
                    onChange={(e) => setSelectedVillage(e.target.value)}
                    style={{
                      flex: 1,
                      backgroundColor: !selectedDistrict ? '#f3f4f6' : '#fff',
                      cursor: !selectedDistrict ? 'not-allowed' : 'text',
                      opacity: !selectedDistrict ? 0.7 : 1
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!navigator.geolocation) {
                        setError(t('location.unavailable') || 'Unable to determine your location.');
                        return;
                      }
                      setLoading(true);
                      navigator.geolocation.getCurrentPosition(
                        async (pos) => {
                          try {
                            const { latitude, longitude } = pos.coords;
                            const resp = await fetch(
                              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
                            );
                            const data = await resp.json();
                            const village = data.address.village || data.address.town || data.address.city || data.address.county;
                            if (village) {
                              setSelectedVillage(village);
                              setError(null);
                            } else {
                              setError(t('location.unavailable') || 'Unable to determine your location. Please enter manually.');
                            }
                          } catch (e) {
                            setError(t('location.fetchError') || 'Error fetching location.');
                          } finally {
                            setLoading(false);
                          }
                        },
                        (err) => {
                          let msg = 'Unable to determine your location.';
                          if (err.code === err.PERMISSION_DENIED) msg = 'Location permission denied.';
                          else if (err.code === err.TIMEOUT) msg = 'Location request timed out.';
                          setError(t('location.error') || msg);
                          setLoading(false);
                        },
                        { timeout: 10000 }
                      );
                    }}
                    disabled={!selectedDistrict || loading}
                    className="btn btn-secondary"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px',
                      padding: '0 15px',
                      whiteSpace: 'nowrap',
                      backgroundColor: (!selectedDistrict || loading) ? '#e5e7eb' : '#f0fdf4',
                      color: (!selectedDistrict || loading) ? '#9ca3af' : '#166534',
                      border: `1px solid ${(!selectedDistrict || loading) ? '#d1d5db' : '#bbf7d0'}`,
                      borderRadius: '8px',
                      cursor: (!selectedDistrict || loading) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '4px'}}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    {loading ? (t('location.loading') || 'Loading...') : (t('location.useMyLocation') || 'Use My Location / ਮੇਰੀ ਲੋਕੇਸ਼ਨ ਵਰਤੋ')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {role === 'BUYER' && (
            <div className="role-specific-section">
              <div className="section-tag">Commercial Enterprise Details</div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Business Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Punjab Bio-Pellets Ltd"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Buyer Type</label>
                  <select
                    className="form-input"
                    value={buyerType}
                    onChange={(e) => setBuyerType(e.target.value)}
                  >
                    <option value="Biomass Power Plant">Biomass Power Plant</option>
                    <option value="Biomass Aggregator">Biomass Aggregator</option>
                    <option value="Bio-CNG Producer">Bio-CNG Producer</option>
                    <option value="Paper & Pulp Mill">Paper & Pulp Mill</option>
                    <option value="Packaging Manufacturer">Packaging Manufacturer</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Preferred Material</label>
                <input
                  type="text"
                  className="form-input"
                  value={preferredMaterial}
                  onChange={(e) => setPreferredMaterial(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Password (min 8 chars) *</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit-btn"
            disabled={loading}
          >
            {loading ? <LoadingSpinner text="Creating Account..." /> : role === "FARMER" ? "Create Farmer / Seller Account" : "Create Biomass Buyer Account"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <button
              type="button"
              className="auth-link-btn"
              onClick={onNavigateLogin}
            >
              Sign In
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
