import { useState, useEffect } from 'react';
import { Users, Search, Info } from 'lucide-react';
import { matchBuyers } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage   from '../components/ErrorMessage';
import BuyerCard      from '../components/BuyerCard';

export default function BuyerMatching({ stubbleResult, farmerLat, farmerLon }) {
  const [qty,      setQty]     = useState('');
  const [lat,      setLat]     = useState('');
  const [lon,      setLon]     = useState('');
  const [maxDist,  setMaxDist] = useState('150');
  const [loading,  setLoading] = useState(false);
  const [result,   setResult]  = useState(null);
  const [error,    setError]   = useState('');

  // Auto-fill from stubble estimate and location
  useEffect(() => {
    if (stubbleResult?.tonnes) setQty(String(stubbleResult.tonnes.toFixed(1)));
  }, [stubbleResult]);

  useEffect(() => {
    if (farmerLat) setLat(String(farmerLat));
    if (farmerLon) setLon(String(farmerLon));
  }, [farmerLat, farmerLon]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    const latF = parseFloat(lat);
    const lonF = parseFloat(lon);
    const qtyF = parseFloat(qty);
    const maxDistF = parseFloat(maxDist);

    if (!qtyF || qtyF <= 0) { setError('Enter a valid stubble quantity greater than 0.'); return; }
    if (isNaN(latF) || isNaN(lonF)) { setError('Enter valid latitude and longitude.'); return; }
    if (isNaN(maxDistF) || maxDistF <= 0) { setError('Enter a valid maximum search distance greater than 0 km.'); return; }

    setLoading(true);
    try {
      const data = await matchBuyers({
        stubble_quantity: qtyF,
        farmer_latitude:  latF,
        farmer_longitude: lonF,
        max_distance_km:  parseFloat(maxDist) || 150,
      });
      setResult(data);
    } catch (err) {
      setError(err.message || 'Buyer matching failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const hasAutoFill = stubbleResult?.tonnes || farmerLat;

  return (
    <div>
      <div className="page-header">
        <h2>🤝 Smart Buyer Matching</h2>
        <p>
          Ranks nearby biomass buyers using a transparent weighted scoring algorithm —
          not machine learning. Scores weigh distance (35%), price (35%), capacity (20%), and availability (10%).
        </p>
      </div>

      {hasAutoFill && (
        <div className="success-banner" style={{ marginBottom: 20 }}>
          <Info size={16} />
          <span>
            Fields have been <strong>auto-filled</strong> from your Stubble Estimate and Burning Risk inputs.
          </span>
        </div>
      )}

      <div className="two-col">
        {/* Form */}
        <div className="card">
          <div className="card-title">Search Parameters</div>
          <div className="card-subtitle">Adjust values as needed</div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Available Stubble (tonnes)</label>
              <input
                type="number"
                className="form-input"
                step="0.1"
                min="0.1"
                placeholder="e.g. 24.5"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                required
              />
              <span className="form-hint">Auto-filled from Stubble Estimator if used first</span>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Your Latitude</label>
                <input
                  type="number"
                  className="form-input"
                  step="0.0001"
                  placeholder="e.g. 30.9000"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Your Longitude</label>
                <input
                  type="number"
                  className="form-input"
                  step="0.0001"
                  placeholder="e.g. 75.8573"
                  value={lon}
                  onChange={(e) => setLon(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Max Distance (km)</label>
              <input
                type="number"
                className="form-input"
                min="10"
                max="500"
                step="10"
                value={maxDist}
                onChange={(e) => setMaxDist(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              <Search size={18} />
              {loading ? 'Finding suitable buyers…' : 'Find Buyers'}
            </button>
          </form>

          {loading && <LoadingSpinner message="Finding suitable buyers…" />}
          <ErrorMessage message={error} />

          {/* Scoring explanation */}
          <hr className="divider" />
          <div className="card-title" style={{ marginBottom: 8 }}>Scoring Formula</div>
          <table className="metrics-table">
            <thead><tr><th>Factor</th><th>Weight</th></tr></thead>
            <tbody>
              <tr><td>Distance</td><td>35%</td></tr>
              <tr><td>Offered Price</td><td>35%</td></tr>
              <tr><td>Capacity</td><td>20%</td></tr>
              <tr><td>Availability</td><td>10%</td></tr>
            </tbody>
          </table>
          <p className="metric-note" style={{ marginTop: 8 }}>
            Benchmark price: ₹2,500/tonne. Buyers outside max distance are excluded.
          </p>
        </div>

        {/* Results */}
        <div>
          {result ? (
            <>
              {/*
                FIX BUG 3: correct response field names:
                  result.total_matched        → result.matched_buyers_count
                  result.max_distance_km      → result.search_radius_km
                  result.stubble_quantity_tonnes → result.farmer_stubble_tonnes
                  result.matched_buyers       → result.matches
              */}
              <div className="info-banner" style={{ marginBottom: 12 }}>
                <Users size={16} />
                <span>
                  Found <strong>{result.matched_buyers_count}</strong> buyer{result.matched_buyers_count !== 1 ? 's' : ''} within{' '}
                  {result.search_radius_km} km for <strong>{result.farmer_stubble_tonnes} t</strong> of stubble.
                </span>
              </div>

              {result.matches?.length > 0 ? (
                <div className="buyer-list">
                  {result.matches.map((b, i) => (
                    <BuyerCard key={b.buyer_id} buyer={b} rank={i + 1} />
                  ))}
                </div>
              ) : (
                <div className="card" style={{ textAlign: 'center', padding: '32px', color: 'var(--gray-500)' }}>
                  No buyers found within {result.search_radius_km} km.
                  Try increasing the maximum distance.
                </div>
              )}
            </>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--gray-400)' }}>
              <div style={{ fontSize: '4rem', marginBottom: 16 }}>🤝</div>
              <p>Fill the form and click<br /><strong>Find Buyers</strong></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
