import re

filepath = r"D:\Hackathon\CodeHex-AI-Enabled-Platform-for-Connecting-Farmers-with-Biomass-Buyers-to-Reduce-Paddy-Stubble-Burni\frontend\src\components\Header.jsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Make sure we add User icon
content = content.replace(
    "import { LogOut, Menu, X, Wheat } from 'lucide-react';",
    "import { LogOut, Menu, X, Wheat, User, ChevronDown } from 'lucide-react';"
)

# Add profile dropdown state
content = content.replace(
    "const { t } = useLanguage();",
    "const { t } = useLanguage();\n  const [profileOpen, setProfileOpen] = useState(false);\n  const [showProfileModal, setShowProfileModal] = useState(false);"
)

# Replace header-right
new_header_right = """
        <div className="header-right">
          <LanguageSelector />

          {isAuthenticated && currentUser && (
            <div className="header-user-info" style={{ position: 'relative' }}>
              <div 
                className="profile-trigger" 
                onClick={() => setProfileOpen(!profileOpen)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '4px 8px', borderRadius: '8px', border: '1px solid var(--gray-200)' }}
              >
                <div style={{ background: 'var(--green-100)', color: 'var(--green-700)', padding: '6px', borderRadius: '50%' }}>
                  <User size={16} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--gray-800)' }}>{currentUser.full_name}</span>
                  <span style={{ fontSize: '11px', color: 'var(--gray-500)' }}>{t(`roles.${currentUser.role}`) || currentUser.role}</span>
                </div>
                <ChevronDown size={16} color="var(--gray-500)" style={{ marginLeft: '4px' }} />
              </div>

              {profileOpen && (
                <div className="profile-dropdown" style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: '8px', background: 'white', border: '1px solid var(--gray-200)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '200px', zIndex: 1000
                }}>
                  <div 
                    onClick={() => { setProfileOpen(false); setShowProfileModal(true); }}
                    style={{ padding: '12px 16px', borderBottom: '1px solid var(--gray-100)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'var(--gray-50)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                  >
                    <User size={16} color="var(--gray-600)" />
                    <span style={{ fontSize: '14px', color: 'var(--gray-700)' }}>View Profile</span>
                  </div>
                  <div 
                    onClick={() => { setProfileOpen(false); logout(); }}
                    style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626' }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'var(--gray-50)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                  >
                    <LogOut size={16} />
                    <span style={{ fontSize: '14px' }}>{t('common.logout') || 'Logout'}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showProfileModal && currentUser && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000}}>
          <div className="card" style={{width: 400, padding: 24, position: 'relative'}}>
            <button onClick={() => setShowProfileModal(false)} style={{position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer'}}>
              <X size={20} color="var(--gray-500)" />
            </button>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ width: 64, height: 64, background: 'var(--green-100)', color: 'var(--green-700)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <User size={32} />
              </div>
              <h3 style={{ margin: '0 0 4px', fontSize: '20px' }}>{currentUser.full_name}</h3>
              <span className={`role-badge ${getRoleBadgeClass(currentUser.role)}`}>
                {t(`roles.${currentUser.role}`) || currentUser.role}
              </span>
            </div>
            
            <div style={{ display: 'grid', gap: '12px', background: 'var(--gray-50)', padding: '16px', borderRadius: '8px' }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginBottom: '2px' }}>Phone Number</div>
                <div style={{ fontSize: '14px', color: 'var(--gray-800)', fontWeight: '500' }}>{currentUser.phone || 'N/A'}</div>
              </div>
              {currentUser.email && (
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginBottom: '2px' }}>Email Address</div>
                  <div style={{ fontSize: '14px', color: 'var(--gray-800)', fontWeight: '500' }}>{currentUser.email}</div>
                </div>
              )}
              {currentUser.state && (
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginBottom: '2px' }}>Location</div>
                  <div style={{ fontSize: '14px', color: 'var(--gray-800)', fontWeight: '500' }}>{currentUser.district}, {currentUser.state}</div>
                </div>
              )}
            </div>
            
            <button onClick={logout} className="btn btn-secondary" style={{ width: '100%', marginTop: '20px', color: '#dc2626', borderColor: '#fca5a5' }}>
              <LogOut size={16} style={{ marginRight: '8px' }} /> {t('common.logout') || 'Logout'}
            </button>
          </div>
        </div>
      )}
"""

start_str = '        <div className="header-right">'
end_str = '      </div>\n    </header>'
start_idx = content.find(start_str)
end_idx = content.find(end_str)
if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + new_header_right + content[end_idx:]

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated Header.jsx with new Profile section")
