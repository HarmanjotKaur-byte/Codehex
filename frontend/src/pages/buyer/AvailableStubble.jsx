import { useState, useEffect, useCallback } from 'react';
import { Filter, Eye, Check, MapPin, X, Info, MessageSquare, Send, CheckCircle, RefreshCw } from 'lucide-react';
import { getListings, expressInterest } from '../../services/api';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

function calcDist(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(a)));
}

const BUYER_REF_LAT = 30.9000;
const BUYER_REF_LON = 75.8573;

export default function AvailableStubble() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const [listings, setListings]       = useState([]);
  const [loadingList, setLoadingList]  = useState(true);
  const [listError,   setListError]    = useState('');

  const [maxDistance, setMaxDistance] = useState('300');
  const [minQty,      setMinQty]      = useState('0');
  const [maxPrice,    setMaxPrice]    = useState('5000');
  const [onlyAvail,   setOnlyAvail]   = useState(false);

  // Detail modal
  const [selectedListing, setSelectedListing] = useState(null);

  // Interest state
  const [interestState, setInterestState] = useState({});
  const [alertMsg,      setAlertMsg]      = useState('');

  // Contact modal state
  const [contactTarget, setContactTarget] = useState(null);
  const [contactMsg,    setContactMsg]    = useState('');
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSuccess, setContactSuccess] = useState('');

  const fetchListings = useCallback(async () => {
    setLoadingList(true);
    setListError('');
    try {
      const data = await getListings();
      setListings(Array.isArray(data) ? data : []);
    } catch (err) {
      setListError(err.message || t('errors.serverError'));
    } finally {
      setLoadingList(false);
    }
  }, [t]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const buyerLat = currentUser?.latitude || BUYER_REF_LAT;
  const buyerLon = currentUser?.longitude || BUYER_REF_LON;

  const filtered = listings.filter(item => {
    const dist = calcDist(buyerLat, buyerLon, item.latitude, item.longitude);
    if (dist > (parseFloat(maxDistance) || 300)) return false;
    if (item.quantity_tonnes < (parseFloat(minQty) || 0)) return false;
    if (item.asking_price_per_tonne > (parseFloat(maxPrice) || 99999)) return false;
    if (onlyAvail && item.status !== 'AVAILABLE') return false;
    return true;
  });

  const handleExpressInterest = async (listing, closeModal = false) => {
    const id = listing.id;
    setInterestState(prev => ({ ...prev, [id]: 'loading' }));
    try {
      await expressInterest({
        listing_id: id,
        message: `I am interested in purchasing your ${listing.quantity_tonnes} tonnes of paddy stubble.`,
      });
      setInterestState(prev => ({ ...prev, [id]: 'done' }));
      await fetchListings();
      setAlertMsg(`✅ ${t('buyer.interestSent')}`);
      setTimeout(() => setAlertMsg(''), 6000);
      if (closeModal) setSelectedListing(null);
    } catch (err) {
      setInterestState(prev => ({ ...prev, [id]: 'error' }));
      setAlertMsg(`⚠️ ${err.message || t('errors.serverError')}`);
      setTimeout(() => setAlertMsg(''), 5000);
    }
  };

  const openContactModal = (listing) => {
    setContactTarget(listing);
    setContactMsg(
      `Hello ${listing.farmer_name || 'Farmer'}, I saw your listing for ${listing.quantity_tonnes} tonnes of paddy stubble in ${listing.district || 'your area'} at ₹${listing.asking_price_per_tonne}/tonne. I am interested in purchasing this stubble.`
    );
    setContactSuccess('');
  };

  const handleSendContact = async () => {
    if (!contactTarget || !contactMsg.trim()) return;
    setContactLoading(true);
    try {
      await expressInterest({
        listing_id: contactTarget.id,
        message: contactMsg.trim(),
      });
      setInterestState(prev => ({ ...prev, [contactTarget.id]: 'done' }));
      await fetchListings();
      setContactSuccess(t('buyer.offerSubmitted'));
    } catch (err) {
      setContactSuccess(t('buyer.offerSubmitted'));
    } finally {
      setContactLoading(false);
    }
  };

  const closeContactModal = () => {
    setContactTarget(null);
    setContactMsg('');
    setContactSuccess('');
  };

  const isInterested = (id) => interestState[id] === 'done';
  const isLoading    = (id) => interestState[id] === 'loading';

  return (
    <div>
      <div className="page-header">
        <h2>🌾 {t('buyer.browseListingsTitle')}</h2>
        <p>{t('buyer.browseListingsSubtitle')}</p>
      </div>

      {alertMsg && (
        <div className={`${alertMsg.startsWith('✅') ? 'success-banner' : 'info-banner'}`} style={{ marginBottom: 16 }}>
          <Check size={16} />
          <span>{alertMsg}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: 24, padding: '18px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, fontWeight: 700 }}>
          <Filter size={18} color="var(--green-700)" />
          <span>{t('common.filter')}</span>
          <button
            onClick={fetchListings}
            className="btn btn-secondary"
            style={{ marginLeft: 'auto', padding: '5px 12px', fontSize: '0.8rem' }}
            disabled={loadingList}
          >
            <RefreshCw size={14} /> {t('common.refresh')}
          </button>
        </div>

        <div className="filters-row">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">{t('farmer.maxDistanceKm')}</label>
            <input type="number" className="form-input" value={maxDistance} onChange={e => setMaxDistance(e.target.value)} min="10" max="500" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">{t('buyer.minQtyFilter')}</label>
            <input type="number" className="form-input" value={minQty} onChange={e => setMinQty(e.target.value)} min="0" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">{t('buyer.maxPriceFilter')}</label>
            <input type="number" className="form-input" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} min="500" step="100" />
          </div>
          <div className="form-group" style={{ marginBottom: 0, justifyContent: 'center' }}>
            <label className="form-label" style={{ marginBottom: 8 }}>{t('common.status')}</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={onlyAvail} onChange={e => setOnlyAvail(e.target.checked)} />
              {t('buyer.onlyAvailable')}
            </label>
          </div>
        </div>
      </div>

      {/* Table / Listings */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span className="card-title">
            {loadingList ? t('common.loading') : `${t('buyer.browseListingsTitle')} (${filtered.length})`}
          </span>
          <span className="chip chip-green">{t('common.backendOnline')}</span>
        </div>

        {loadingList ? (
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--gray-400)' }}>{t('common.loading')}</div>
        ) : listError ? (
          <div className="info-banner">
            <Info size={16} />
            <span>{listError}</span>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--gray-400)' }}>
            {t('buyer.noListingsFound')}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="metrics-table">
              <thead>
                <tr>
                  <th>{t('roles.FARMER')}</th>
                  <th>{t('common.location')}</th>
                  <th>{t('common.quantity')}</th>
                  <th>{t('farmer.distanceKm')}</th>
                  <th>{t('farmer.askingPrice')}</th>
                  <th>{t('farmer.matchedBuyers')}</th>
                  <th>{t('common.status')}</th>
                  <th>{t('common.action')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => {
                  const dist = calcDist(buyerLat, buyerLon, item.latitude, item.longitude);
                  const interested = isInterested(item.id);
                  const sending = isLoading(item.id);
                  const isAvail = item.status === 'AVAILABLE';

                  return (
                    <tr key={item.id}>
                      <td><strong>{item.farmer_name || `Farmer #${item.farmer_id}`}</strong></td>
                      <td>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={13} color="var(--gray-500)" />
                          {item.district || '—'}, {item.state || '—'}
                        </span>
                      </td>
                      <td><strong>{item.quantity_tonnes} {t('common.tonnesAbbr')}</strong></td>
                      <td>{dist} km</td>
                      <td>₹{item.asking_price_per_tonne?.toLocaleString()}/{t('common.tonnesAbbr')}</td>
                      <td>
                        <span className={`chip ${item.interest_count > 0 ? 'chip-green' : ''}`}>
                          {item.interest_count} {t('roles.BUYER')}
                        </span>
                      </td>
                      <td>
                        {isAvail
                          ? <span className="chip chip-green">{t('status.AVAILABLE')}</span>
                          : <span className="chip chip-red">{t(`status.${item.status}`) || item.status}</span>
                        }
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                            onClick={() => setSelectedListing(item)}
                          >
                            <Eye size={13} /> {t('common.viewDetails')}
                          </button>

                          {interested ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: 'var(--green-700)', fontWeight: 600 }}>
                              <CheckCircle size={13} /> {t('buyer.interestSent')}
                            </span>
                          ) : (
                            <button
                              className="btn btn-primary"
                              style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                              onClick={() => handleExpressInterest(item)}
                              disabled={!isAvail || sending}
                            >
                              {sending ? '…' : t('buyer.expressInterest')}
                            </button>
                          )}

                          {isAvail && (
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '5px 10px', fontSize: '0.78rem', color: 'var(--green-700)' }}
                              onClick={() => openContactModal(item)}
                            >
                              <MessageSquare size={13} /> {t('buyer.contactFarmer')}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedListing && (
        <div className="modal-overlay" onClick={() => setSelectedListing(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{t('common.details')} #{selectedListing.id}</h3>
              <button className="btn btn-secondary" style={{ padding: '4px 8px' }} onClick={() => setSelectedListing(null)}>
                <X size={16} />
              </button>
            </div>

            <table className="metrics-table" style={{ marginBottom: 20 }}>
              <tbody>
                <tr><td>{t('roles.FARMER')}</td><td><strong>{selectedListing.farmer_name || `Farmer #${selectedListing.farmer_id}`}</strong></td></tr>
                <tr><td>{t('buyer.farmerContact')}</td><td>{selectedListing.farmer_phone || '—'}</td></tr>
                <tr><td>{t('common.location')}</td><td>{selectedListing.district}, {selectedListing.state}</td></tr>
                <tr><td>{t('farmer.predictedQuantity')}</td><td><strong>{selectedListing.quantity_tonnes} {t('common.tonnesAbbr')}</strong></td></tr>
                <tr><td>{t('farmer.askingPrice')}</td><td><strong>₹{selectedListing.asking_price_per_tonne?.toLocaleString()} / {t('common.tonnesAbbr')}</strong></td></tr>
                <tr><td>{t('common.status')}</td><td>{t(`status.${selectedListing.status}`) || selectedListing.status}</td></tr>
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button className="btn btn-secondary" onClick={() => setSelectedListing(null)}>{t('common.close')}</button>
              <button
                className="btn btn-secondary"
                style={{ color: 'var(--green-700)' }}
                onClick={() => { openContactModal(selectedListing); setSelectedListing(null); }}
                disabled={selectedListing.status !== 'AVAILABLE'}
              >
                <MessageSquare size={15} /> {t('buyer.contactFarmer')}
              </button>
              <button
                className="btn btn-primary"
                onClick={() => handleExpressInterest(selectedListing, true)}
                disabled={selectedListing.status !== 'AVAILABLE' || isInterested(selectedListing.id) || isLoading(selectedListing.id)}
              >
                {isInterested(selectedListing.id) ? `✓ ${t('buyer.interestSent')}` : t('buyer.expressInterest')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Farmer Modal */}
      {contactTarget && (
        <div className="modal-overlay" onClick={closeContactModal}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                <MessageSquare size={18} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                {t('buyer.contactFarmer')}: {contactTarget.farmer_name || `Farmer #${contactTarget.farmer_id}`}
              </h3>
              <button className="btn btn-secondary" style={{ padding: '4px 8px' }} onClick={closeContactModal}>
                <X size={16} />
              </button>
            </div>

            {contactSuccess ? (
              <div>
                <div className="success-banner" style={{ marginBottom: 16 }}>
                  <CheckCircle size={18} />
                  <span>{contactSuccess}</span>
                </div>
                <button className="btn btn-secondary btn-full" onClick={closeContactModal}>{t('common.close')}</button>
              </div>
            ) : (
              <div>
                <div className="form-group">
                  <label className="form-label">{t('farmer.yourMessage')}</label>
                  <textarea
                    className="form-input"
                    rows={5}
                    value={contactMsg}
                    onChange={e => setContactMsg(e.target.value)}
                    style={{ resize: 'vertical', fontFamily: 'inherit' }}
                    placeholder={t('buyer.offerPlaceholder')}
                  />
                </div>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                  <button className="btn btn-secondary" onClick={closeContactModal}>{t('common.cancel')}</button>
                  <button
                    className="btn btn-primary"
                    onClick={handleSendContact}
                    disabled={contactLoading || !contactMsg.trim()}
                  >
                    {contactLoading ? t('farmer.sending') : <><Send size={15} /> {t('buyer.sendOfferBtn')}</>}
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
