import { useState } from 'react';
import { Wheat, ArrowRight } from 'lucide-react';
import { predictStubble } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useLanguage } from '../context/LanguageContext';

const STATES = ['Punjab', 'Haryana', 'Rajasthan'];

const DISTRICTS = {
  Punjab:  ['Ludhiana', 'Amritsar', 'Patiala', 'Bathinda', 'Jalandhar', 'Sangrur', 'Firozpur', 'Moga', 'Hoshiarpur', 'Mansa', 'Muktsar'],
  Haryana: ['Karnal', 'Ambala', 'Kurukshetra', 'Panipat', 'Hisar', 'Fatehabad', 'Sirsa', 'Rohtak', 'Kaithal'],
  Rajasthan: ['Sri Ganganagar', 'Hanumangarh', 'Alwar', 'Kota', 'Bikaner', 'Bharatpur', 'Jaipur'],
};

const SEASONS = ['Kharif', 'Whole Year'];
const CURRENT_YEAR = new Date().getFullYear();

export default function StubbleEstimate({ onResult, onNavigateBuyers }) {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    Area: '10',
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
      const tonnesVal = data?.predicted_stubble_tonnes ?? data?.tonnes ?? data?.estimated_tonnes ?? (area * 2.85);
      onResult?.({ 
        tonnes: typeof tonnesVal === 'string' ? parseFloat(tonnesVal) : tonnesVal, 
        state: data?.state_used || form.State_Name, 
        district: data?.district_used || form.District_Name,
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
            (() => {
              const predictedTonnes = result?.predicted_stubble_tonnes ?? result?.tonnes ?? result?.estimated_tonnes ?? (formSnapshot?.Area ? (parseFloat(formSnapshot.Area) * 2.85).toFixed(1) : 28.5);
              const stateUsed = result?.state_used || result?.state || formSnapshot?.State_Name || form.State_Name;
              const districtUsed = result?.district_used || result?.district || formSnapshot?.District_Name || form.District_Name;
              const areaUsed = result?.area_hectares != null ? `${result.area_hectares} ha` : (formSnapshot?.Area ? `${(parseFloat(formSnapshot.Area) * 0.404686).toFixed(2)} ha (${formSnapshot.Area} acres)` : `${form.Area} acres`);
              const baselineYield = result?.district_baseline_yield_t_ha != null ? `${result.district_baseline_yield_t_ha.toFixed(2)} t/ha` : '3.45 t/ha';

              return (
                <>
                  <div className="result-big">
                    <div className="result-value">
                      {typeof predictedTonnes === 'number'
                        ? predictedTonnes.toLocaleString(undefined, { maximumFractionDigits: 1 })
                        : predictedTonnes}
                    </div>
                    <div className="result-unit">{t('farmer.predictedQuantity')} ({t('common.tonnesAbbr')})</div>
                    <div className="result-label">{t('farmer.stubbleBenchmarkNote')}</div>
                  </div>

                  <div className="card" style={{ marginTop: 16 }}>
                    <div className="card-title">{t('farmer.resultSummary')}</div>
                    <table className="metrics-table">
                      <tbody>
                        <tr><td>{t('common.state')}</td><td>{stateUsed}</td></tr>
                        <tr><td>{t('common.district')}</td><td>{districtUsed}</td></tr>
                        <tr><td>{t('farmer.areaAcre')}</td><td>{areaUsed}</td></tr>
                        <tr><td>{t('farmer.season')}</td><td>{formSnapshot?.Season || form.Season}</td></tr>
                        <tr><td>{t('farmer.cropYear')}</td><td>{formSnapshot?.Crop_Year || form.Crop_Year}</td></tr>
                        <tr><td>{t('farmer.perAcreYield')}</td><td>{baselineYield}</td></tr>
                      </tbody>
                    </table>

                    <div
                      className="success-banner"
                      style={{ marginTop: 16, marginBottom: 0, cursor: 'pointer' }}
                      onClick={() => onNavigateBuyers?.()}
                      title="Click to view matching biomass buyers"
                    >
                      <ArrowRight size={16} />
                      <span>
                        {t('farmer.proceedToBuyers')}
                      </span>
                    </div>
                  </div>
                </>
              );
            })()
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
