import { useState } from 'react';
import { Sliders, CheckCircle, Info } from 'lucide-react';
import { DEMO_MARKETPLACE_LISTINGS, calculateDistance } from '../../services/marketplace';

export default function BuyerPreferences() {
  const [prefLocation, setPrefLocation] = useState('Ludhiana');
  const [maxDist, setMaxDist] = useState('120');
  const [reqQty, setReqQty] = useState('40');
  const [maxPrice, setMaxPrice] = useState('2200');
  const [prefAvailable, setPrefAvailable] = useState(true);

  const [saved, setSaved] = useState(false);

  // Reference coordinates based on selected preferred hub
  const getHubCoords = (loc) => {
    switch (loc) {
      case 'Patiala': return { lat: 30.3398, lon: 76.3869 };
      case 'Karnal':  return { lat: 29.6857, lon: 76.9905 };
      case 'Bathinda': return { lat: 30.2110, lon: 74.9455 };
      default: return { lat: 30.9000, lon: 75.8573 }; // Ludhiana
    }
  };

  const hub = getHubCoords(prefLocation);

  // Compute transparent rule-based suitability score for each listing against buyer preferences
  // Weights: Distance 35%, Price 35%, Capacity/Volume 20%, Availability 10%
  const scoredListings = DEMO_MARKETPLACE_LISTINGS.map(item => {
    const dist = calculateDistance(hub.lat, hub.lon, item.latitude, item.longitude);
    const maxD = parseFloat(maxDist) || 120;
    
    // 1. Distance score
    const distScore = Math.max(0, 1 - (dist / maxD));
    
    // 2. Price score (benchmark: max acceptable price)
    const maxP = parseFloat(maxPrice) || 2200;
    const priceScore = item.asking_price_per_tonne <= maxP 
      ? Math.min(1, maxP / item.asking_price_per_tonne) 
      : Math.max(0, 1 - (item.asking_price_per_tonne - maxP) / 500);

    // 3. Volume/Capacity score (checks if farmer volume satisfies buyer demand)
    const reqQ = parseFloat(reqQty) || 40;
    const volScore = Math.min(1, item.stubble_quantity_tonnes / reqQ);

    // 4. Availability score
    const availScore = item.is_available ? 1.0 : 0.0;

    // Rule-based score
    const suitability = (
      0.35 * distScore +
      0.35 * priceScore +
      0.20 * volScore +
      0.10 * availScore
    );

    return {
      ...item,
      distance: dist,
      suitability_score: Math.round(suitability * 100),
      distScore: Math.round(distScore * 100),
      priceScore: Math.round(priceScore * 100),
      volScore: Math.round(volScore * 100),
      availScore: Math.round(availScore * 100),
    };
  }).sort((a, b) => b.suitability_score - a.suitability_score);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <div className="page-header">
        <h2>⚙️ Buyer Procurement Preferences</h2>
        <p>Set your facility criteria to automatically rank available farmer supply via transparent scoring.</p>
      </div>

      {saved && (
        <div className="success-banner" style={{ marginBottom: 20 }}>
          <CheckCircle size={16} />
          <span>Procurement criteria updated successfully. Ranking recalculated below.</span>
        </div>
      )}

      <div className="two-col">
        {/* Preference Input Form */}
        <div className="card">
          <div className="card-title">Facility Criteria</div>
          <div className="card-subtitle">Weights and priorities applied across listings</div>

          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Procurement Hub Location</label>
              <select 
                className="form-select" 
                value={prefLocation} 
                onChange={e => setPrefLocation(e.target.value)}
              >
                <option value="Ludhiana">Ludhiana (Central Punjab)</option>
                <option value="Patiala">Patiala (Eastern Punjab)</option>
                <option value="Bathinda">Bathinda (South-West Punjab)</option>
                <option value="Karnal">Karnal (Northern Haryana)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Max Acceptable Logistics Radius (km)</label>
              <input 
                type="number" 
                className="form-input" 
                value={maxDist} 
                onChange={e => setMaxDist(e.target.value)} 
                min="20" 
                max="500" 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Required Batch Stubble Quantity (tonnes)</label>
              <input 
                type="number" 
                className="form-input" 
                value={reqQty} 
                onChange={e => setReqQty(e.target.value)} 
                min="5" 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Maximum Ceiling Price (₹/tonne)</label>
              <input 
                type="number" 
                className="form-input" 
                value={maxPrice} 
                onChange={e => setMaxPrice(e.target.value)} 
                min="1500" 
                step="50" 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Acceptance Filter</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={prefAvailable} 
                  onChange={e => setPrefAvailable(e.target.checked)} 
                />
                Require immediately available stocks
              </label>
            </div>

            <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 10 }}>
              <Sliders size={16} /> Save Procurement Preferences
            </button>
          </form>

          {/* Rule-based weights transparency */}
          <hr className="divider" />
          <div className="card-title" style={{ fontSize: '0.95rem', marginBottom: 6 }}>
            Rule-Based Scoring Formula
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginBottom: 12 }}>
            This matching component is <strong>strictly non-ML</strong>, using deterministic weighting.
          </div>
          <table className="metrics-table">
            <thead>
              <tr><th>Matching Factor</th><th>Weight</th></tr>
            </thead>
            <tbody>
              <tr><td>Distance Decay (Haversine)</td><td><strong>35%</strong></td></tr>
              <tr><td>Offered Procurement Price</td><td><strong>35%</strong></td></tr>
              <tr><td>Volume / Batch Capacity</td><td><strong>20%</strong></td></tr>
              <tr><td>Active Delivery Availability</td><td><strong>10%</strong></td></tr>
            </tbody>
          </table>
        </div>

        {/* Dynamic Ranked Results based on preferences */}
        <div>
          <div className="card">
            <div className="card-title">Ranked Supply Listings for Your Facility</div>
            <div className="card-subtitle">
              Ranked from highest suitability based on {prefLocation} hub
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {scoredListings
                .filter(item => !prefAvailable || item.is_available)
                .map((item, idx) => (
                  <div 
                    key={item.id} 
                    className="card" 
                    style={{ padding: '16px 18px', border: idx === 0 ? '1.5px solid var(--green-500)' : '1px solid var(--gray-200)' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>
                          #{idx + 1} {item.farmer_name}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--gray-600)', marginTop: 2 }}>
                          {item.district}, {item.state} · {item.distance} km away · {item.stubble_quantity_tonnes} t @ ₹{item.asking_price_per_tonne}/t
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--green-700)' }}>
                          {item.suitability_score}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--gray-500)' }}>Suitability Score</div>
                      </div>
                    </div>

                    <div className="score-breakdown" style={{ marginTop: 8 }}>
                      <span>Dist: {item.distScore}%</span>
                      <span>Price: {item.priceScore}%</span>
                      <span>Vol: {item.volScore}%</span>
                      <span>Avail: {item.availScore}%</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
