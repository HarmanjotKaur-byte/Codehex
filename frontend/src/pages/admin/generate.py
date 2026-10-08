import os

components = {
    "GovernmentOverview.jsx": """import React, { useEffect, useState } from 'react';
import { Package, ShieldAlert, ShoppingBag, Layers, Info } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { getAuthHeader } from '../../services/api'; // Make sure to export this if needed, or just use fetch

export default function GovernmentOverview() {
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetch('http://localhost:8000/api/government/overview', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('paralipay_token')}` }
    })
    .then(res => res.json())
    .then(setData)
    .catch(console.error);
  }, []);

  if (!data) return <div className="p-8 text-center text-gray-500">Loading government analytics...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>🏛️ {t('gov.dashboardTitle', 'Regional Stubble Monitoring & Regulatory Overview')}</h2>
        <p>Operational intelligence and monitoring.</p>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: 'var(--green-100)', color: 'var(--green-700)' }}><Package size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">Total Stubble (t)</span>
            <span className="stat-value">{data.marketplace.total_stubble_tonnes}</span>
            <span className="stat-sub">{data.marketplace.total_listings} total listings</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: 'var(--blue-100)', color: 'var(--blue-600)' }}><ShoppingBag size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">Active Buyers</span>
            <span className="stat-value">{data.marketplace.active_buyers}</span>
            <span className="stat-sub">{data.marketplace.buyer_interests} total interests</span>
          </div>
        </div>
      </div>
    </div>
  );
}
""",
    "GovernmentBurningRisk.jsx": """import React from 'react';
export default function GovernmentBurningRisk() {
  return <div className="page-header"><h2>Burning Risk (Gov)</h2><p>Read-only view.</p></div>;
}
""",
    "GovernmentBurningStatistics.jsx": """import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function GovernmentBurningStatistics() {
  const [annualData, setAnnualData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const headers = { 'Authorization': `Bearer ${localStorage.getItem('paralipay_token')}` };
    Promise.all([
      fetch('http://localhost:8000/api/government/burning-statistics/annual', { headers }).then(r => r.json()),
      fetch('http://localhost:8000/api/government/burning-statistics/monthly?year=2023', { headers }).then(r => r.json())
    ]).then(([annual, monthly]) => {
      setAnnualData(annual);
      setMonthlyData(monthly);
      setLoading(false);
    }).catch(console.error);
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading government analytics...</div>;
  if (!annualData || annualData.length === 0) return <div className="p-8 text-center text-gray-500">Historical burning statistics unavailable until verified FIRMS data is loaded.</div>;

  return (
    <div>
      <div className="page-header">
        <h2>🔥 Burning Statistics</h2>
        <p>Statistical monitoring of satellite-detected fire activity.</p>
      </div>
      
      <div className="info-banner mb-6" style={{ marginBottom: 20 }}>
        <strong>Data Source:</strong> NASA FIRMS VIIRS 375 m active-fire data. Used as a satellite-derived fire activity monitoring proxy; not every detection represents confirmed stubble burning.
      </div>
      
      <div className="stats-grid" style={{ marginBottom: 24 }}>
         <div className="stat-card">
           <div className="stat-content">
             <span className="stat-label">Total Detections (2023)</span>
             <span className="stat-value">{annualData[0]?.total_detections ?? 'N/A'}</span>
             <span className="stat-sub">Combined Punjab & Haryana</span>
           </div>
         </div>
         <div className="stat-card">
           <div className="stat-content">
             <span className="stat-label">Year-over-Year Change</span>
             <span className="stat-value">N/A</span>
             <span className="stat-sub">Insufficient historical data</span>
           </div>
         </div>
      </div>

      <div className="card" style={{ marginBottom: 24, height: 400 }}>
        <h3 className="card-title mb-4">Annual Burning Activity</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={annualData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="punjab_detections" name="Punjab" fill="#f59e0b" />
            <Bar dataKey="haryana_detections" name="Haryana" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card" style={{ height: 400 }}>
        <h3 className="card-title mb-4">Monthly Activity (2023)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="total_detections" name="Total Detections" stroke="#ef4444" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
""",
    "GovernmentStubbleAvailability.jsx": """import React, { useEffect, useState } from 'react';
export default function GovernmentStubbleAvailability() {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    fetch('http://localhost:8000/api/government/stubble-availability', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('paralipay_token')}` }
    })
    .then(res => res.json())
    .then(setData)
    .catch(console.error);
  }, []);

  return (
    <div>
      <div className="page-header">
        <h2>🌾 Stubble Availability</h2>
        <p>Monitor available stubble in the marketplace.</p>
      </div>
      <div className="card">
        {data.length === 0 ? <p>No data available for the selected period.</p> : (
          <table className="metrics-table">
            <thead><tr><th>ID</th><th>District</th><th>Quantity (t)</th><th>Price (₹)</th><th>Status</th></tr></thead>
            <tbody>
              {data.map(item => (
                <tr key={item.id}><td>#{item.id}</td><td>{item.district}</td><td>{item.quantity_tonnes}</td><td>{item.asking_price_per_tonne}</td><td>{item.status}</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
""",
    "GovernmentMarketplaceMonitoring.jsx": """import React from 'react';
export default function GovernmentMarketplaceMonitoring() {
  return <div className="page-header"><h2>Marketplace Monitoring</h2><p>Monitor buyer activity and stubble utilization.</p></div>;
}
""",
    "GovernmentPriorityAreas.jsx": """import React, { useEffect, useState } from 'react';
export default function GovernmentPriorityAreas() {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    fetch('http://localhost:8000/api/government/priority-areas', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('paralipay_token')}` }
    })
    .then(res => res.json())
    .then(setData)
    .catch(console.error);
  }, []);

  return (
    <div>
      <div className="page-header">
        <h2>🎯 Priority Areas</h2>
        <p>Decision-Support Priority Monitoring Area.</p>
      </div>
      <div className="card">
        {data.length === 0 ? <p>No data available for the selected period.</p> : (
          <table className="metrics-table">
            <thead><tr><th>District</th><th>Available (t)</th><th>Listings</th><th>Priority Score</th></tr></thead>
            <tbody>
              {data.map((item, idx) => (
                <tr key={idx}><td>{item.district}</td><td>{item.stubble_available_tonnes}</td><td>{item.listing_count}</td><td>{item.priority_score}</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
""",
    "GovernmentReports.jsx": """import React from 'react';
export default function GovernmentReports() {
  return (
    <div>
      <div className="page-header">
        <h2>📊 Reports</h2>
        <p>Export data-backed reports.</p>
      </div>
      <div className="card">
        <button className="btn btn-primary">Export Burning Activity (CSV)</button>
      </div>
    </div>
  );
}
""",
    "GovernmentProfile.jsx": """import React, { useEffect, useState } from 'react';
export default function GovernmentProfile() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetch('http://localhost:8000/api/government/profile', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('paralipay_token')}` }
    })
    .then(res => res.json())
    .then(setData)
    .catch(console.error);
  }, []);

  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>👤 My Profile</h2>
      </div>
      <div className="card">
        <p><strong>Name:</strong> {data.full_name}</p>
        <p><strong>Email:</strong> {data.email}</p>
        <p><strong>Role:</strong> {data.role}</p>
      </div>
    </div>
  );
}
"""
}

out_dir = r"D:\Hackathon\CodeHex-AI-Enabled-Platform-for-Connecting-Farmers-with-Biomass-Buyers-to-Reduce-Paddy-Stubble-Burni\frontend\src\pages\admin"
os.makedirs(out_dir, exist_ok=True)
for filename, content in components.items():
    path = os.path.join(out_dir, filename)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

print("Created React components.")
