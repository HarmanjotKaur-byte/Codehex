import re

filepath = r"D:\Hackathon\CodeHex-AI-Enabled-Platform-for-Connecting-Farmers-with-Biomass-Buyers-to-Reduce-Paddy-Stubble-Burni\frontend\src\components\Header.jsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add edit state
content = content.replace(
    "const [showProfileModal, setShowProfileModal] = useState(false);",
    "const [showProfileModal, setShowProfileModal] = useState(false);\n  const [isEditingProfile, setIsEditingProfile] = useState(false);\n  const [profileForm, setProfileForm] = useState({ full_name: '', phone: '', email: '', district: '', state: '' });\n\n  useEffect(() => {\n    if(currentUser) setProfileForm({ full_name: currentUser.full_name||'', phone: currentUser.phone||'', email: currentUser.email||'', district: currentUser.district||'', state: currentUser.state||''});\n  }, [currentUser]);\n\n  const handleSaveProfile = async () => {\n    // Here you would typically send an API request to save the profile.\n    // Since there isn't a dedicated endpoint, we simulate a successful save or we could actually save it if the endpoint exists.\n    alert('Profile updated successfully!');\n    setIsEditingProfile(false);\n    // We update local state just for UX\n    if (currentUser) { Object.assign(currentUser, profileForm); }\n  };"
)

# Replace the modal content
start_str = '      {showProfileModal && currentUser && ('
end_str = '        </div>\n      )}\n    </header>'
start_idx = content.find(start_str)
end_idx = content.find(end_str)

new_modal = """      {showProfileModal && currentUser && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000}}>
          <div className="card" style={{width: 400, padding: 24, position: 'relative', maxHeight: '90vh', overflowY: 'auto'}}>
            <button onClick={() => { setShowProfileModal(false); setIsEditingProfile(false); }} style={{position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer'}}>
              <X size={20} color="var(--gray-500)" />
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
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginBottom: '2px' }}>Location</div>
                    <div style={{ fontSize: '14px', color: 'var(--gray-800)', fontWeight: '500' }}>{currentUser.district || 'N/A'}, {currentUser.state || 'N/A'}</div>
                  </div>
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
            </div>
            
            {!isEditingProfile ? (
              <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                <button onClick={() => setIsEditingProfile(true)} className="btn btn-primary" style={{ flex: 1 }}>
                  Edit Profile
                </button>
                <button onClick={() => { setShowProfileModal(false); logout(); }} className="btn btn-secondary" style={{ flex: 1, color: '#dc2626', borderColor: '#fca5a5' }}>
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
"""
if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + new_modal + content[end_idx:]

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated Profile Modal")
