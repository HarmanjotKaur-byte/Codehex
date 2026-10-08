import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Calculator, Flame, Users, Activity, ArrowRight, ShieldCheck, PackagePlus } from 'lucide-react';

export default function Dashboard({ setTab }) {
  const { t } = useLanguage();
  const { currentUser } = useAuth();

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
          Welcome back, {currentUser?.full_name || 'Farmer'}!
        </h1>
        <p style={{ margin: 0, opacity: 0.9, fontSize: '16px', maxWidth: '600px' }}>
          {t('farmer.dashboardSubtitle', 'Manage your agricultural residues efficiently. Estimate your paddy stubble production and connect with certified biomass buyers across the region.')}
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
        {/* Card 1 */}
        <div style={cardStyle} onClick={() => setTab('stubble')}>
          <div style={{...iconWrapperStyle, backgroundColor: '#dcfce7', color: '#166534'}}>
            <Calculator size={24} />
          </div>
          <h3 style={cardTitleStyle}>{t('farmer.estimateCardTitle', 'Estimate Stubble')}</h3>
          <p style={cardDescStyle}>
            {t('farmer.estimateCardDesc', 'Calculate the estimated tonnage of paddy stubble your field will produce based on area and location.')}
          </p>
          <button style={actionBtnStyle}>
            Start Estimate <ArrowRight size={16} />
          </button>
        </div>

        {/* Card 2 */}
        <div style={cardStyle} onClick={() => setTab('buyers')}>
          <div style={{...iconWrapperStyle, backgroundColor: '#fef3c7', color: '#b45309'}}>
            <Users size={24} />
          </div>
          <h3 style={cardTitleStyle}>{t('farmer.matchingCardTitle', 'Find Biomass Buyers')}</h3>
          <p style={cardDescStyle}>
            {t('farmer.matchingCardDesc', 'Connect with verified biomass power plants, bio-CNG producers, and aggregators near your location.')}
          </p>
          <button style={actionBtnStyle}>
            View Buyers <ArrowRight size={16} />
          </button>
        </div>

        {/* Card 3 */}
        <div style={cardStyle} onClick={() => setTab('risk')}>
          <div style={{...iconWrapperStyle, backgroundColor: '#fee2e2', color: '#991b1b'}}>
            <Flame size={24} />
          </div>
          <h3 style={cardTitleStyle}>{t('farmer.riskCardTitle', 'Check Burning Risk')}</h3>
          <p style={cardDescStyle}>
            {t('farmer.riskCardDesc', 'View the stubble burning risk assessment for your grid area based on real-time satellite monitoring.')}
          </p>
          <button style={actionBtnStyle}>
            Check Risk <ArrowRight size={16} />
          </button>
        </div>

        {/* Card 4 */}
        <div style={cardStyle} onClick={() => setTab('activity')}>
          <div style={{...iconWrapperStyle, backgroundColor: '#e0e7ff', color: '#3730a3'}}>
            <Activity size={24} />
          </div>
          <h3 style={cardTitleStyle}>My Activity</h3>
          <p style={cardDescStyle}>
            Review your past stubble estimates, buyer matches, and transaction history on the platform.
          </p>
          <button style={actionBtnStyle}>
            View History <ArrowRight size={16} />
          </button>
        </div>

        {/* Card 5 */}
        <div style={cardStyle} onClick={() => setTab('create-listing')}>
          <div style={{...iconWrapperStyle, backgroundColor: '#f3e8ff', color: '#6b21a8'}}>
            <PackagePlus size={24} />
          </div>
          <h3 style={cardTitleStyle}>Create New Listing</h3>
          <p style={cardDescStyle}>
            List your available stubble on the marketplace so buyers can discover and purchase directly from you.
          </p>
          <button style={actionBtnStyle}>
            Create Listing <ArrowRight size={16} />
          </button>
        </div>
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
          <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 'bold', color: '#0f172a' }}>Platform Security</h4>
          <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: '1.4' }}>
            ParaliPay ensures all buyer connections are verified. Your farm data is kept private and only shared with buyers you choose to contact.
          </p>
        </div>
      </div>
    </div>
  );
}

// Styles
const cardStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  padding: '24px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  border: '1px solid #e5e7eb',
  display: 'flex',
  flexDirection: 'column',
  cursor: 'pointer',
  transition: 'transform 0.2s, box-shadow 0.2s',
  ':hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  }
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
