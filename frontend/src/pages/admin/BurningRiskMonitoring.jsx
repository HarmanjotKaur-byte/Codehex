import { useState } from 'react';
import { ShieldAlert, Flame, MapPin, AlertCircle, Info } from 'lucide-react';
import { predictRisk } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import RiskGauge from '../../components/RiskGauge';

export default function BurningRiskMonitoring() {
  const [lat, setLat] = useState('30.9000');
  const [lon, setLon] = useState('75.8573');
  const [date, setDate] = useState(() => {
    const y = new Date().getFullYear();
    return `${y}-11-01`;
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    const latF = parseFloat(lat);
    const lonF = parseFloat(lon);
    if (isNaN(latF) || isNaN(lonF)) {
      setError('Please enter valid numeric latitude and longitude coordinates.');
      return;
    }
    if (latF < 28.5 || latF > 32.5) {
      setError('Latitude must be within Punjab & Haryana domain (28.5° to 32.5°N).');
      return;
    }
    if (lonF < 73.5 || lonF > 77.5) {
      setError('Longitude must be within Punjab & Haryana domain (73.5° to 77.5°E).');
      return;
    }

    setLoading(true);
    try {
      const data = await predictRisk({ latitude: latF, longitude: lonF, date });
      const prob = data?.burning_probability;
      if (typeof prob !== 'number' || isNaN(prob) || prob < 0 || prob > 1) {
        setError('Burning risk could not be calculated for this location/date. Model returned invalid inference.');
      } else {
        setResult(data);
      }
    } catch (err) {
      setError(err.message || 'Burning risk inference failed. Check backend connectivity.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>🛰️ Satellite Burning Risk Monitoring</h2>
        <p>
          Assess geographic grid cell probability of stubble-burning events using the audited NASA FIRMS VIIRS spatiotemporal classifier.
        </p>
      </div>

      {/* Crucial definition note required by prompt */}
      <div className="info-banner" style={{ marginBottom: 24 }}>
        <Info size={20} />
        <div>
          <strong>Model Definition:</strong> The model predicts the probability of observing stubble-burning activity in a geographic grid cell (0.25° × 0.25°) on a given date.
          <div style={{ fontSize: '0.8rem', marginTop: 4, opacity: 0.9 }}>
            It does <strong>NOT</strong> predict the probability that a particular individual farmer will burn. It is a spatial and temporal surveillance index.
          </div>
        </div>
      </div>

      <div className="two-col">
        {/* Input Form */}
        <div className="card">
          <div className="card-title">Grid Query Location & Date</div>
          <div className="card-subtitle">Select coordinates in North-West India (Punjab/Haryana)</div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                <MapPin size={13} style={{ display: 'inline', marginRight: 4 }} />
                Latitude (°N)
              </label>
              <input 
                type="number" 
                step="0.0001" 
                min="28.5" 
                max="32.5" 
                className="form-input" 
                value={lat} 
                onChange={e => setLat(e.target.value)} 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <MapPin size={13} style={{ display: 'inline', marginRight: 4 }} />
                Longitude (°E)
              </label>
              <input 
                type="number" 
                step="0.0001" 
                min="73.5" 
                max="77.5" 
                className="form-input" 
                value={lon} 
                onChange={e => setLon(e.target.value)} 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Inspection Date</label>
              <input 
                type="date" 
                className="form-input" 
                value={date} 
                onChange={e => setDate(e.target.value)} 
                required 
              />
              <span className="form-hint">Peak residue burning window: October 15 – November 20</span>
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              <Flame size={18} />
              {loading ? 'Evaluating Satellite Lattice…' : 'Inspect Grid Risk'}
            </button>
          </form>

          {loading && <LoadingSpinner message="Evaluating Satellite Lattice…" />}
          <ErrorMessage message={error} />
        </div>

        {/* Results Panel */}
        <div>
          {result ? (
            <>
              <RiskGauge 
                probability={result.burning_probability} 
                risk_level={result.risk_level} 
              />

              <div className="card" style={{ marginTop: 16 }}>
                <div className="card-title">Lattice Cell Surveillance Metrics</div>
                <table className="metrics-table">
                  <tbody>
                    <tr><td>Analyzed Date</td><td><strong>{result.date_analyzed}</strong></td></tr>
                    <tr><td>Snapping Grid Cell</td><td><strong>{result.grid_lat}°N, {result.grid_lon}°E</strong> (0.25° resolution)</td></tr>
                    <tr><td>Harvest Season Day</td><td>Day {result.day_of_harvest_season}</td></tr>
                    <tr><td>Peak Window Flag</td><td>{result.is_peak_harvest_window ? '⚠️ Active Peak Window' : 'Normal Period'}</td></tr>
                    <tr><td>Past 3-Day Fires</td><td>{result.lag_fire_days_past_3d} burning events</td></tr>
                    <tr><td>Past 7-Day Fires</td><td>{result.lag_fire_days_past_7d} burning events</td></tr>
                    <tr><td>Historical Fire Source</td><td style={{ fontSize: '0.8rem' }}>{result.lag_data_source}</td></tr>
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--gray-400)' }}>
              <ShieldAlert size={56} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
              <p>Select a location and date to assess predicted burning risk across the regional satellite lattice.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
