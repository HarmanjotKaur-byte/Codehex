import { Wheat, ShoppingBag, ShieldAlert, ArrowRight } from 'lucide-react';

export default function RoleSelector({ onSelect }) {
  return (
    <div className="role-selection-wrapper">
      <div className="role-hero">
        <div className="logo-large">🌾 PARALIPAY</div>
        <h1 className="hero-tagline">Turn Crop Waste Into Value</h1>
        <p className="hero-subtitle">
          An AI-powered agricultural stubble management and marketplace platform connecting farmers, biomass buyers, and government authorities.
        </p>
        <div className="demo-notice-pill">
          💡 Hackathon Prototype — Select a role to explore the interactive workflow
        </div>
      </div>

      <div className="roles-grid">
        {/* Card A: FARMER */}
        <div className="role-card">
          <div className="role-icon-box farmer">
            <Wheat size={36} />
          </div>
          <div className="role-card-badge farmer">AGRICULTURAL PRODUCER</div>
          <h2 className="role-title">FARMER</h2>
          <p className="role-desc">
            Estimate your stubble, assess burning risk, and find buyers.
          </p>
          <ul className="role-features">
            <li>🌾 ML Stubble Quantity Estimation</li>
            <li>🔥 Satellite-based Burning Risk Prediction</li>
            <li>🤝 Transparent Multi-Criteria Buyer Matching</li>
          </ul>
          <button 
            className="btn btn-primary role-btn"
            onClick={() => onSelect('farmer')}
          >
            Continue as Farmer <ArrowRight size={16} />
          </button>
        </div>

        {/* Card B: BUYER */}
        <div className="role-card">
          <div className="role-icon-box buyer">
            <ShoppingBag size={36} />
          </div>
          <div className="role-card-badge buyer">BIOMASS AGGREGATOR / INDUSTRY</div>
          <h2 className="role-title">BUYER</h2>
          <p className="role-desc">
            Find available stubble and connect with farmers.
          </p>
          <ul className="role-features">
            <li>📦 Discover Nearby Stubble Listings</li>
            <li>⚙️ Configure Procurement Preferences</li>
            <li>📩 Express Commercial Interest Instantly</li>
          </ul>
          <button 
            className="btn btn-buyer role-btn"
            onClick={() => onSelect('buyer')}
          >
            Continue as Buyer <ArrowRight size={16} />
          </button>
        </div>

        {/* Card C: ADMIN / GOVERNMENT */}
        <div className="role-card">
          <div className="role-icon-box admin">
            <ShieldAlert size={36} />
          </div>
          <div className="role-card-badge admin">REGULATORY & MONITORING</div>
          <h2 className="role-title">ADMIN / GOVERNMENT</h2>
          <p className="role-desc">
            Monitor stubble availability and regional burning risk.
          </p>
          <ul className="role-features">
            <li>🛰️ Grid-level Satellite Fire Risk Monitoring</li>
            <li>📊 Regional Stubble & Marketplace Overview</li>
            <li>🔍 Audited ML Model Performance & Transparency</li>
          </ul>
          <button 
            className="btn btn-admin role-btn"
            onClick={() => onSelect('admin')}
          >
            Continue as Admin <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
