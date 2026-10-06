import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon } from 'lucide-react';

export default function Header() {
  const { currentUser, logout, isAuthenticated } = useAuth();

  const getRoleLabel = () => {
    if (!currentUser) return null;
    if (currentUser.role === 'FARMER') return 'Farmer';
    if (currentUser.role === 'BUYER') return 'Biomass Buyer';
    if (currentUser.role === 'GOVERNMENT') return 'Government Officer';
    if (currentUser.role === 'SUPER_ADMIN') return 'Super Administrator';
    return currentUser.role;
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="logo">
          <span className="logo-icon">🌾</span>
          <div>
            <div>ParaliPay</div>
            <div className="logo-tagline">AI Stubble Management & Marketplace Platform</div>
          </div>
        </div>

        {isAuthenticated && currentUser && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>{currentUser.full_name}</div>
                <div style={{ fontSize: '0.72rem', opacity: 0.85 }}>{getRoleLabel()}</div>
              </div>
              <span className="role-badge">
                <UserIcon size={12} style={{ display: 'inline', marginRight: 4 }} />
                {currentUser.role}
              </span>
            </div>

            <button
              className="btn btn-secondary switch-role-btn"
              onClick={logout}
              title="Sign out of current account"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
