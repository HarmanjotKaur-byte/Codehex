import { useState, useEffect } from 'react';
import { Star, MapPin, Trash2, MessageCircle, Calendar, X, CheckCircle } from 'lucide-react';
import { expressInterest, getMyInterests } from '../../services/api.js';
import { MOCK_ALL_LISTINGS } from '../../services/mockData.js';

function getSaved() {
  try {
    const raw = localStorage.getItem('paralipay_saved_listings');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    const defaults = [MOCK_ALL_LISTINGS[0], MOCK_ALL_LISTINGS[1]];
    localStorage.setItem('paralipay_saved_listings', JSON.stringify(defaults));
    return defaults;
  } catch {
    return [MOCK_ALL_LISTINGS[0], MOCK_ALL_LISTINGS[1]];
  }
}
function removeSaved(id) {
  const updated = getSaved().filter(l => l.id !== id);
  localStorage.setItem('paralipay_saved_listings', JSON.stringify(updated));
  return updated;
}

function ContactModal({ listing, onClose, onSend, sending }) {
  const [message, setMessage] = useState(
    `Hello, I am interested in purchasing ${listing.quantity_tonnes} tonnes of ${listing.crop || 'residue'} listed at ₹${listing.asking_price_per_tonne}/tonne from ${listing.district}, ${listing.state}. Please let me know if this is still available.`
  );
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16 }}>
      <div className="card" style={{ width: '100%', maxWidth: 460, padding: 24, borderRadius: 14, position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, background: '#f3f4f6', border: 'none', borderRadius: '50%', cursor: 'pointer', padding: 6, display: 'flex' }}>
          <X size={18} color="#4b5563" />
        </button>
        <h3 style={{ margin: '0 0 6px', fontSize: 18 }}>Contact Seller</h3>
        <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 16 }}>
          Sending message to <strong>{listing.farmer_name}</strong>
        </p>
        <div className="form-group" style={{ marginBottom: 16 }}>
          <label className="form-label">Your Message</label>
          <textarea className="form-input" style={{ minHeight: 100 }} value={message} onChange={e => setMessage(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
          <button onClick={() => onSend(listing, message)} className="btn btn-primary" style={{ flex: 2 }} disabled={sending || !message.trim()}>
            {sending ? 'Sending...' : '📨 Send & Register Interest'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SavedListings() {
  const [saved, setSavedState] = useState(getSaved());
  const [myInterestIds, setMyInterestIds] = useState([]);
  const [contactListing, setContactListing] = useState(null);
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    getMyInterests().then(data => {
      setMyInterestIds((data || []).map(i => i.listing_id));
    }).catch(() => {});
  }, []);

  const handleRemove = (id) => {
    const updated = removeSaved(id);
    setSavedState(updated);
  };

  const handleSendInterest = async (listing, message) => {
    setSending(true);
    try {
      await expressInterest({ listing_id: listing.id, message });
      setMyInterestIds(prev => [...prev, listing.id]);
      setContactListing(null);
      setSuccessMsg(`Interest sent to ${listing.farmer_name}! Check "My Activity" for updates.`);
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      alert(err.message || 'Failed to send interest.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Star size={24} color="#ca8a04" /> Saved Listings
        </h2>
        <p style={{ color: '#6b7280', margin: 0 }}>Listings you've bookmarked to review later</p>
      </div>

      {successMsg && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, color: '#15803d' }}>
          <CheckCircle size={18} /> {successMsg}
        </div>
      )}

      {saved.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>⭐</div>
          <h3 style={{ color: '#374151', marginBottom: 8 }}>No saved listings yet</h3>
          <p style={{ color: '#6b7280' }}>Go to "Find Residue" and star listings you'd like to revisit.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 14 }}>
          {saved.map(listing => (
            <div key={listing.id} className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'stretch' }}>
                <div style={{ width: 6, background: '#15803d', flexShrink: 0 }} />
                <div style={{ flex: 1, padding: '16px 18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16, color: '#15803d' }}>{listing.crop || 'Agricultural Residue'}</div>
                      <div style={{ fontSize: 13, color: '#6b7280' }}>{listing.residue_type || ''} {listing.condition ? `· ${listing.condition}` : ''}</div>
                    </div>
                    <button onClick={() => handleRemove(listing.id)} style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '4px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: '#dc2626', fontSize: 12 }}>
                      <Trash2 size={13} /> Remove
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8, marginBottom: 12 }}>
                    <div style={{ background: '#f9fafb', borderRadius: 6, padding: '6px 10px' }}>
                      <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>QUANTITY</div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{listing.quantity_tonnes} t</div>
                    </div>
                    <div style={{ background: '#f9fafb', borderRadius: 6, padding: '6px 10px' }}>
                      <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>PRICE/T</div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#15803d' }}>₹{listing.asking_price_per_tonne?.toLocaleString('en-IN')}</div>
                    </div>
                    <div style={{ background: '#f9fafb', borderRadius: 6, padding: '6px 10px' }}>
                      <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>LOCATION</div>
                      <div style={{ fontWeight: 500, fontSize: 13, display: 'flex', alignItems: 'center', gap: 3 }}>
                        <MapPin size={11} color="#6b7280" /> {listing.district}, {listing.state}
                      </div>
                    </div>
                    <div style={{ background: '#f9fafb', borderRadius: 6, padding: '6px 10px' }}>
                      <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>FARMER</div>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{listing.farmer_name || 'N/A'}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {myInterestIds.includes(listing.id) ? (
                      <button className="btn" style={{ fontSize: 12, padding: '6px 14px', background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: 8, cursor: 'default' }} disabled>
                        <CheckCircle size={13} style={{ marginRight: 4 }} /> Interest Sent
                      </button>
                    ) : (
                      <button onClick={() => setContactListing(listing)} className="btn btn-primary" style={{ fontSize: 12, padding: '6px 14px' }}>
                        <MessageCircle size={13} style={{ marginRight: 4 }} /> Contact Seller
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {contactListing && (
        <ContactModal listing={contactListing} onClose={() => setContactListing(null)} onSend={handleSendInterest} sending={sending} />
      )}
    </div>
  );
}
