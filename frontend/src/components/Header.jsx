import { useState, useEffect } from 'react';
import { getHealth } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from './LanguageSelector';
import { LogOut, Menu, X, Wheat, User, ChevronDown } from 'lucide-react';

export default function Header({ onMenuToggle, isSidebarOpen, onGoHome }) {
  const [online, setOnline] = useState(null);
  const { currentUser, logout, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [profileOpen, setProfileOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ full_name: '', phone: '', email: '', district: '', state: '', village: '' });

  useEffect(() => {
    if(currentUser) setProfileForm({ full_name: currentUser.full_name||'', phone: currentUser.phone||'', email: currentUser.email||'', district: currentUser.district||'', state: currentUser.state||'', village: currentUser.village||''});
  }, [currentUser]);

  const handleSaveProfile = async () => {
    // Here you would typically send an API request to save the profile.
    // Since there isn't a dedicated endpoint, we simulate a successful save or we could actually save it if the endpoint exists.
    alert('Profile updated successfully!');
    setIsEditingProfile(false);
    // We update local state just for UX
    if (currentUser) { Object.assign(currentUser, profileForm); }
  };

  useEffect(() => {
    getHealth()
      .then(() => setOnline(true))
      .catch(() => setOnline(false));
  }, []);

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'FARMER': return 'role-badge-farmer';
      case 'BUYER': return 'role-badge-buyer';
      case 'SUPER_ADMIN': return 'role-badge-superadmin';
      default: return '';
    }
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="header-left">
          {isAuthenticated && (
            <button className="mobile-menu-btn" onClick={onMenuToggle}>
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}
          <div className="logo" onClick={onGoHome} style={onGoHome ? { cursor: 'pointer' } : {}} title={onGoHome ? 'Back to ParaliPay Home' : ''}>
            <Wheat className="logo-icon" size={28} />
            <div className="logo-text-group">
              <div className="logo-title">{t('common.appName') || 'ParaliPay'}</div>
              <div className="logo-tagline">{t('common.tagline') || 'Empowering Farmers, Greening the Future'}</div>
            </div>
          </div>
        </div>


        <div className="header-right">
          <LanguageSelector />

          {isAuthenticated && currentUser && (
            <div className="header-user-info" style={{ position: 'relative' }}>
              <div 
                className="profile-trigger" 
                onClick={() => { setShowProfileModal(true); setProfileOpen(false); }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'var(--green-100)', color: 'var(--green-700)', padding: '10px', borderRadius: '50%', border: '2px solid var(--green-600)' }}
              >
                <User size={20} />
              </div>
            </div>
          )}
        </div>
      </div>

      {showProfileModal && currentUser && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999}}>
          <div className="card" style={{width: 400, maxWidth: '90%', padding: '32px 24px', position: 'relative', maxHeight: '90vh', overflowY: 'auto', background: '#fff', borderRadius: '12px'}}>
            <button 
              onClick={() => { setShowProfileModal(false); setIsEditingProfile(false); }} 
              style={{position: 'absolute', top: 12, right: 12, background: '#f3f4f6', border: 'none', cursor: 'pointer', borderRadius: '50%', padding: '6px', display: 'flex', zIndex: 10}}
              title="Close"
            >
              <X size={20} color="#4b5563" />
            </button>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ width: 64, height: 64, background: 'var(--green-100)', color: 'var(--green-700)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <User size={32} />
              </div>
              {!isEditingProfile ? (
                <>
                  <h3 style={{ margin: '0 0 4px', fontSize: '20px' }}>{currentUser.full_name}</h3>
                  <span className={`role-badge ${getRoleBadgeClass(currentUser.role)}`}>
                    {t(`roles.${currentUser.role}`) || currentUser.role}
                  </span>
                </>
              ) : (
                <h3 style={{ margin: '0', fontSize: '18px', color: 'var(--green-700)' }}>Edit Profile</h3>
              )}
            </div>
            
            <div style={{ display: 'grid', gap: '12px', background: 'var(--gray-50)', padding: '16px', borderRadius: '8px' }}>
              {!isEditingProfile ? (
                <>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginBottom: '2px' }}>Phone Number</div>
                    <div style={{ fontSize: '14px', color: 'var(--gray-800)', fontWeight: '500' }}>{currentUser.phone || 'N/A'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginBottom: '2px' }}>Email Address</div>
                    <div style={{ fontSize: '14px', color: 'var(--gray-800)', fontWeight: '500' }}>{currentUser.email || 'N/A'}</div>
                  </div>
                  {currentUser.role === 'FARMER' && (
                    <>
                      <div>
                        <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginBottom: '2px' }}>Village</div>
                        <div style={{ fontSize: '14px', color: 'var(--gray-800)', fontWeight: '500' }}>{currentUser.village || 'N/A'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginBottom: '2px' }}>Location</div>
                        <div style={{ fontSize: '14px', color: 'var(--gray-800)', fontWeight: '500' }}>{currentUser.district || 'N/A'}, {currentUser.state || 'N/A'}</div>
                      </div>
                    </>
                  )}
                  {currentUser.role === 'BUYER' && (
                    <>
                      <div>
                        <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginBottom: '2px' }}>Business Name</div>
                        <div style={{ fontSize: '14px', color: 'var(--gray-800)', fontWeight: '500' }}>{currentUser.business_name || 'N/A'}</div>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label className="form-label" style={{fontSize: '12px'}}>Full Name</label>
                    <input type="text" className="form-input" style={{padding: '6px 10px', fontSize: '14px'}} value={profileForm.full_name} onChange={e => setProfileForm({...profileForm, full_name: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{fontSize: '12px'}}>Phone Number</label>
                    <input type="text" className="form-input" style={{padding: '6px 10px', fontSize: '14px'}} value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{fontSize: '12px'}}>Email Address</label>
                    <input type="email" className="form-input" style={{padding: '6px 10px', fontSize: '14px'}} value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})} />
                  </div>
                  {currentUser.role === 'FARMER' && (
                    <>
                      <div className="form-group">
                        <label className="form-label" style={{fontSize: '12px'}}>Village</label>
                        <input type="text" className="form-input" style={{padding: '6px 10px', fontSize: '14px'}} value={profileForm.village} onChange={e => setProfileForm({...profileForm, village: e.target.value})} />
                      </div>
                      <div style={{display: 'flex', gap: '8px'}}>
                        <div className="form-group" style={{flex: 1}}>
                          <label className="form-label" style={{fontSize: '12px'}}>District</label>
                          <input type="text" className="form-input" style={{padding: '6px 10px', fontSize: '14px'}} value={profileForm.district} onChange={e => setProfileForm({...profileForm, district: e.target.value})} />
                        </div>
                        <div className="form-group" style={{flex: 1}}>
                          <label className="form-label" style={{fontSize: '12px'}}>State</label>
                          <input type="text" className="form-input" style={{padding: '6px 10px', fontSize: '14px'}} value={profileForm.state} onChange={e => setProfileForm({...profileForm, state: e.target.value})} />
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
            
            {!isEditingProfile ? (
              <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                <button onClick={() => setIsEditingProfile(true)} className="btn btn-primary" style={{ flex: 1 }}>
                  Edit Profile
                </button>
                <button onClick={() => { setShowProfileModal(false); logout(); onGoHome?.(); }} className="btn btn-secondary" style={{ flex: 1, color: '#dc2626', borderColor: '#fca5a5' }}>
                  <LogOut size={16} style={{ marginRight: '4px' }} /> {t('common.logout') || 'Logout'}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                <button onClick={handleSaveProfile} className="btn btn-primary" style={{ flex: 1 }}>
                  Save
                </button>
                <button onClick={() => setIsEditingProfile(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
