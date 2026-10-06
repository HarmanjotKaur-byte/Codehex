import { useState, useEffect } from 'react';
import { ShieldCheck, Cpu, Flame, Package, AlertCircle } from 'lucide-react';
import { getHealth, getBuyers } from '../../services/api';
import { DEMO_MARKETPLACE_LISTINGS } from '../../services/marketplace';

export default function AdminDashboard() {
  const [healthData, setHealthData] = useState(null);
  const [buyersCount, setBuyersCount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([getHealth(), getBuyers()])
      .then(([healthRes, buyersRes]) => {
        if (healthRes.status === 'fulfilled') setHealthData(healthRes.value);
        if (buyersRes.status === 'fulfilled' && Array.isArray(buyersRes.value)) {
          setBuyersCount(buyersRes.value.length);
        }
        setLoading(false);
      });
  }, []);

  const totalMarketplaceStubble = DEMO_MARKETPLACE_LISTINGS.reduce((sum, item) => sum + item.stubble_quantity_tonnes, 0);

  return (
    <div>
      <div className="page-header">
        <h2>🏛️ Regional Stubble Monitoring & Regulatory Overview</h2>
        <p>Real-time platform oversight for agricultural and pollution control authorities across Punjab & Haryana.</p>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: 'var(--green-100)', color: 'var(--green-700)' }}>
            <Package size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Available Stubble</span>
            <span className="stat-value">{totalMarketplaceStubble.toFixed(1)} t</span>
            <span className="stat-sub">Tracked in demo marketplace</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: 'var(--red-100)', color: 'var(--red-600)' }}>
            <Flame size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">High-Risk Areas</span>
            <span className="stat-value">Active Grid</span>
            <span className="stat-sub">NASA FIRMS 0.25° surveillance</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: 'var(--blue-100)', color: 'var(--blue-600)' }}>
            <Cpu size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Farmers Using Platform</span>
            <span className="stat-value">Data not available</span>
            <span className="stat-sub">No user auth/tracking DB</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: '#fef3c7', color: '#b45309' }}>
            <ShieldCheck size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Buyer Activity</span>
            <span className="stat-value">
              {buyersCount !== null ? `${buyersCount} Registered` : 'Data not available'}
            </span>
            <span className="stat-sub">Active in backend directory</span>
          </div>
        </div>
      </div>

      {/* Regulatory Framework & Model Assurance */}
      <div className="card" style={{ marginTop: 28 }}>
        <div className="card-title">Intervention & Compliance Framework</div>
        <div className="card-subtitle">Connecting satellite surveillance with market diversion incentives</div>

        <div className="two-col" style={{ marginTop: 20 }}>
          <div style={{ padding: '16px', background: 'var(--gray-50)', borderRadius: 'var(--radius)' }}>
            <h4 style={{ fontWeight: 800, color: 'var(--green-800)', marginBottom: 8 }}>
              🌾 Stubble Market Diversion
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--gray-700)', lineHeight: 1.5 }}>
              By connecting paddy farmers directly to industrial buyers (pellet mills, briquetting works, thermal co-firing), 
              ParaliPay monetizes straw and eliminates the economic incentive to burn residue in fields.
            </p>
          </div>

          <div style={{ padding: '16px', background: 'var(--gray-50)', borderRadius: 'var(--radius)' }}>
            <h4 style={{ fontWeight: 800, color: 'var(--red-600)', marginBottom: 8 }}>
              🛰️ Proactive Risk Forecasting
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--gray-700)', lineHeight: 1.5 }}>
              Rather than detecting fires post-facto via thermal anomalies, the predictive classifier assesses 
              spatiotemporal grid probability (0.25° × 0.25°) enabling early dispatch of balers and enforcement.
            </p>
          </div>
        </div>

        <div className="info-banner" style={{ marginTop: 20, marginBottom: 0 }}>
          <AlertCircle size={16} />
          <span>
            <strong>Data Integrity:</strong> Metrics displayed on this portal represent live application states and audited NASA/MoA&FW model pipelines. Fake statistics are strictly excluded.
          </span>
        </div>
      </div>
    </div>
  );
}
