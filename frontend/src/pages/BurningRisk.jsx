import { useState } from 'react';
import { Flame, MapPin } from 'lucide-react';
import { predictRisk } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage   from '../components/ErrorMessage';
import RiskGauge      from '../components/RiskGauge';

// Default location: Ludhiana, Punjab (centre of the model domain)
const DEFAULT_LAT = '30.9000';
const DEFAULT_LON = '75.8573';

export default function BurningRisk({ farmerLat, farmerLon, onLocation }) {
  const [lat,  setLat]   = useState(farmerLat || DEFAULT_LAT);
  const [lon,  setLon]   = useState(farmerLon || DEFAULT_LON);
  const [date, setDate]  = useState(() => {
    // Default to Nov 1 of current year (peak harvest window)
    const y = new Date().getFullYear();
    return `${y}-11-01`;
  });

  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    const latF = parseFloat(lat);
    const lonF = parseFloat(lon);
    if (isNaN(latF) || isNaN(lonF)) { setError('Please enter valid latitude and longitude.'); return; }
    if (latF < 28.5 || latF > 32.5) { setError('Latitude must be between 28.5° and 32.5° (Punjab/Haryana region).'); return; }
    if (lonF < 73.5 || lonF > 77.5) { setError('Longitude must be between 73.5° and 77.5° (Punjab/Haryana region).'); return; }

    setLoading(true);
    onLocation?.(latF, lonF);
    try {
      const data = await predictRisk({ latitude: latF, longitude: lonF, date });
      // Validate that the response contains a real numeric probability (0–1)
      const prob = data?.burning_probability;
      if (typeof prob !== 'number' || isNaN(prob) || prob < 0 || prob > 1) {
        setError('Burning risk could not be calculated for this location/date. The model returned an invalid probability.');
      } else {
        setResult(data);
      }
    } catch (err) {
      setError(err.message || 'Risk prediction failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>🔥 Stubble Burning Risk</h2>
        <p>
          Predicts the probability of a fire event using real NASA FIRMS VIIRS satellite data.
          The model uses spatial patterns and historical fire activity.
        </p>
      </div>

      <div className="two-col">
        {/* Form */}
        <div className="card">
          <div className="card-title">Location &amp; Date</div>
          <div className="card-subtitle">Valid domain: Punjab &amp; Haryana (28.5–32.5°N, 73.5–77.5°E)</div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                <MapPin size={13} style={{ display: 'inline', marginRight: 4 }} />
                Latitude
              </label>
              <input
                type="number"
                className="form-input"
                step="0.0001"
                min="28.5"
                max="32.5"
                placeholder="e.g. 30.9000"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <MapPin size={13} style={{ display: 'inline', marginRight: 4 }} />
                Longitude
              </label>
              <input
                type="number"
                className="form-input"
                step="0.0001"
                min="73.5"
                max="77.5"
                placeholder="e.g. 75.8573"
                value={lon}
                onChange={(e) => setLon(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
              <span className="form-hint">Peak burning season: Oct 15 – Nov 20</span>
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              <Flame size={18} />
              {loading ? 'Analyzing burning risk…' : 'Predict Burning Risk'}
            </button>
          </form>

          {loading && <LoadingSpinner message="Analyzing burning risk…" />}
          <ErrorMessage message={error} />
        </div>

        {/* Result — only rendered when result is non-null AND probability is valid */}
        <div>
          {result ? (
            <>
              {/* FIX BUG 1: backend field is burning_probability, not fire_probability */}
              <RiskGauge
                probability={result.burning_probability}
                risk_level={result.risk_level}
              />

              <div className="card" style={{ marginTop: 16 }}>
                <div className="card-title">Prediction Details</div>
                <table className="metrics-table">
                  <tbody>
                    {/* FIX BUG 1: backend field is date_analyzed, not date */}
                    <tr><td>Date</td><td>{result.date_analyzed}</td></tr>
                    <tr><td>Grid Cell (lat)</td><td>{result.grid_lat}°N</td></tr>
                    <tr><td>Grid Cell (lon)</td><td>{result.grid_lon}°E</td></tr>
                    {/* FIX BUG 1: backend field is day_of_harvest_season, not day_of_year */}
                    <tr><td>Day of Harvest Season</td><td>{result.day_of_harvest_season}</td></tr>
                    <tr><td>Peak Harvest Window</td><td>{result.is_peak_harvest_window ? '✅ Yes' : '❌ No'}</td></tr>
                    {result.lag_data_source && (
                      <tr><td>Lag Data Source</td><td style={{ fontSize: '0.8rem' }}>{result.lag_data_source}</td></tr>
                    )}
                  </tbody>
                </table>

                <div className="info-banner" style={{ marginTop: 16, marginBottom: 0 }}>
                  <Flame size={16} />
                  <span>
                    Lag features (recent fire activity in your area) are retrieved automatically
                    from <strong>NASA FIRMS VIIRS 2023</strong> satellite data — not estimated.
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--gray-400)' }}>
              <div style={{ fontSize: '4rem', marginBottom: 16 }}>🔥</div>
              <p>Enter your location and date to<br /><strong>predict burning risk</strong></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
