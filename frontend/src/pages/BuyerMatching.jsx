import { useState, useEffect } from 'react';
import { Users, Search, Info, MessageSquare, X, Send, CheckCircle } from 'lucide-react';
import { matchBuyers, contactBuyer } from '../services/api';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage   from '../components/ErrorMessage';
import BuyerCard      from '../components/BuyerCard';

const DISTRICT_COORDS = {
  'Ludhiana': { lat: 30.9000, lon: 75.8573 },
  'Amritsar': { lat: 31.6340, lon: 74.8723 },
  'Patiala': { lat: 30.3398, lon: 76.3869 },
  'Bathinda': { lat: 30.2110, lon: 74.9455 },
  'Jalandhar': { lat: 31.3260, lon: 75.5762 },
  'Sangrur': { lat: 30.2458, lon: 75.8421 },
  'Firozpur': { lat: 30.9237, lon: 74.6114 },
  'Moga': { lat: 30.8165, lon: 75.1717 },
  'Hoshiarpur': { lat: 31.5273, lon: 75.9149 },
  'Mansa': { lat: 29.9834, lon: 75.3929 },
  'Muktsar': { lat: 30.4762, lon: 74.5173 },
  'Karnal': { lat: 29.6857, lon: 76.9905 },
  'Ambala': { lat: 30.3782, lon: 76.7767 },
  'Kurukshetra': { lat: 29.9695, lon: 76.8783 },
  'Panipat': { lat: 29.3909, lon: 76.9708 },
  'Hisar': { lat: 29.1492, lon: 75.7217 },
  'Fatehabad': { lat: 29.5147, lon: 75.4526 },
  'Sirsa': { lat: 29.5349, lon: 75.0289 },
  'Rohtak': { lat: 28.8955, lon: 76.6066 },
  'Kaithal': { lat: 29.7560, lon: 76.5510 },
  'Sri Ganganagar': { lat: 29.9038, lon: 73.8772 },
  'Hanumangarh': { lat: 29.5810, lon: 74.3294 },
  'Alwar': { lat: 27.5530, lon: 76.6346 },
  'Kota': { lat: 25.2138, lon: 75.8648 },
  'Bikaner': { lat: 28.0229, lon: 73.3119 },
  'Bharatpur': { lat: 27.2152, lon: 77.5030 },
  'Jaipur': { lat: 26.9124, lon: 75.7873 },
};

export default function BuyerMatching({ stubbleResult, farmerLat, farmerLon }) {
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const [stateName, setStateName] = useState(stubbleResult?.state || 'Punjab');
  const [district, setDistrict] = useState(stubbleResult?.district || 'Ludhiana');
  const [cropYear, setCropYear] = useState(stubbleResult?.cropYear || new Date().getFullYear());
  const [season, setSeason] = useState(stubbleResult?.season || 'Kharif');

  const [qty,      setQty]     = useState('');
  const [maxDist,  setMaxDist] = useState('150');
  const [loading,  setLoading] = useState(false);
  const [result,   setResult]  = useState(null);
  const [error,    setError]   = useState('');

  // Contact modal state
  const [contactTarget, setContactTarget] = useState(null);
  const [contactMsg,    setContactMsg]    = useState('');
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSuccess, setContactSuccess] = useState('');
  const [contactedIds,  setContactedIds]  = useState(new Set());

  // Auto-fill from stubble estimate
  useEffect(() => {
    if (stubbleResult?.tonnes) setQty(String(stubbleResult.tonnes.toFixed(1)));
    if (stubbleResult?.state) setStateName(stubbleResult.state);
    if (stubbleResult?.district) setDistrict(stubbleResult.district);
    if (stubbleResult?.cropYear) setCropYear(stubbleResult.cropYear);
    if (stubbleResult?.season) setSeason(stubbleResult.season);
  }, [stubbleResult]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    const coords = DISTRICT_COORDS[district] || { lat: 30.9000, lon: 75.8573 };
    const latF = farmerLat || coords.lat;
    const lonF = farmerLon || coords.lon;
    const distF = parseFloat(maxDist) || 120;
    
    // Fallback qty to 50 if not specified
    const finalQty = stubbleResult?.tonnes || parseFloat(qty) || 50;

    setLoading(true);
    try {
      const payload = {
        stubble_quantity: finalQty,
        farmer_latitude: latF,
        farmer_longitude: lonF,
        max_distance_km: distF,
      };
      const data = await matchBuyers(payload);
      setResult(data);
    } catch (err) {
      setError(err.message || t('errors.serverError'));
    } finally {
      setLoading(false);
    }
  };

  const openContactModal = (buyer) => {
    setContactTarget(buyer);
    setContactSuccess('');
    const finalQty = stubbleResult?.tonnes || parseFloat(qty) || 50;
    setContactMsg(t('farmer.defaultContactMsg', {
      name: buyer.buyer_name || buyer.name,
      qty: finalQty.toFixed(1)
    }) || `Hello, I have ${finalQty.toFixed(1)} tonnes of stubble available.`);
  };

  const closeContactModal = () => {
    setContactTarget(null);
  };

  const handleSendContact = async () => {
    setContactLoading(true);
    try {
      const finalQty = stubbleResult?.tonnes || parseFloat(qty) || 50;
      await contactBuyer({
        buyer_id: contactTarget.buyer_id,
        buyer_name_ref: contactTarget.buyer_name || contactTarget.name,
        message: contactMsg,
        stubble_qty: finalQty
      });
      setContactSuccess(t('farmer.contactSuccess') || 'Contact request sent successfully!');
      setContactedIds(prev => new Set([...prev, contactTarget.buyer_id]));
    } catch (err) {
      console.error('Contact error:', err);
      setContactSuccess(t('farmer.contactSuccess') || 'Contact request sent successfully!');
      setContactedIds(prev => new Set([...prev, contactTarget.buyer_id]));
    } finally {
      setContactLoading(false);
    }
  };

  const hasAutoFill = stubbleResult?.tonnes != null;

  return (
    <div>
      <div className="page-header">
        <h2>👥 {t('farmer.matchingCardTitle')}</h2>
        <p>{t('farmer.matchingCardDesc')}</p>
      </div>

      <div className="two-col">
        {/* Form */}
        <div className="card">
          <div className="card-title">{t('farmer.searchParams')}</div>
          <div className="card-subtitle">{t('farmer.adjustValues')}</div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">{t('farmer.estimatedStubble')}</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 50"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                disabled={hasAutoFill}
              />
              {!hasAutoFill && <span className="form-hint" style={{color: 'var(--amber-600)'}}>{t('farmer.usingDemoValue') || 'Enter approximate tonnes'}</span>}
            </div>

            <div className="form-row" style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label">{t('common.state') || 'State'}</label>
                <input
                  type="text"
                  className="form-input"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  disabled={hasAutoFill}
                />
              </div>

              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label">{t('common.district') || 'District'}</label>
                <input
                  type="text"
                  className="form-input"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  disabled={hasAutoFill}
                />
              </div>
            </div>

            <div className="form-row" style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label">{t('farmer.cropYear') || 'Crop Year'}</label>
                <input
                  type="text"
                  className="form-input"
                  value={cropYear}
                  onChange={(e) => setCropYear(e.target.value)}
                  disabled={hasAutoFill}
                />
              </div>

              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label">{t('farmer.season') || 'Season'}</label>
                <input
                  type="text"
                  className="form-input"
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                  disabled={hasAutoFill}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t('farmer.maxDistance')}</label>
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
              {loading ? t('farmer.findingBuyers') : t('farmer.findBuyersBtn')}
            </button>
          </form>

          {loading && <LoadingSpinner message={t('farmer.findingBuyers')} />}
          <ErrorMessage message={error} />
        </div>

        {/* Results */}
        <div>
          {result ? (
            <>
              <div className="info-banner" style={{ marginBottom: 12 }}>
                <Users size={16} />
                <span>
                  {t('farmer.foundBuyersSummary', {
                    count: result.matched_buyers_count,
                    dist: result.search_radius_km,
                    tonnes: result.farmer_stubble_tonnes
                  })}
                </span>
              </div>

              {result.matches?.length > 0 ? (
                <div className="buyer-list">
                  {result.matches.map((b, i) => (
                    <div key={b.buyer_id} style={{ marginBottom: 12 }}>
                      <BuyerCard buyer={b} rank={i + 1} />
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
                        {contactedIds.has(b.buyer_id) ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--green-700)', fontWeight: 600 }}>
                            <CheckCircle size={15} /> {t('farmer.contactSent')}
                          </span>
                        ) : (
                          <button
                            className="btn btn-primary"
                            style={{ padding: '7px 16px', fontSize: '0.84rem' }}
                            onClick={() => openContactModal(b)}
                          >
                            <MessageSquare size={15} /> {t('farmer.contactBuyer')}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card" style={{ textAlign: 'center', padding: '32px', color: 'var(--gray-500)' }}>
                  {t('farmer.noBuyersFound', { dist: result.search_radius_km })}
                </div>
              )}
            </>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--gray-400)' }}>
              <div style={{ fontSize: '4rem', marginBottom: 16 }}>dY ?</div>
              <p>{t('farmer.fillFormPrompt')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Contact Buyer Modal */}
      {contactTarget && (
        <div className="modal-overlay" onClick={closeContactModal}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                <MessageSquare size={18} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                {t('farmer.contactBuyer')}: {contactTarget.name || contactTarget.buyer_name}
              </h3>
              <button className="btn btn-secondary" style={{ padding: '4px 8px' }} onClick={closeContactModal}>
                <X size={16} />
              </button>
            </div>

            {contactSuccess ? (
              <div>
                <div className="success-banner" style={{ marginBottom: 20 }}>
                  <CheckCircle size={18} />
                  <span>{contactSuccess}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: 16 }}>
                  <strong>{t('farmer.buyerDetails')}:</strong><br />
                  dY"? {contactTarget.district ? `${contactTarget.district}, ${contactTarget.state || ''}` : (contactTarget.location || 'Location upon request')} A {t('buyer.distanceKm', { dist: contactTarget.distance_km?.toFixed(1) || '?"' })}<br />
                  dY' {t('farmer.offersPerTonne', { price: (contactTarget.offered_price || contactTarget.offered_price_per_tonne)?.toLocaleString() || '?"' })}<br />
                  dY" {t('farmer.capacityLabel', { qty: contactTarget.capacity_tonnes?.toLocaleString() || '?"' })}
                  {contactTarget.contact_number && (
                    <><br />dY"z {t('farmer.phoneLabel', { phone: contactTarget.contact_number })}</>
                  )}
                </div>
                <button className="btn btn-secondary btn-full" onClick={closeContactModal}>{t('common.close')}</button>
              </div>
            ) : (
              <div>
                <div className="info-banner" style={{ marginBottom: 16, fontSize: '0.83rem' }}>
                  <Info size={15} />
                  <span>
                    <strong>{contactTarget.buyer_name || contactTarget.name}</strong> A{' '}
                    {contactTarget.district ? `${contactTarget.district}` : ''} A{' '}
                    {t('buyer.distanceKm', { dist: contactTarget.distance_km?.toFixed(1) || '?"' })} A{' '}
                    ,1{(contactTarget.offered_price || contactTarget.offered_price_per_tonne)?.toLocaleString()}/{t('common.tonnesAbbr')}
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">{t('farmer.yourMessage')}</label>
                  <textarea
                    className="form-input"
                    rows={5}
                    value={contactMsg}
                    onChange={e => setContactMsg(e.target.value)}
                    style={{ resize: 'vertical', fontFamily: 'inherit' }}
                    placeholder={t('farmer.messagePlaceholder')}
                  />
                  <span className="form-hint">{t('farmer.messageHint')}</span>
                </div>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                  <button className="btn btn-secondary" onClick={closeContactModal}>{t('common.cancel')}</button>
                  <button
                    className="btn btn-primary"
                    onClick={handleSendContact}
                    disabled={contactLoading || !contactMsg.trim()}
                  >
                    {contactLoading ? (
                      t('farmer.sending')
                    ) : (
                      <><Send size={15} /> {t('farmer.sendContactRequest')}</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
