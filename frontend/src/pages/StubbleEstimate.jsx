import { useState } from 'react';
import { Wheat, ArrowRight } from 'lucide-react';
import { predictStubble } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const STATES = ['Punjab', 'Haryana'];

const DISTRICTS = {
  Punjab:  ['Ludhiana', 'Amritsar', 'Patiala', 'Bathinda', 'Jalandhar', 'Sangrur'],
  Haryana: ['Karnal', 'Ambala', 'Kurukshetra', 'Panipat'],
};

const SEASONS = ['Kharif', 'Whole Year'];

const CURRENT_YEAR = new Date().getFullYear();

export default function StubbleEstimate({ onResult }) {
  const [form, setForm] = useState({
    Area: '',
    State_Name: 'Punjab',
    District_Name: 'Ludhiana',
    Crop_Year: String(CURRENT_YEAR),
    Season: 'Kharif',
  });
  const [loading, setLoading]         = useState(false);
  const [result, setResult]           = useState(null);
  // FIX BUG 2: capture form values at submit so we can show Season & Crop_Year
  // which the backend does not echo back in its response.
  const [formSnapshot, setFormSnapshot] = useState(null);
  const [error, setError]             = useState('');

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    const area = parseFloat(form.Area);
    if (!area || area <= 0) { setError('Please enter a valid field area greater than 0.'); return; }

    setLoading(true);
    // Snapshot form at the moment of submission
    const snapshot = { ...form, Area: area };
    setFormSnapshot(snapshot);
    try {
      const payload = {
        Area: area,
        State_Name: form.State_Name,
        District_Name: form.District_Name,
        Crop_Year: parseInt(form.Crop_Year, 10),
        Season: form.Season,
      };
      const data = await predictStubble(payload);
      setResult(data);
      onResult?.({ tonnes: data.predicted_stubble_tonnes, state: form.State_Name, district: form.District_Name });
    } catch (err) {
      setError(err.message || 'Prediction failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const districts = DISTRICTS[form.State_Name] || [];

  return (
    <div>
      <div className="page-header">
        <h2>🌾 Stubble Quantity Estimator</h2>
        <p>Enter your paddy field details to predict available stubble in tonnes.</p>
      </div>

      <div className="two-col">
        {/* Form */}
        <div className="card">
          <div className="card-title">Field Information</div>
          <div className="card-subtitle">All fields are required</div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Field Area (hectares)</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 5.0"
                min="0.01"
                step="0.01"
                value={form.Area}
                onChange={(e) => set('Area', e.target.value)}
                required
              />
              <span className="form-hint">Enter total area of your paddy field</span>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">State</label>
                <select
                  className="form-select"
                  value={form.State_Name}
                  onChange={(e) => { set('State_Name', e.target.value); set('District_Name', DISTRICTS[e.target.value][0]); }}
                >
                  {STATES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">District</label>
                <select
                  className="form-select"
                  value={form.District_Name}
                  onChange={(e) => set('District_Name', e.target.value)}
                >
                  {districts.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Crop Year</label>
                <input
                  type="number"
                  className="form-input"
                  min="2000"
                  max={CURRENT_YEAR}
                  value={form.Crop_Year}
                  onChange={(e) => set('Crop_Year', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Season</label>
                <select
                  className="form-select"
                  value={form.Season}
                  onChange={(e) => set('Season', e.target.value)}
                >
                  {SEASONS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              <Wheat size={18} />
              {loading ? 'Estimating stubble…' : 'Estimate Stubble Quantity'}
            </button>
          </form>

          {loading && <LoadingSpinner message="Estimating stubble…" />}
          <ErrorMessage message={error} />
        </div>

        {/* Result */}
        <div>
          {result ? (
            <>
              <div className="result-big">
                <div className="result-value">
                  {result.predicted_stubble_tonnes?.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                </div>
                <div className="result-unit">tonnes of paddy stubble</div>
                <div className="result-label">Estimated quantity available from your field</div>
              </div>

              <div className="card" style={{ marginTop: 16 }}>
                <div className="card-title">Prediction Details</div>
                <table className="metrics-table">
                  <tbody>
                    {/* FIX BUG 2: backend returns state_used, not state */}
                    <tr><td>State</td><td>{result.state_used}</td></tr>
                    {/* FIX BUG 2: backend returns district_used, not district */}
                    <tr><td>District</td><td>{result.district_used}</td></tr>
                    {/* FIX BUG 2: backend returns area_hectares, not area_ha */}
                    <tr><td>Area</td><td>{result.area_hectares} ha</td></tr>
                    {/* FIX BUG 2: Season not in response — use snapshot from form */}
                    <tr><td>Season</td><td>{formSnapshot?.Season}</td></tr>
                    {/* FIX BUG 2: Crop_Year not in response — use snapshot from form */}
                    <tr><td>Crop Year</td><td>{formSnapshot?.Crop_Year}</td></tr>
                    {/* FIX BUG 2: backend returns district_baseline_yield_t_ha, not district_hist_yield */}
                    {result.district_baseline_yield_t_ha != null && (
                      <tr><td>District Yield Baseline</td><td>{result.district_baseline_yield_t_ha?.toFixed(2)} t/ha</td></tr>
                    )}
                  </tbody>
                </table>

                <div className="success-banner" style={{ marginTop: 16, marginBottom: 0 }}>
                  <ArrowRight size={16} />
                  <span>
                    This estimate has been shared with <strong>Find Buyers</strong>.
                    Go to the Buyer Matching tab to find buyers for your stubble.
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--gray-400)' }}>
              <div style={{ fontSize: '4rem', marginBottom: 16 }}>🌾</div>
              <p>Fill the form and click<br /><strong>Estimate Stubble Quantity</strong></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
