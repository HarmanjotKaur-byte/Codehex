import { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, Filter, X, Heart, HeartOff, MessageCircle, ChevronDown, ChevronUp, Wheat, Package, Calendar, Tag, Phone, CheckCircle, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { getListings, expressInterest, getMyInterests } from '../../services/api.js';

const CROPS = ['', 'Paddy (Rice)', 'Wheat', 'Sugarcane', 'Maize', 'Other'];
const RESIDUE_TYPES = ['', 'Loose Straw', 'Baled Straw', 'Pellets', 'Other'];
const CONDITIONS = ['', 'Dry', 'Wet', 'Semi-Dry'];
const STATES = ['', 'Punjab', 'Haryana'];
const DISTRICTS = {
  Punjab:  ['Ludhiana', 'Amritsar', 'Patiala', 'Bathinda', 'Jalandhar', 'Sangrur'],
  Haryana: ['Karnal', 'Ambala', 'Kurukshetra', 'Panipat'],
};

// Saved listings stored in localStorage
function getSaved() {
  try { return JSON.parse(localStorage.getItem('paralipay_saved_listings') || '[]'); } catch { return []; }
}
function setSaved(arr) {
  localStorage.setItem('paralipay_saved_listings', JSON.stringify(arr));
}

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function ListingCard({ listing, savedIds, onToggleSave, myInterestIds, onContact, onViewDetails }) {
  const isSaved = savedIds.includes(listing.id);
  const hasInterest = myInterestIds.includes(listing.id);

  const statusColor = listing.condition === 'Dry' ? '#16a34a' : listing.condition === 'Wet' ? '#2563eb' : '#d97706';

  return (
    <div className="card" style={{ marginBottom: 16, border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', transition: 'box-shadow 0.2s' }}
      onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.10)'}
      onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
    >
      {/* Card Header */}
      <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', padding: '14px 18px', borderBottom: '1px solid #d1fae5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ background: '#16a34a', color: 'white', padding: '6px', borderRadius: '50%' }}>
            <Wheat size={16} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#15803d' }}>{listing.crop || 'Agricultural Residue'}</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>{listing.residue_type || 'Residue'}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {listing.condition && (
            <span style={{ background: statusColor + '20', color: statusColor, padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
              {listing.condition}
            </span>
          )}
          <button
            onClick={() => onToggleSave(listing)}
            style={{ background: isSaved ? '#fef9c3' : '#f9fafb', border: '1px solid ' + (isSaved ? '#fde047' : '#e5e7eb'), borderRadius: '50%', padding: 6, cursor: 'pointer', display: 'flex' }}
            title={isSaved ? 'Remove from saved' : 'Save listing'}
          >
            {isSaved ? <Star size={16} color="#ca8a04" fill="#ca8a04" /> : <Star size={16} color="#9ca3af" />}
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div style={{ padding: '14px 18px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600, marginBottom: 2 }}>Quantity</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>{listing.quantity_tonnes} <span style={{ fontWeight: 400, fontSize: 13, color: '#6b7280' }}>tonnes</span></div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600, marginBottom: 2 }}>Price per Tonne</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#15803d' }}>₹{listing.asking_price_per_tonne?.toLocaleString('en-IN')}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600, marginBottom: 2 }}>Location</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#374151', fontWeight: 500 }}>
              <MapPin size={13} color="#6b7280" />
              {[listing.village, listing.district, listing.state].filter(Boolean).join(', ') || 'N/A'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600, marginBottom: 2 }}>Harvest Date</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#374151' }}>
              <Calendar size={13} color="#6b7280" />
              {listing.harvest_date ? new Date(listing.harvest_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#f9fafb', borderRadius: 8, marginBottom: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1d4ed8' }}>{(listing.farmer_name || 'F')[0].toUpperCase()}</span>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{listing.farmer_name || 'Farmer'}</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Farmer · Listing #{listing.id}</div>
          </div>
          {listing.distance_km !== undefined && (
            <div style={{ marginLeft: 'auto', fontSize: 12, color: '#6b7280', background: '#f0fdf4', padding: '3px 8px', borderRadius: 12, border: '1px solid #bbf7d0' }}>
              📍 {listing.distance_km.toFixed(1)} km away
            </div>
          )}
        </div>

        {/* Total estimate */}
        <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '8px 12px', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#15803d', fontWeight: 500 }}>Estimated Total Value</span>
          <span style={{ fontWeight: 700, fontSize: 15, color: '#15803d' }}>₹{(listing.quantity_tonnes * listing.asking_price_per_tonne).toLocaleString('en-IN')}</span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => onViewDetails(listing)}
            className="btn btn-secondary"
            style={{ flex: 1, fontSize: 13, padding: '8px 12px' }}
          >
            View Details
          </button>
          {hasInterest ? (
            <button className="btn" style={{ flex: 1, fontSize: 13, padding: '8px 12px', background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: 8, cursor: 'default' }} disabled>
              <CheckCircle size={14} style={{ marginRight: 4 }} /> Interest Sent
            </button>
          ) : (
            <button
              onClick={() => onContact(listing)}
              className="btn btn-primary"
              style={{ flex: 1, fontSize: 13, padding: '8px 12px' }}
            >
              <MessageCircle size={14} style={{ marginRight: 4 }} /> Contact Seller
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailModal({ listing, onClose, onContact, hasInterest }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16 }}>
      <div className="card" style={{ width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', padding: 0, borderRadius: 14 }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #15803d, #16a34a)', color: 'white', padding: '20px 24px', borderRadius: '14px 14px 0 0', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', cursor: 'pointer', padding: 6, display: 'flex' }}>
            <X size={18} color="white" />
          </button>
          <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>Listing #{listing.id}</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{listing.crop || 'Agricultural Residue'}</div>
          <div style={{ fontSize: 13, opacity: 0.85 }}>{listing.residue_type || ''}</div>
        </div>

        <div style={{ padding: '20px 24px' }}>
          {/* Key stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Quantity', value: `${listing.quantity_tonnes} tonnes`, icon: '⚖️' },
              { label: 'Price/tonne', value: `₹${listing.asking_price_per_tonne?.toLocaleString('en-IN')}`, icon: '💰' },
              { label: 'Total Value', value: `₹${(listing.quantity_tonnes * listing.asking_price_per_tonne).toLocaleString('en-IN')}`, icon: '🧾' },
              { label: 'Condition', value: listing.condition || 'N/A', icon: '✅' },
              { label: 'Harvest Date', value: listing.harvest_date ? new Date(listing.harvest_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A', icon: '📅' },
              { label: 'Status', value: listing.status || 'Available', icon: '🟢' },
            ].map(({ label, value, icon }) => (
              <div key={label} style={{ background: '#f9fafb', padding: '10px 14px', borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, marginBottom: 2 }}>{icon} {label}</div>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Location */}
          <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '12px 16px', marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#15803d', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
              <MapPin size={13} /> Location Details
            </div>
            <div style={{ fontSize: 14, color: '#374151' }}>
              <div>Village: <strong>{listing.village || 'N/A'}</strong></div>
              <div>District: <strong>{listing.district || 'N/A'}</strong></div>
              <div>State: <strong>{listing.state || 'N/A'}</strong></div>
              {listing.distance_km !== undefined && <div>Distance: <strong>{listing.distance_km.toFixed(1)} km from you</strong></div>}
            </div>
          </div>

          {/* Farmer info */}
          <div style={{ background: '#eff6ff', borderRadius: 8, padding: '12px 16px', marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#1d4ed8', marginBottom: 6 }}>👨‍🌾 Farmer Information</div>
            <div style={{ fontSize: 14, color: '#374151' }}>
              <div>Name: <strong>{listing.farmer_name || 'N/A'}</strong></div>
              <div>Phone: <strong>{hasInterest && listing.farmer_phone ? listing.farmer_phone : '(shown after contacting)'}</strong></div>
            </div>
          </div>

          {/* Action */}
          {hasInterest ? (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '12px 16px', textAlign: 'center' }}>
              <CheckCircle size={20} color="#15803d" style={{ marginBottom: 4 }} />
              <div style={{ color: '#15803d', fontWeight: 600 }}>You've already expressed interest in this listing</div>
              <div style={{ color: '#6b7280', fontSize: 12 }}>Check "My Activity" to track status</div>
            </div>
          ) : (
            <button onClick={() => onContact(listing)} className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
              <MessageCircle size={16} style={{ marginRight: 6 }} /> Contact Seller
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ContactModal({ listing, onClose, onSend, sending }) {
  const [message, setMessage] = useState(
    `Hello, I am interested in purchasing ${listing.quantity_tonnes} tonnes of ${listing.crop || 'residue'} listed at ₹${listing.asking_price_per_tonne}/tonne from ${listing.district}, ${listing.state}. Please let me know if this is still available.`
  );

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: 16 }}>
      <div className="card" style={{ width: '100%', maxWidth: 460, padding: 24, borderRadius: 14, position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, background: '#f3f4f6', border: 'none', borderRadius: '50%', cursor: 'pointer', padding: 6, display: 'flex' }}>
          <X size={18} color="#4b5563" />
        </button>
        <h3 style={{ margin: '0 0 6px', fontSize: 18 }}>Contact Seller</h3>
        <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 16 }}>
          Send a message to <strong>{listing.farmer_name}</strong> about this listing
        </p>
        <div style={{ background: '#f9fafb', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13 }}>
          <div><strong>Crop:</strong> {listing.crop || 'N/A'}</div>
          <div><strong>Quantity:</strong> {listing.quantity_tonnes} tonnes</div>
          <div><strong>Price:</strong> ₹{listing.asking_price_per_tonne}/tonne</div>
          <div><strong>Location:</strong> {listing.district}, {listing.state}</div>
        </div>
        <div className="form-group" style={{ marginBottom: 16 }}>
          <label className="form-label">Your Message</label>
          <textarea
            className="form-input"
            style={{ minHeight: 100, resize: 'vertical' }}
            value={message}
            onChange={e => setMessage(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
          <button
            onClick={() => onSend(listing, message)}
            className="btn btn-primary"
            style={{ flex: 2 }}
            disabled={sending || !message.trim()}
          >
            {sending ? 'Sending...' : '📨 Send & Register Interest'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FindResidue() {
  const { currentUser } = useAuth();

  // Filters
  const [filters, setFilters] = useState({
    crop: '', residue_type: '', condition: '', state: '', district: '',
    min_qty: '', max_qty: '', max_price: '', harvest_after: ''
  });
  const [showFilters, setShowFilters] = useState(true);

  // Results
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  // Saved & interests
  const [savedIds, setSavedIds] = useState(getSaved().map(l => l.id));
  const [myInterestIds, setMyInterestIds] = useState([]);

  // Modal state
  const [detailListing, setDetailListing] = useState(null);
  const [contactListing, setContactListing] = useState(null);
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Load existing interests on mount
  useEffect(() => {
    getMyInterests().then(data => {
      setMyInterestIds((data || []).map(i => i.listing_id));
    }).catch(() => {});
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    setSearched(true);
    try {
      const params = {};
      if (filters.district) params.district = filters.district;
      if (filters.max_price) params.max_price = filters.max_price;
      if (filters.min_qty) params.min_qty = filters.min_qty;
      let results = await getListings(params);

      // Client-side filtering for fields not supported by API
      if (filters.crop) results = results.filter(l => l.crop && l.crop.toLowerCase().includes(filters.crop.toLowerCase()));
      if (filters.residue_type) results = results.filter(l => l.residue_type && l.residue_type.toLowerCase().includes(filters.residue_type.toLowerCase()));
      if (filters.condition) results = results.filter(l => l.condition && l.condition.toLowerCase() === filters.condition.toLowerCase());
      if (filters.state) results = results.filter(l => l.state && l.state.toLowerCase() === filters.state.toLowerCase());
      if (filters.max_qty) results = results.filter(l => l.quantity_tonnes <= parseFloat(filters.max_qty));
      if (filters.harvest_after) results = results.filter(l => l.harvest_date && l.harvest_date >= filters.harvest_after);

      // Add distance if user has location data
      const buyerLat = currentUser?.latitude || 30.9;
      const buyerLon = currentUser?.longitude || 75.85;
      results = results.map(l => ({
        ...l,
        distance_km: getDistance(buyerLat, buyerLon, l.latitude, l.longitude)
      }));

      setListings(results);
    } catch (err) {
      setError(err.message || 'Failed to fetch listings.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = (listing) => {
    const current = getSaved();
    const exists = current.find(l => l.id === listing.id);
    const updated = exists ? current.filter(l => l.id !== listing.id) : [...current, listing];
    setSaved(updated);
    setSavedIds(updated.map(l => l.id));
  };

  const handleContact = (listing) => {
    setContactListing(listing);
    setDetailListing(null);
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
      alert(err.message || 'Failed to send interest. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleReset = () => {
    setFilters({ crop: '', residue_type: '', condition: '', state: '', district: '', min_qty: '', max_qty: '', max_price: '', harvest_after: '' });
    setListings([]);
    setSearched(false);
    setError('');
  };

  const fld = (name, value) => setFilters(prev => ({ ...prev, [name]: value, ...(name === 'state' ? { district: '' } : {}) }));



  return (
    <div style={{ padding: '24px 32px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 28 }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <Search size={24} color="#15803d" /> Find Residue
        </h2>
        <p style={{ color: '#6b7280', margin: 0 }}>Search and filter available crop residue from farmers across Punjab &amp; Haryana</p>
      </div>

      {/* Success Message */}
      {successMsg && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, color: '#15803d' }}>
          <CheckCircle size={18} /> {successMsg}
        </div>
      )}

      {/* ─── Full-width Filter Card ─── */}
      <div className="card" style={{ marginBottom: 28, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', background: '#f0fdf4', borderBottom: '1px solid #d1fae5', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter size={16} color="#15803d" />
          <span style={{ fontWeight: 700, color: '#15803d', fontSize: 14 }}>Search &amp; Filter Options</span>
        </div>

        <div style={{ padding: '24px 28px' }}>
          {/* Row 1: Crop / Residue / Condition */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px 20px', marginBottom: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Crop Type</label>
              <input type="text" list="fr-crop-list" className="form-input" style={{ width: '100%', boxSizing: 'border-box' }}
                value={filters.crop} onChange={e => fld('crop', e.target.value)} placeholder="Type or pick… e.g. Paddy (Rice)" />
              <datalist id="fr-crop-list">{CROPS.filter(Boolean).map(c => <option key={c} value={c} />)}</datalist>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Residue Type</label>
              <input type="text" list="fr-residue-list" className="form-input" style={{ width: '100%', boxSizing: 'border-box' }}
                value={filters.residue_type} onChange={e => fld('residue_type', e.target.value)} placeholder="Type or pick… e.g. Baled Straw" />
              <datalist id="fr-residue-list">{RESIDUE_TYPES.filter(Boolean).map(r => <option key={r} value={r} />)}</datalist>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Condition</label>
              <input type="text" list="fr-condition-list" className="form-input" style={{ width: '100%', boxSizing: 'border-box' }}
                value={filters.condition} onChange={e => fld('condition', e.target.value)} placeholder="Type or pick… e.g. Dry" />
              <datalist id="fr-condition-list">{CONDITIONS.filter(Boolean).map(c => <option key={c} value={c} />)}</datalist>
            </div>
          </div>

          {/* Row 2: State / District / Harvest After */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px 20px', marginBottom: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>State</label>
              <input type="text" list="fr-state-list" className="form-input" style={{ width: '100%', boxSizing: 'border-box' }}
                value={filters.state} onChange={e => fld('state', e.target.value)} placeholder="Type or pick… e.g. Punjab" />
              <datalist id="fr-state-list">{STATES.filter(Boolean).map(s => <option key={s} value={s} />)}</datalist>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>District</label>
              <input type="text" list="fr-district-list" className="form-input" style={{ width: '100%', boxSizing: 'border-box' }}
                value={filters.district} onChange={e => fld('district', e.target.value)} placeholder="Type or pick… e.g. Ludhiana" />
              <datalist id="fr-district-list">
                {(filters.state && DISTRICTS[filters.state] ? DISTRICTS[filters.state] : Object.values(DISTRICTS).flat()).map(d => <option key={d} value={d} />)}
              </datalist>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Harvested After</label>
              <input type="date" className="form-input" style={{ width: '100%', boxSizing: 'border-box' }}
                value={filters.harvest_after} onChange={e => fld('harvest_after', e.target.value)} />
            </div>
          </div>

          {/* Row 3: Min Qty / Max Qty / Max Price */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px 20px', marginBottom: 24 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Min Quantity (tonnes)</label>
              <input type="number" className="form-input" style={{ width: '100%', boxSizing: 'border-box' }}
                value={filters.min_qty} onChange={e => fld('min_qty', e.target.value)} placeholder="e.g. 10" min="0" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Max Quantity (tonnes)</label>
              <input type="number" className="form-input" style={{ width: '100%', boxSizing: 'border-box' }}
                value={filters.max_qty} onChange={e => fld('max_qty', e.target.value)} placeholder="e.g. 500" min="0" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Max Price (₹ / tonne)</label>
              <input type="number" className="form-input" style={{ width: '100%', boxSizing: 'border-box' }}
                value={filters.max_price} onChange={e => fld('max_price', e.target.value)} placeholder="e.g. 3000" min="0" />
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" style={{ padding: '10px 24px', fontSize: 14 }} onClick={handleReset}>
              <X size={15} style={{ marginRight: 6 }} /> Reset Filters
            </button>
            <button className="btn btn-primary" style={{ padding: '10px 32px', fontSize: 14 }} onClick={handleSearch} disabled={loading}>
              {loading ? '🔍 Searching…' : <><Search size={15} style={{ marginRight: 6 }} />Search Listings</>}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Error ─── */}
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', color: '#dc2626', marginBottom: 16 }}>
          ⚠️ {error}
        </div>
      )}

      {/* ─── Results count ─── */}
      {searched && !loading && (
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 600, color: '#374151', fontSize: 15 }}>
            {listings.length === 0 ? 'No listings found' : `${listings.length} listing${listings.length !== 1 ? 's' : ''} found`}
          </div>
          {listings.length > 0 && <div style={{ fontSize: 12, color: '#6b7280' }}>Sorted by newest first</div>}
        </div>
      )}

      {/* ─── Loading ─── */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontSize: 40, marginBottom: 14 }}>🔍</div>
          <div style={{ color: '#6b7280', fontSize: 15 }}>Searching listings...</div>
        </div>
      )}

      {/* ─── No results ─── */}
      {!loading && searched && listings.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '56px 24px' }}>
          <div style={{ fontSize: 52, marginBottom: 14 }}>🌾</div>
          <h3 style={{ color: '#374151', marginBottom: 8 }}>No listings match your criteria</h3>
          <p style={{ color: '#6b7280' }}>Try adjusting your filters or removing some to see more results.</p>
          <button className="btn btn-primary" onClick={handleReset} style={{ marginTop: 16 }}>Clear All Filters</button>
        </div>
      )}

      {/* ─── Initial state ─── */}
      {!loading && !searched && (
        <div className="card" style={{ textAlign: 'center', padding: '56px 24px', background: '#f9fafb' }}>
          <div style={{ fontSize: 52, marginBottom: 14 }}>🌱</div>
          <h3 style={{ color: '#374151', marginBottom: 8 }}>Set your requirements and search</h3>
          <p style={{ color: '#6b7280' }}>Fill in the filters above and click Search to find available residue.</p>
        </div>
      )}

      {/* ─── Listing cards grid ─── */}
      {!loading && listings.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {listings.map(listing => (
            <ListingCard
              key={listing.id}
              listing={listing}
              savedIds={savedIds}
              onToggleSave={handleToggleSave}
              myInterestIds={myInterestIds}
              onContact={handleContact}
              onViewDetails={setDetailListing}
            />
          ))}
        </div>
      )}

      {/* ─── Modals ─── */}
      {detailListing && (
        <DetailModal listing={detailListing} onClose={() => setDetailListing(null)} onContact={handleContact} hasInterest={myInterestIds.includes(detailListing.id)} />
      )}
      {contactListing && (
        <ContactModal listing={contactListing} onClose={() => setContactListing(null)} onSend={handleSendInterest} sending={sending} />
      )}
    </div>
  );
}
