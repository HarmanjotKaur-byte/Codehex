import { useState } from 'react';
import { Wheat, ArrowRight } from 'lucide-react';
import { predictStubble } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useLanguage } from '../context/LanguageContext';

const STATES = ['Punjab', 'Haryana'];

const DISTRICTS = {
  Punjab:  ['Ludhiana', 'Amritsar', 'Patiala', 'Bathinda', 'Jalandhar', 'Sangrur'],
  Haryana: ['Karnal', 'Ambala', 'Kurukshetra', 'Panipat'],
};

const SEASONS = ['Kharif', 'Whole Year'];
const CURRENT_YEAR = new Date().getFullYear();

export default function StubbleEstimate({ onResult }) {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    Area: '',
    State_Name: 'Punjab',
    District_Name: 'Ludhiana',
    Crop_Year: String(CURRENT_YEAR),
    Season: 'Kharif',
  });
  const [loading, setLoading]         = useState(false);
  const [result, setResult]           = useState(null);
  const [formSnapshot, setFormSnapshot] = useState(null);
  const [error, setError]             = useState('');

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    const area = parseFloat(form.Area);
    if (!area || area <= 0) { setError(t('farmer.enterValidArea')); return; }

    setLoading(true);
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
      onResult?.({ 
        tonnes: data.predicted_stubble_tonnes, 
        state: form.State_Name, 
        district: form.District_Name,
        cropYear: form.Crop_Year,
        season: form.Season
      });
    } catch (err) {
      setError(err.message || t('errors.predictionFailed'));
    } finally {
      setLoading(false);
    }
  };

  const districts = DISTRICTS[form.State_Name] || [];

  return (
    <div>
      <div className="page-header">
        <h2>🌾 {t('farmer.estimateCardTitle')}</h2>
        <p>{t('farmer.estimateCardDesc')}</p>
      </div>

      <div className="two-col">
        {/* Form */}
        <div className="card">
          <div className="card-title">{t('farmer.searchParams')}</div>
          <div className="card-subtitle">{t('farmer.adjustValues')}</div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">{t('farmer.areaAcre')}</label>
              <input
                type="number"
                className="form-input"
                placeholder={t('farmer.enterArea')}
                min="0.01"
                step="0.01"
                value={form.Area}
                onChange={(e) => set('Area', e.target.value)}
                required
              />
              <span className="form-hint">{t('farmer.estimateCardDesc')}</span>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{t('common.state')}</label>
                <select
                  className="form-select"
                  value={form.State_Name}
                  onChange={(e) => { set('State_Name', e.target.value); set('District_Name', DISTRICTS[e.target.value][0]); }}
                >
                  {STATES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">{t('common.district')}</label>
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
                <label className="form-label">{t('farmer.cropYear')}</label>
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
                <label className="form-label">{t('farmer.season')}</label>
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
              {loading ? t('common.loading') : t('farmer.predictStubble')}
            </button>
          </form>

          {loading && <LoadingSpinner message={t('farmer.calculating')} />}
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
                <div className="result-unit">{t('farmer.predictedQuantity')} ({t('common.tonnesAbbr')})</div>
                <div className="result-label">{t('farmer.stubbleBenchmarkNote')}</div>
              </div>

              <div className="card" style={{ marginTop: 16 }}>
                <div className="card-title">{t('farmer.resultSummary')}</div>
                <table className="metrics-table">
                  <tbody>
                    <tr><td>{t('common.state')}</td><td>{result.state_used}</td></tr>
                    <tr><td>{t('common.district')}</td><td>{result.district_used}</td></tr>
                    <tr><td>{t('farmer.areaAcre')}</td><td>{result.area_hectares} ha</td></tr>
                    <tr><td>{t('farmer.season')}</td><td>{formSnapshot?.Season}</td></tr>
                    <tr><td>{t('farmer.cropYear')}</td><td>{formSnapshot?.Crop_Year}</td></tr>
                    {result.district_baseline_yield_t_ha != null && (
                      <tr><td>{t('farmer.perAcreYield')}</td><td>{result.district_baseline_yield_t_ha?.toFixed(2)} t/ha</td></tr>
                    )}
                  </tbody>
                </table>

                <div className="success-banner" style={{ marginTop: 16, marginBottom: 0 }}>
                  <ArrowRight size={16} />
                  <span>
                    {t('farmer.proceedToBuyers')}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--gray-400)' }}>
              <div style={{ fontSize: '4rem', marginBottom: 16 }}>🌾</div>
              <p>{t('farmer.fillFormPrompt')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
