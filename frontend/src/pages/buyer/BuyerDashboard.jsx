import { useState, useEffect } from 'react';
import { Package, Users, DollarSign, CheckCircle2, AlertCircle } from 'lucide-react';
import { DEMO_MARKETPLACE_LISTINGS } from '../../services/marketplace';
import { getBuyers } from '../../services/api';

export default function BuyerDashboard() {
  const [buyersCount, setBuyersCount] = useState(null);

  useEffect(() => {
    getBuyers()
      .then(data => {
        if (Array.isArray(data)) {
          setBuyersCount(data.length);
        }
      })
      .catch(() => {
        setBuyersCount(null);
      });
  }, []);

  // Compute metrics from demo marketplace listings
  const totalStubble = DEMO_MARKETPLACE_LISTINGS.reduce((sum, item) => sum + item.stubble_quantity_tonnes, 0);
  const activeListings = DEMO_MARKETPLACE_LISTINGS.filter(item => item.is_available);
  const avgPrice = activeListings.length > 0 
    ? Math.round(activeListings.reduce((sum, item) => sum + item.asking_price_per_tonne, 0) / activeListings.length)
    : null;

  return (
    <div>
      <div className="page-header">
        <h2>💼 Buyer Procurement Dashboard</h2>
        <p>Monitor available paddy stubble supply, active farmer listings, and procurement opportunities.</p>
      </div>

      <div className="info-banner" style={{ marginBottom: 24 }}>
        <AlertCircle size={18} />
        <span>
          <strong>Notice:</strong> Listings in this section represent <em>Demo Marketplace Listings</em> for prototype demonstration. Transaction data is not fabricated.
        </span>
      </div>

      {/* 4 Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: 'var(--green-100)', color: 'var(--green-700)' }}>
            <Package size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Available Stubble</span>
            <span className="stat-value">{totalStubble.toFixed(1)} t</span>
            <span className="stat-sub">Across 6 regional listings</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: 'var(--blue-100)', color: 'var(--blue-600)' }}>
            <Users size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Nearby Farmer Listings</span>
            <span className="stat-value">{DEMO_MARKETPLACE_LISTINGS.length}</span>
            <span className="stat-sub">{activeListings.length} actively available</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: 'var(--amber-100)', color: 'var(--amber-600)' }}>
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Average Asking Price</span>
            <span className="stat-value">₹{avgPrice ? avgPrice.toLocaleString() : 'N/A'}/t</span>
            <span className="stat-sub">Baseline benchmark: ₹2,500/t</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: '#f3e8ff', color: '#7e22ce' }}>
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Suitable Listings</span>
            <span className="stat-value">{activeListings.length}</span>
            <span className="stat-sub">Actively accepting purchase offers</span>
          </div>
        </div>
      </div>

      {/* Procurement Process Explanation */}
      <div className="card" style={{ marginTop: 28 }}>
        <div className="card-title">Biomass Procurement Workflow</div>
        <div className="card-subtitle">Transparent supply chain from field baling to boiler intake</div>

        <div className="procurement-steps">
          <div className="step-item">
            <div className="step-num">1</div>
            <div>
              <strong>Discover Stubble</strong>
              <p>Browse nearby listings filtered by district, minimum batch size, and procurement radius.</p>
            </div>
          </div>
          <div className="step-item">
            <div className="step-num">2</div>
            <div>
              <strong>Transparent Scoring</strong>
              <p>Evaluate listings based on verified distance (35%), price (35%), volume (20%), and availability (10%).</p>
            </div>
          </div>
          <div className="step-item">
            <div className="step-num">3</div>
            <div>
              <strong>Express Interest</strong>
              <p>Signal intent to purchase directly to the farmer without predatory intermediaries or fees.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
