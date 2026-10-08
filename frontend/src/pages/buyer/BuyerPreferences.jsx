import { useState } from 'react';
import { Sliders, CheckCircle, Info } from 'lucide-react';
import { DEMO_MARKETPLACE_LISTINGS, calculateDistance } from '../../services/marketplace';
import { useLanguage } from '../../context/LanguageContext';

export default function BuyerPreferences() {
  const { t } = useLanguage();
  const [prefLocation, setPrefLocation] = useState('Ludhiana');
  const [maxDist, setMaxDist] = useState('120');
  const [reqQty, setReqQty] = useState('40');
  const [maxPrice, setMaxPrice] = useState('2200');
  const [prefAvailable, setPrefAvailable] = useState(true);

  const [saved, setSaved] = useState(false);

  const getHubCoords = (loc) => {
    switch (loc) {
      case 'Patiala': return { lat: 30.3398, lon: 76.3869 };
      case 'Karnal':  return { lat: 29.6857, lon: 76.9905 };
      case 'Bathinda': return { lat: 30.2110, lon: 74.9455 };
      default: return { lat: 30.9000, lon: 75.8573 };
    }
  };

  const hub = getHubCoords(prefLocation);

  const scoredListings = DEMO_MARKETPLACE_LISTINGS.map(item => {
    const dist = calculateDistance(hub.lat, hub.lon, item.latitude, item.longitude);
    const maxD = parseFloat(maxDist) || 120;
    const distScore = Math.max(0, 1 - (dist / maxD));
    const maxP = parseFloat(maxPrice) || 2200;
    const priceScore = item.asking_price_per_tonne <= maxP 
      ? Math.min(1, maxP / item.asking_price_per_tonne) 
      : Math.max(0, 1 - (item.asking_price_per_tonne - maxP) / 500);
    const reqQ = parseFloat(reqQty) || 40;
    const volScore = Math.min(1, item.stubble_quantity_tonnes / reqQ);
    const availScore = item.is_available ? 1.0 : 0.0;

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
        <h2>⚙️ {t('buyer.procurementPreferences')}</h2>
        <p>{t('buyer.dashboardSubtitle')}</p>
      </div>

      {saved && (
        <div className="success-banner" style={{ marginBottom: 20 }}>
          <CheckCircle size={16} />
          <span>{t('buyer.preferencesSaved')}</span>
        </div>
      )}

      <div className="two-col">
        {/* Preference Input Form */}
        <div className="card">
          <div className="card-title">{t('buyer.procurementPreferences')}</div>
          <div className="card-subtitle">{t('farmer.adjustValues')}</div>

          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">{t('buyer.preferredHub')}</label>
              <select 
                className="form-select" 
                value={prefLocation} 
                onChange={e => setPrefLocation(e.target.value)}
              >
                <option value="Ludhiana">Ludhiana</option>
                <option value="Patiala">Patiala</option>
                <option value="Bathinda">Bathinda</option>
                <option value="Karnal">Karnal</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">{t('buyer.maxDistanceRadius')}</label>
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
              <label className="form-label">{t('buyer.targetQuantity')}</label>
              <input 
                type="number" 
                className="form-input" 
                value={reqQty} 
                onChange={e => setReqQty(e.target.value)} 
                min="5" 
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('buyer.maxPurchasePrice')}</label>
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
              <label className="form-label">{t('common.status')}</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={prefAvailable} 
                  onChange={e => setPrefAvailable(e.target.checked)} 
                />
                {t('buyer.onlyAvailable')}
              </label>
            </div>

            <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 10 }}>
              <Sliders size={16} /> {t('buyer.savePreferences')}
            </button>
          </form>

          {/* Rule-based weights transparency */}
          <hr className="divider" />
          <div className="card-title" style={{ fontSize: '0.95rem', marginBottom: 6 }}>
            {t('farmer.scoringFormula')}
          </div>
          <table className="metrics-table">
            <thead>
              <tr><th>{t('farmer.factor')}</th><th>{t('farmer.weight')}</th></tr>
            </thead>
            <tbody>
              <tr><td>{t('farmer.distanceFactor')}</td><td><strong>35%</strong></td></tr>
              <tr><td>{t('farmer.priceFactor')}</td><td><strong>35%</strong></td></tr>
              <tr><td>{t('farmer.capacityFactor')}</td><td><strong>20%</strong></td></tr>
              <tr><td>{t('farmer.availFactor')}</td><td><strong>10%</strong></td></tr>
            </tbody>
          </table>
        </div>

        {/* Dynamic Ranked Results based on preferences */}
        <div>
          <div className="card">
            <div className="card-title">{t('buyer.suitabilityRanking')}</div>
            <div className="card-subtitle">
              {prefLocation}
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
                          {item.district}, {item.state} · {t('buyer.distanceKm', { dist: item.distance })} · {item.stubble_quantity_tonnes} {t('common.tonnesAbbr')} @ ₹{item.asking_price_per_tonne}/{t('common.tonnesAbbr')}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--green-700)' }}>
                          {item.suitability_score}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--gray-500)' }}>{t('buyer.suitabilityScore')}</div>
                      </div>
                    </div>

                    <div className="score-breakdown" style={{ marginTop: 8 }}>
                      <span>{t('farmer.distanceFactor')}: {item.distScore}%</span>
                      <span>{t('farmer.priceFactor')}: {item.priceScore}%</span>
                      <span>{t('farmer.capacityFactor')}: {item.volScore}%</span>
                      <span>{t('farmer.availFactor')}: {item.availScore}%</span>
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
