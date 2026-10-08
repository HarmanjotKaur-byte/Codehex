import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Search, 
  MapPin, 
  ShoppingBag, 
  Handshake, 
  Bookmark, 
  UserPlus, 
  Activity, 
  ArrowRight, 
  ShieldCheck 
} from 'lucide-react';

export default function BuyerDashboard({ setTab }) {
  const { currentUser } = useAuth();
  const [hoveredCard, setHoveredCard] = useState(null);

  const cards = [
    {
      id: 'find_residue',
      title: 'Find Residue',
      description: 'Search farmer residue listings using your requirements such as residue type, quantity, location and preferences.',
      cta: 'Search Residue',
      Icon: Search,
      bg: '#dcfce7',
      color: '#166534'
    },
    {
      id: 'nearby',
      title: 'Nearby Listings',
      description: 'Show farmer listings based on your location and distance preferences for reduced transit cost.',
      cta: 'View Nearby',
      Icon: MapPin,
      bg: '#e0f2fe',
      color: '#0369a1'
    },
    {
      id: 'browse_all',
      title: 'Browse All Listings',
      description: 'Explore all active farmer biomass listings across all regions without preference filtering.',
      cta: 'Browse Listings',
      Icon: ShoppingBag,
      bg: '#fef3c7',
      color: '#b45309'
    },
    {
      id: 'my_deals',
      title: 'My Deals',
      description: 'Track agreed biomass deals, confirmed contracts, and direct contact details of partnering farmers.',
      cta: 'View Deals',
      Icon: Handshake,
      bg: '#dbeafe',
      color: '#1d4ed8'
    },
    {
      id: 'saved',
      title: 'Saved Listings',
      description: 'Access farmer listings you have bookmarked for quick review and future procurement.',
      cta: 'View Saved',
      Icon: Bookmark,
      bg: '#fce7f3',
      color: '#be185d'
    },
    {
      id: 'register_interest',
      title: 'Register Interest',
      description: 'Create or update your certified buyer profile and purchasing requirements so farmers can discover you.',
      cta: 'Register Profile',
      Icon: UserPlus,
      bg: '#dcfce7',
      color: '#15803d'
    },
    {
      id: 'my_activity',
      title: 'My Activity',
      description: 'Track incoming farmer inquiries & interests and review all contact requests you have sent.',
      cta: 'View Activity',
      Icon: Activity,
      bg: '#ede9fe',
      color: '#6d28d9'
    }
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '10px' }}>
      {/* Hero / Welcome Section */}
      <div style={{ 
        backgroundColor: '#166534', 
        borderRadius: '12px', 
        padding: '30px', 
        color: 'white',
        marginBottom: '30px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '24px', fontWeight: 'bold' }}>
          Welcome back, {currentUser?.full_name || 'Buyer'}!
        </h1>
        <p style={{ margin: 0, opacity: 0.9, fontSize: '16px', maxWidth: '650px' }}>
          Source agricultural residues efficiently. Connect directly with verified farmers, browse active stubble listings, track your procurement deals, and manage inquiries in real-time.
        </p>
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
          Quick Actions
        </h2>
      </div>

      {/* Features Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        {cards.map((c) => {
          const isHovered = hoveredCard === c.id;
          return (
            <div 
              key={c.id} 
              style={{
                ...cardStyle,
                transform: isHovered ? 'translateY(-3px)' : 'none',
                boxShadow: isHovered ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' : '0 1px 3px rgba(0,0,0,0.1)',
                borderColor: isHovered ? '#bbf7d0' : '#e5e7eb'
              }}
              onMouseEnter={() => setHoveredCard(c.id)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => setTab && setTab(c.id)}
            >
              <div style={{ ...iconWrapperStyle, backgroundColor: c.bg, color: c.color }}>
                <c.Icon size={24} />
              </div>
              <h3 style={cardTitleStyle}>{c.title}</h3>
              <p style={cardDescStyle}>{c.description}</p>
              <button 
                style={actionBtnStyle} 
                onClick={(e) => {
                  e.stopPropagation();
                  if (setTab) setTab(c.id);
                }}
              >
                {c.cta} <ArrowRight size={16} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Info Banner */}
      <div style={{ 
        backgroundColor: '#f8fafc', 
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px'
      }}>
        <ShieldCheck size={20} color="#0f172a" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 'bold', color: '#0f172a' }}>
            Verified Procurement Network
          </h4>
          <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: '1.4' }}>
            ParaliPay ensures direct connectivity between certified buyers and verified farmers. Transparent pricing, reliable stubble sourcing, and secure agreements to prevent crop residue burning.
          </p>
        </div>
      </div>
    </div>
  );
}

// Styles matching Farmer Dashboard
const cardStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  padding: '24px',
  border: '1px solid #e5e7eb',
  display: 'flex',
  flexDirection: 'column',
  cursor: 'pointer',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
};

const iconWrapperStyle = {
  width: '48px',
  height: '48px',
  borderRadius: '10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '16px'
};

const cardTitleStyle = {
  margin: '0 0 8px 0',
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#111827'
};

const cardDescStyle = {
  margin: '0 0 20px 0',
  fontSize: '14px',
  color: '#4b5563',
  lineHeight: '1.5',
  flexGrow: 1
};

const actionBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  background: 'none',
  border: 'none',
  color: '#166534',
  fontWeight: '600',
  fontSize: '14px',
  padding: 0,
  cursor: 'pointer'
};
