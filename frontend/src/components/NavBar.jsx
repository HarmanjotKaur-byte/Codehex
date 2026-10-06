import {
  LayoutDashboard,
  Wheat,
  Flame,
  Users,
  ShoppingBag,
  Sliders,
  ShieldAlert,
  Layers,
  Cpu,
  UserCheck,
} from 'lucide-react';

const FARMER_TABS = [
  { id: 'dashboard', label: 'Farmer Dashboard', Icon: LayoutDashboard },
  { id: 'stubble', label: 'Stubble Estimate', Icon: Wheat },
  { id: 'risk', label: 'Burning Risk', Icon: Flame },
  { id: 'buyers', label: 'Find Buyers', Icon: Users },
];

const BUYER_TABS = [
  { id: 'dashboard', label: 'Buyer Dashboard', Icon: LayoutDashboard },
  { id: 'stubble', label: 'Available Stubble', Icon: ShoppingBag },
  { id: 'preferences', label: 'Buyer Preferences', Icon: Sliders },
];

const GOVERNMENT_TABS = [
  { id: 'dashboard', label: 'Government Overview', Icon: LayoutDashboard },
  { id: 'risk', label: 'Burning Risk Monitoring', Icon: ShieldAlert },
  { id: 'availability', label: 'Stubble Availability', Icon: Layers },
  { id: 'models', label: 'Model Transparency', Icon: Cpu },
];

const SUPER_ADMIN_TABS = [
  { id: 'dashboard', label: 'Verification Center', Icon: UserCheck },
  { id: 'risk', label: 'Satellite Risk Monitor', Icon: ShieldAlert },
  { id: 'availability', label: 'Regional Biomass', Icon: Layers },
  { id: 'models', label: 'Model Specifications', Icon: Cpu },
];

export default function NavBar({ role, active, onChange }) {
  let tabs = FARMER_TABS;
  if (role === 'BUYER') tabs = BUYER_TABS;
  if (role === 'GOVERNMENT') tabs = GOVERNMENT_TABS;
  if (role === 'SUPER_ADMIN') tabs = SUPER_ADMIN_TABS;

  return (
    <nav className="site-nav">
      <div className="nav-inner">
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={`nav-btn${active === id ? ' active' : ''}`}
            onClick={() => onChange(id)}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>
    </nav>
  );
}
