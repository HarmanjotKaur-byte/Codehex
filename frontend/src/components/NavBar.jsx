import { 
  LayoutDashboard, Wheat, Flame, Users, ShoppingBag, PackagePlus, 
  Bell, X, Search, MapPin, Handshake, Bookmark, UserPlus, Activity
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function NavBar({ role, active, onChange, isOpen, onClose }) {
  const { t } = useLanguage();

  const FARMER_TABS = [
    { id: 'dashboard',  label: t('nav.farmerDashboard') || 'Dashboard', Icon: LayoutDashboard },
    { id: 'stubble',    label: t('nav.stubbleEstimate') || 'Stubble Estimate', Icon: Wheat },
    { id: 'risk',       label: t('nav.burningRisk') || 'Burning Risk', Icon: Flame },
    { id: 'buyers',     label: t('nav.findBuyers') || 'Find Buyers', Icon: Users },
    { id: 'create-listing', label: 'Create Listing', Icon: PackagePlus },
    { id: 'activity',   label: t('nav.activityFeed') || 'Activity Feed', Icon: Bell },
  ];

  const BUYER_TABS = [
    { id: 'dashboard',      label: 'Dashboard', Icon: LayoutDashboard },
    { id: 'find_residue',   label: 'Find Residue', Icon: Search },
    { id: 'nearby',         label: 'Nearby Listings', Icon: MapPin },
    { id: 'browse_all',     label: 'Browse All Listings', Icon: ShoppingBag },
    { id: 'my_deals',       label: 'My Deals', Icon: Handshake },
    { id: 'saved',          label: 'Saved Listings', Icon: Bookmark },
    { id: 'register_interest', label: 'Register Interest', Icon: UserPlus },
    { id: 'my_activity',    label: 'My Activity', Icon: Activity },
  ];

  const tabs = (role === 'BUYER' || role === 'buyer') ? BUYER_TABS : FARMER_TABS;

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'show' : ''}`} onClick={onClose}></div>
      <aside className={`site-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header mobile-only">
          <span className="sidebar-title">Menu</span>
          <button className="close-sidebar-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <nav className="sidebar-nav">
          {tabs.map(({ id, label, Icon }) => (
            <button
              key={id}
              className={`sidebar-link ${active === id ? 'active' : ''}`}
              onClick={() => {
                onChange(id);
                onClose();
              }}
            >
              <Icon size={20} className="sidebar-icon" />
              <span className="sidebar-text">{label}</span>
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
}
