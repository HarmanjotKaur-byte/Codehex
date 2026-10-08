import { useState, useEffect, useCallback } from 'react';
import { Bell, Package, MessageSquare, RefreshCw, CheckCircle, Clock, XCircle, Info } from 'lucide-react';
import { getFarmerListingInterests, getMyListings, getMyContacts } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function FarmerActivity() {
  const { t, language } = useLanguage();
  const [interests,  setInterests]  = useState([]);
  const [listings,   setListings]   = useState([]);
  const [contacts,   setContacts]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [tab, setTab] = useState('interests'); const [viewingListing, setViewingListing] = useState(null); const [editingListing, setEditingListing] = useState(null); const [editForm, setEditForm] = useState({ quantity_tonnes: '', asking_price_per_tonne: '' });


  const handleEditClick = (listing) => {
    setEditingListing(listing);
    setEditForm({
      quantity_tonnes: listing.quantity_tonnes || '',
      asking_price_per_tonne: listing.asking_price_per_tonne || '',
      crop: listing.crop || '',
      condition: listing.condition || '',
    });
  };

  const handleUpdateListing = async () => {
    try {
      const res = await fetch(`/api/listings/${editingListing.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('paralipay_token')}`
        },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        setEditingListing(null);
        fetchAll();
      } else {
        alert("Failed to update");
      }
    } catch (e) {
      console.error(e);
      alert("Error updating");
    }
  };

  const handleDeleteListing = async (id) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('paralipay_token')}`
        }
      });
      if (res.ok) {
        fetchAll();
      } else {
        alert("Failed to delete");
      }
    } catch (e) {
      console.error(e);
      alert("Error deleting");
    }
  };

  const statusBadge = (status) => {
    const label = t(`status.${status}`) || status;
    const isGreen = status === 'INTERESTED' || status === 'ACCEPTED' || status === 'AVAILABLE' || status === 'VERIFIED';
    const isRed = status === 'REJECTED' || status === 'CANCELLED';
    const cls = isGreen ? 'chip chip-green' : isRed ? 'chip chip-red' : 'chip';
    const icon = isGreen ? <CheckCircle size={12} /> : isRed ? <XCircle size={12} /> : null;
    return (
      <span className={cls} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        {icon}{label}
      </span>
    );
  };

  const fmtDate = (d) => {
    if (!d) return '—';
    try {
      const localeMap = { en: 'en-IN', hi: 'hi-IN', pa: 'pa-IN' };
      return new Date(d).toLocaleString(localeMap[language] || 'en-IN', {
        dateStyle: 'medium', timeStyle: 'short'
      });
    } catch (_) {
      return String(d);
    }
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [interestData, listingData, contactData] = await Promise.all([
        getFarmerListingInterests(),
        getMyListings(),
        getMyContacts(),
      ]);
      setInterests(Array.isArray(interestData) ? interestData : []);
      setListings(Array.isArray(listingData) ? listingData : []);
      setContacts(Array.isArray(contactData) ? contactData : []);
    } catch (err) {
      setError(err.message || t('errors.serverError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => { fetchAll(); }, [tab, fetchAll]);

  const newInterests = interests.filter(i => i.status === 'INTERESTED').length;

  return (
    <div>
      <div className="page-header">
        <h2>🔔 {t('farmer.activityCardTitle')}</h2>
        <p>{t('farmer.activityCardDesc')}</p>
      </div>

      {/* Summary cards */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: 'var(--green-100)', color: 'var(--green-700)' }}>
            <Bell size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">{t('farmer.receivedInterests')}</span>
            <span className="stat-value">{interests.length}</span>
            <span className="stat-sub">{newInterests} {t('status.PENDING')}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: 'var(--blue-100)', color: 'var(--blue-600)' }}>
            <Package size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">{t('farmer.myListings')}</span>
            <span className="stat-value">{listings.length}</span>
            <span className="stat-sub">{listings.filter(l => l.status === 'AVAILABLE').length} {t('status.AVAILABLE')}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: '#fef3c7', color: '#b45309' }}>
            <MessageSquare size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">{t('farmer.contactRequests')}</span>
            <span className="stat-value">{contacts.length}</span>
            <span className="stat-sub">{t('farmer.contactSent')}</span>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[
          { id: 'interests', label: `📬 ${t('farmer.receivedInterests')} (${interests.length})` },
          { id: 'listings',  label: `📦 ${t('farmer.myListings')} (${listings.length})` },
          { id: 'contacts',  label: `💬 ${t('farmer.contactRequests')} (${contacts.length})` },
        ].map(tb => (
          <button
            key={tb.id}
            onClick={() => setTab(tb.id)}
            className={`btn ${tab === tb.id ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.85rem', padding: '8px 14px' }}
          >
            {tb.label}
          </button>
        ))}
        <button
          onClick={fetchAll}
          className="btn btn-secondary"
          style={{ marginLeft: 'auto', fontSize: '0.82rem', padding: '8px 12px' }}
          disabled={loading}
        >
          <RefreshCw size={14} /> {t('common.refresh')}
        </button>
      </div>

      {error && (
        <div className="info-banner" style={{ marginBottom: 16 }}>
          <Info size={16} /><span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--gray-400)' }}>
          {t('common.loading')}
        </div>
      ) : (
        <>
          {/* Buyer Interests Tab */}
          {tab === 'interests' && (
            <div className="card">
              <div className="card-title" style={{ marginBottom: 16 }}>{t('farmer.receivedInterests')}</div>
              {interests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--gray-400)' }}>
                  <div>No Data</div>
                  <p>{t('farmer.noInterestsYet')}</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="metrics-table">
                    <thead>
                      <tr>
                        <th>{t('roles.BUYER')}</th>
                        <th>{t('common.fullName')}</th>
                        <th>{t('common.phone')}</th>
                        <th>{t('farmer.postListingTitle')}</th>
                        <th>{t('farmer.buyerMessage')}</th>
                        <th>{t('common.status')}</th>
                        <th>{t('common.date')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {interests.map(i => (
                        <tr key={i.interest_id}>
                          <td><strong>{i.buyer_name}</strong></td>
                          <td>{i.buyer_business || '—'}</td>
                          <td>{i.buyer_phone || '—'}</td>
                          <td>
                            <span style={{ fontSize: '0.82rem' }}>
                              #{i.listing_id}<br />
                              {i.listing_qty}{t('common.tonnesAbbr')} · ₹{i.listing_price?.toLocaleString()}/{t('common.tonnesAbbr')}<br />
                              <span style={{ color: 'var(--gray-500)' }}>{i.listing_district}</span>
                            </span>
                          </td>
                          <td style={{ maxWidth: 200 }}>
                            <span style={{ fontSize: '0.82rem', color: 'var(--gray-600)', wordBreak: 'break-word' }}>
                              {i.message || <em style={{ color: 'var(--gray-400)' }}>—</em>}
                            </span>
                          </td>
                          <td>{statusBadge(i.status)}</td>
                          <td>
                            <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
                              <Clock size={12} style={{ verticalAlign: 'middle', marginRight: 3 }} />
                              {fmtDate(i.interest_date)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* My Listings Tab */}
          {tab === 'listings' && (
            <div className="card">
              <div className="card-title" style={{ marginBottom: 16 }}>{t('farmer.myListings')}</div>
              {listings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--gray-400)' }}>
                  <div>No Data</div>
                  <p>{t('farmer.noListingsYet')}</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="metrics-table">
                    <thead>
                      <tr>
                        <th>{t('farmer.listingId', { id: '' })}</th>
                        <th>{t('common.quantity')}</th>
                        <th>{t('common.price')}</th>
                        <th>{t('common.location')}</th>
                        <th>{t('farmer.matchedBuyers')}</th>
                        <th>{t('common.status')}</th>
                        <th>{t('common.date')}</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listings.map(l => (
                        <tr key={l.id}>
                          <td><strong>#{l.id}</strong></td>
                          <td>{l.quantity_tonnes} {t('common.tonnesAbbr')}</td>
                          <td>₹{l.asking_price_per_tonne?.toLocaleString()}/{t('common.tonnesAbbr')}</td>
                          <td>{l.district}, {l.state}</td>
                          <td>
                            <span className={`chip ${l.interest_count > 0 ? 'chip-green' : ''}`}>
                              {l.interest_count} {t('roles.BUYER')}
                            </span>
                          </td>
                          <td>{statusBadge(l.status)}</td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{fmtDate(l.created_at)}</td>
                          <td>
                            <button onClick={() => setViewingListing(l)} className="btn btn-secondary" style={{padding: '4px 8px', fontSize: '0.75rem', marginRight: 4}}>View</button>
                            <button onClick={() => handleEditClick(l)} className="btn btn-primary" style={{padding: '4px 8px', fontSize: '0.75rem', marginRight: 4}}>Edit</button>
                            <button onClick={() => handleDeleteListing(l.id)} className="btn btn-secondary" style={{padding: '4px 8px', fontSize: '0.75rem', color: 'red'}}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Contacts Sent Tab */}
          {tab === 'contacts' && (
            <div className="card">
              <div className="card-title" style={{ marginBottom: 16 }}>{t('farmer.contactRequests')}</div>
              {contacts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--gray-400)' }}>
                  <div>No Data</div>
                  <p>{t('farmer.noContactsYet')}</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="metrics-table">
                    <thead>
                      <tr>
                        <th>{t('roles.BUYER')}</th>
                        <th>{t('farmer.yourMessage')}</th>
                        <th>{t('common.quantity')}</th>
                        <th>{t('common.date')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contacts.map(c => (
                        <tr key={c.id}>
                          <td><strong>{c.buyer_name_ref || `Buyer #${c.buyer_id}`}</strong></td>
                          <td style={{ maxWidth: 280 }}>
                            <span style={{ fontSize: '0.82rem', color: 'var(--gray-700)', wordBreak: 'break-word' }}>
                              {c.message}
                            </span>
                          </td>
                          <td>{c.stubble_qty ? `${c.stubble_qty} ${t('common.tonnesAbbr')}` : '—'}</td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{fmtDate(c.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
      {viewingListing && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
          <div className="card" style={{width: 400, padding: 24}}>
            <h3>Listing Details #{viewingListing.id}</h3>
            <p><strong>Quantity:</strong> {viewingListing.quantity_tonnes} tonnes</p>
            <p><strong>Price:</strong> ₹{viewingListing.asking_price_per_tonne}</p>
            <p><strong>Crop:</strong> {viewingListing.crop || 'N/A'}</p>
            <p><strong>Condition:</strong> {viewingListing.condition || 'N/A'}</p>
            <p><strong>Village:</strong> {viewingListing.village || 'N/A'}, {viewingListing.district}, {viewingListing.state}</p>
            <button onClick={() => setViewingListing(null)} className="btn btn-secondary" style={{marginTop: 16, width: '100%'}}>Close</button>
          </div>
        </div>
      )}

      {editingListing && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
          <div className="card" style={{width: 400, padding: 24}}>
            <h3>Edit Listing #{editingListing.id}</h3>
            <div className="form-group" style={{marginTop: 16}}>
              <label className="form-label">Quantity (Tonnes)</label>
              <input type="number" className="form-input" value={editForm.quantity_tonnes} onChange={e => setEditForm({...editForm, quantity_tonnes: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Price (₹ per tonne)</label>
              <input type="number" className="form-input" value={editForm.asking_price_per_tonne} onChange={e => setEditForm({...editForm, asking_price_per_tonne: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Crop</label>
              <input type="text" className="form-input" value={editForm.crop} onChange={e => setEditForm({...editForm, crop: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Condition</label>
              <input type="text" className="form-input" value={editForm.condition} onChange={e => setEditForm({...editForm, condition: e.target.value})} />
            </div>
            <div style={{display: 'flex', gap: 8, marginTop: 16}}>
              <button onClick={handleUpdateListing} className="btn btn-primary" style={{flex: 1}}>Save</button>
              <button onClick={() => setEditingListing(null)} className="btn btn-secondary" style={{flex: 1}}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
