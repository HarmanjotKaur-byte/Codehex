import os

components = {
    "GovernmentBurningRisk.jsx": """import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function GovernmentBurningRisk() {
  const { t } = useLanguage();
  const [lat, setLat] = useState('30.12');
  const [lon, setLon] = useState('75.23');
  const [dateStr, setDateStr] = useState('2023-11-01');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkRisk = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:8000/api/risk/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('paralipay_token')}` },
        body: JSON.stringify({ latitude: parseFloat(lat), longitude: parseFloat(lon), date_str: dateStr })
      });
      if (!res.ok) throw new Error('API failed');
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError('Unable to load government analytics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>🛡️ Burning Risk Monitoring</h2>
        <p>The system predicts: "Probability of observing stubble-burning activity in a geographic grid cell on a given date."</p>
      </div>
      <div className="card">
        <div className="flex gap-4 mb-4" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <input type="number" step="0.01" value={lat} onChange={e => setLat(e.target.value)} placeholder="Latitude" className="input" />
          <input type="number" step="0.01" value={lon} onChange={e => setLon(e.target.value)} placeholder="Longitude" className="input" />
          <input type="date" value={dateStr} onChange={e => setDateStr(e.target.value)} className="input" />
          <button onClick={checkRisk} disabled={loading} className="btn btn-primary">{loading ? 'Loading...' : 'Check Risk'}</button>
        </div>
        {error && <div className="text-red-500">{error}</div>}
        {result && (
          <div className="mt-4 p-4 border rounded" style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '4px' }}>
            <p><strong>Grid Latitude:</strong> {result.grid_lat}</p>
            <p><strong>Grid Longitude:</strong> {result.grid_lon}</p>
            <p><strong>Selected Date:</strong> {result.date_analyzed}</p>
            <p><strong>Risk Category:</strong> <span style={{ color: result.risk_level === 'HIGH' ? 'red' : result.risk_level === 'MEDIUM' ? 'orange' : 'green', fontWeight: 'bold' }}>{result.risk_level}</span></p>
            <p><strong>Risk Probability:</strong> {result.burning_probability}</p>
          </div>
        )}
      </div>
    </div>
  );
}
""",
    "GovernmentMarketplaceMonitoring.jsx": """import React, { useEffect, useState } from 'react';

export default function GovernmentMarketplaceMonitoring() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/government/marketplace', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('paralipay_token')}` }
    })
    .then(res => res.json())
    .then(setData)
    .catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading government analytics...</div>;
  if (!data) return <div className="p-8 text-center text-gray-500">Unable to load government analytics. Please try again.</div>;

  return (
    <div>
      <div className="page-header">
        <h2>🛒 Marketplace Monitoring</h2>
        <p>Monitor buyer activity and stubble utilization.</p>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-label">Active Listings</span>
            <span className="stat-value">{data.active_listings ?? 'N/A'}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-label">Total Listed Quantity (t)</span>
            <span className="stat-value">{data.total_quantity ?? 'N/A'}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-label">Reserved / Sold Quantity (t)</span>
            <span className="stat-value">{(data.reserved_quantity + data.sold_quantity) ?? 'N/A'}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-label">Active Buyers</span>
            <span className="stat-value">{data.active_buyers ?? 'N/A'}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-label">Total Interests</span>
            <span className="stat-value">{data.total_interests ?? 'N/A'}</span>
            <span className="stat-sub">Accepted: {data.accepted_interests} | Rejected: {data.rejected_interests}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
"""
}

out_dir = r"D:\Hackathon\CodeHex-AI-Enabled-Platform-for-Connecting-Farmers-with-Biomass-Buyers-to-Reduce-Paddy-Stubble-Burni\frontend\src\pages\admin"
for filename, content in components.items():
    path = os.path.join(out_dir, filename)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

print("Updated placeholder components.")
