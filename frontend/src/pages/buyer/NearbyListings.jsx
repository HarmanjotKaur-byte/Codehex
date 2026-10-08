import { useState, useEffect } from 'react';
import { Search, Filter, X, CheckCircle, MapPin, Calendar, MessageCircle, Star, Wheat, Navigation } from 'lucide-react';
import { getListings, expressInterest, getMyInterests } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

const CROPS = ['', 'Paddy (Rice)', 'Wheat', 'Sugarcane', 'Maize', 'Cotton', 'Mustard', 'Other'];
const RESIDUE_TYPES = ['', 'Baled Straw', 'Loose Straw', 'Pellets', 'Cotton Stalks', 'Mustard Husk & Stalks', 'Mustard Husk', 'Sugarcane Trash', 'Sugarcane Bagasse & Trash', 'Wheat Straw (Turi)', 'Wheat Straw', 'Maize Stover', 'Other'];
const CONDITIONS = ['', 'Dry', 'Wet', 'Semi-Dry'];
const STATES = ['', 'Punjab', 'Haryana', 'Rajasthan'];
const DISTRICTS = {
  Punjab: ['Ludhiana', 'Amritsar', 'Patiala', 'Bathinda', 'Jalandhar', 'Sangrur', 'Firozpur', 'Moga', 'Hoshiarpur', 'Mansa', 'Muktsar'],
  Haryana: ['Karnal', 'Ambala', 'Kurukshetra', 'Panipat', 'Hisar', 'Fatehabad', 'Sirsa', 'Rohtak', 'Kaithal'],
  Rajasthan: ['Sri Ganganagar', 'Hanumangarh', 'Alwar', 'Kota', 'Bikaner', 'Bharatpur', 'Jaipur'],
};

const DISTRICT_COORDS = {
  'Ludhiana': { lat: 30.9010, lon: 75.8573 },
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
  'Panipat': { lat: 29.3909, lon: 76.9635 },
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

function getSaved() {
  try { return JSON.parse(localStorage.getItem('paralipay_saved_listings') || '[]'); } catch { return []; }
}
function setSaved(arr) {
  localStorage.setItem('paralipay_saved_listings', JSON.stringify(arr));
}

function ListingCard({ listing, isSaved, onToggleSave, hasInterest, onContact, onViewDetails }) {
  const statusColor = listing.condition === 'Dry' ? '#16a34a' : listing.condition === 'Wet' ? '#2563eb' : '#d97706';

  return (
    <div className="card" style={{ marginBottom: 16, border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', transition: 'box-shadow 0.2s', background: '#fff' }}
      onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.10)'}
      onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
    >
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
          {listing.distance_km !== null && listing.distance_km !== undefined && (
            <div style={{ marginLeft: 'auto', fontSize: 12, color: '#15803d', background: '#f0fdf4', padding: '3px 8px', borderRadius: 12, border: '1px solid #bbf7d0', fontWeight: 600 }}>
              📍 {listing.distance_km.toFixed(1)} km away
            </div>
          )}
        </div>

        <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '8px 12px', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#15803d', fontWeight: 500 }}>Estimated Total Value</span>
          <span style={{ fontWeight: 700, fontSize: 15, color: '#15803d' }}>₹{(listing.quantity_tonnes * listing.asking_price_per_tonne).toLocaleString('en-IN')}</span>
        </div>

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
    <div 
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100000, padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="card" style={{ width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', padding: 0, borderRadius: 14, position: 'relative' }}>
        <div style={{ background: 'linear-gradient(135deg, #15803d, #16a34a)', color: 'white', padding: '20px 24px', borderRadius: '14px 14px 0 0', position: 'relative' }}>
          <button 
            type="button"
            onClick={e => { e.stopPropagation(); onClose(); }} 
            style={{ 
              position: 'absolute', 
              top: 14, 
              right: 14, 
              background: 'white', 
              color: '#1f2937',
              border: 'none', 
              borderRadius: '50%', 
              cursor: 'pointer', 
              padding: 6, 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
              zIndex: 10
            }}
            title="Close"
          >
            <X size={18} color="#1f2937" />
          </button>
          <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 4 }}>Listing #{listing.id}</div>
          <div style={{ fontSize: 20, fontWeight: 700, paddingRight: 40 }}>{listing.crop || 'Agricultural Residue'}</div>
          <div style={{ fontSize: 13, opacity: 0.85 }}>{listing.residue_type || ''}</div>
        </div>

        <div style={{ padding: '20px 24px' }}>
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

          <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '12px 16px', marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#15803d', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
              <MapPin size={13} /> Location Details
            </div>
            <div style={{ fontSize: 14, color: '#374151' }}>
              <div>Village: <strong>{listing.village || 'N/A'}</strong></div>
              <div>District: <strong>{listing.district || 'N/A'}</strong></div>
              <div>State: <strong>{listing.state || 'N/A'}</strong></div>
              {listing.distance_km !== null && listing.distance_km !== undefined && (
                <div>Distance: <strong>{listing.distance_km.toFixed(1)} km from your chosen location</strong></div>
              )}
            </div>
          </div>

          <div style={{ background: '#eff6ff', borderRadius: 8, padding: '12px 16px', marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#1d4ed8', marginBottom: 6 }}>👨‍🌾 Farmer Information</div>
            <div style={{ fontSize: 14, color: '#374151' }}>
              <div>Name: <strong>{listing.farmer_name || 'N/A'}</strong></div>
              <div>Phone: <strong>{hasInterest && listing.farmer_phone ? listing.farmer_phone : '(shown after contacting)'}</strong></div>
            </div>
          </div>

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
    <div 
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100000, padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="card" style={{ width: '100%', maxWidth: 460, padding: 24, borderRadius: 14, position: 'relative' }}>
        <button 
          type="button"
          onClick={e => { e.stopPropagation(); onClose(); }} 
          style={{ 
            position: 'absolute', 
            top: 14, 
            right: 14, 
            background: '#f3f4f6', 
            border: 'none', 
            borderRadius: '50%', 
            cursor: 'pointer', 
            padding: 6, 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10
          }}
          title="Close"
        >
          <X size={18} color="#1f2937" />
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

function haversineDistance(lat1, lon1, lat2, lon2) {
  const toRad = deg => (deg * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // km
}

export default function NearbyListings() {
  const { currentUser } = useAuth();
  const [filters, setFilters] = useState({
    crop: '',
    residue_type: '',
    condition: '',
    state: '',
    district: '',
    min_qty: '',
    max_qty: '',
    max_price: '',
    max_distance: '100',
    harvest_after: '',
    logistics: 'Any'
  });

  const [coords, setCoords] = useState({ lat: null, lon: null });
  const [locationName, setLocationName] = useState('');
  const [detectingLoc, setDetectingLoc] = useState(false);
  const [locStatus, setLocStatus] = useState('');

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const [savedIds, setSavedIds] = useState(() => getSaved().map(l => l.id));
  const [myInterestIds, setMyInterestIds] = useState([]);

  const [detailListing, setDetailListing] = useState(null);
  const [contactListing, setContactListing] = useState(null);
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    getMyInterests().then(data => {
      setMyInterestIds((data || []).map(i => i.listing_id));
    }).catch(() => {});

    if (currentUser?.district && DISTRICT_COORDS[currentUser.district]) {
      const c = DISTRICT_COORDS[currentUser.district];
      setCoords(c);
    } else {
      setCoords(DISTRICT_COORDS['Ludhiana']);
    }
  }, [currentUser]);

  const fld = (name, value) => {
    setFilters(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'district' && DISTRICT_COORDS[value]) {
        setCoords(DISTRICT_COORDS[value]);
      }
      return updated;
    });
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setDetectingLoc(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lon: longitude });
        setDetectingLoc(false);
      },
      err => {
        setDetectingLoc(false);
        alert('Location permission denied or unavailable. Please pick your District manually below.');
      },
      { timeout: 10000 }
    );
  };

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    setSearched(true);
    try {
      // Fetch all available listings from API
      const data = await getListings({});

      const activeLat = coords.lat;
      const activeLon = coords.lon;

      const processed = data
        .map(item => {
          let dist = null;
          if (activeLat != null && activeLon != null && item.latitude != null && item.longitude != null) {
            dist = haversineDistance(activeLat, activeLon, item.latitude, item.longitude);
          } else if (item.district && DISTRICT_COORDS[item.district] && activeLat != null && activeLon != null) {
            const dc = DISTRICT_COORDS[item.district];
            dist = haversineDistance(activeLat, activeLon, dc.lat, dc.lon);
          }
          return { ...item, distance_km: dist };
        })
        .filter(item => {
          // State filter
          if (filters.state && item.state && item.state.toLowerCase() !== filters.state.toLowerCase()) {
            return false;
          }
          // District filter
          if (filters.district && item.district && item.district.toLowerCase() !== filters.district.toLowerCase()) {
            return false;
          }
          // Crop filter
          if (filters.crop && item.crop && !item.crop.toLowerCase().includes(filters.crop.toLowerCase())) {
            return false;
          }
          // Residue type filter
          if (filters.residue_type && item.residue_type && !item.residue_type.toLowerCase().includes(filters.residue_type.toLowerCase())) {
            return false;
          }
          // Condition filter
          if (filters.condition && item.condition && item.condition.toLowerCase() !== filters.condition.toLowerCase()) {
            return false;
          }
          // Min quantity (t)
          if (filters.min_qty !== '' && !isNaN(Number(filters.min_qty))) {
            if (Number(item.quantity_tonnes) < Number(filters.min_qty)) return false;
          }
          // Max quantity (t)
          if (filters.max_qty !== '' && !isNaN(Number(filters.max_qty))) {
            if (Number(item.quantity_tonnes) > Number(filters.max_qty)) return false;
          }
          // Max price (₹ / tonne)
          if (filters.max_price !== '' && !isNaN(Number(filters.max_price))) {
            if (Number(item.asking_price_per_tonne) > Number(filters.max_price)) return false;
          }
          // Harvested after date filter
          if (filters.harvest_after && item.harvest_date) {
            if (new Date(item.harvest_date) < new Date(filters.harvest_after)) return false;
          }
          // Max distance radius
          if (filters.max_distance && item.distance_km !== null) {
            if (item.distance_km > Number(filters.max_distance)) return false;
          }
          return true;
        });

      processed.sort((a, b) => {
        if (a.distance_km != null && b.distance_km != null) return a.distance_km - b.distance_km;
        if (a.distance_km != null) return -1;
        if (b.distance_km != null) return 1;
        return b.id - a.id;
      });

      setListings(processed);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load nearby listings');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFilters({
      crop: '',
      residue_type: '',
      condition: '',
      state: '',
      district: '',
      min_qty: '',
      max_qty: '',
      max_price: '',
      max_distance: '100',
      harvest_after: '',
      logistics: 'Any'
    });
    setCoords(DISTRICT_COORDS['Ludhiana']);
    setLocationName('Ludhiana, Punjab');
    setLocStatus('Reset to default');
    handleSearch();
  };

  const handleToggleSave = listing => {
    const current = getSaved();
    const exists = current.find(l => l.id === listing.id);
    let updated;
    if (exists) {
      updated = current.filter(l => l.id !== listing.id);
    } else {
      updated = [...current, listing];
    }
    setSaved(updated);
    setSavedIds(updated.map(l => l.id));
  };

  const handleContact = listing => {
    setContactListing(listing);
  };

  const handleSendInterest = async (listing, message) => {
    setSending(true);
    try {
      await expressInterest({ listing_id: listing.id, message });
      setMyInterestIds(prev => [...prev, listing.id]);
      setContactListing(null);
      setSuccessMsg(`Interest registered for listing #${listing.id}! You can track this in 'My Activity'.`);
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      alert(err.message || 'Failed to send interest');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1400, margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '0 0 6px 0', fontSize: 24, color: '#111827' }}>
          <MapPin size={26} color="#15803d" /> Nearby Listings
        </h2>
        <p style={{ color: '#6b7280', margin: 0, fontSize: 14 }}>
          Discover available stubble & biomass listings closest to your location, ranked by distance.
        </p>
      </div>

      {successMsg && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, color: '#15803d', fontWeight: 500 }}>
          <CheckCircle size={18} /> {successMsg}
        </div>
      )}

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', color: '#dc2626', marginBottom: 20 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Main Split Layout: Left side form fillup, Right side available farmers */}
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 28, alignItems: 'start' }}>
        
        {/* LEFT COLUMN: Location & Preference Controls */}
        <div className="card" style={{ padding: 0, borderRadius: 14, overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', background: '#fff' }}>
          <div style={{ background: 'linear-gradient(135deg, #15803d, #16a34a)', padding: '16px 20px', color: '#fff' }}>
            <h3 style={{ margin: 0, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8, color: '#fff' }}>
              <Navigation size={18} /> Location & Search Filters
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: 12, opacity: 0.9 }}>
              Customize radius & residue criteria
            </p>
          </div>

          <div style={{ padding: '20px' }}>
            {/* Location Box */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 14, marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <MapPin size={14} color="#15803d" /> Buyer Location
              </div>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleUseCurrentLocation}
                disabled={detectingLoc}
                style={{ width: '100%', padding: '9px 14px', fontSize: 13, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6 }}
              >
                <Navigation size={15} />
                {detectingLoc ? 'Detecting Location...' : 'Use My Current Location'}
              </button>
            </div>

            {/* Manual Location Override */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>State</label>
              <select
                className="form-input"
                style={{ width: '100%' }}
                value={filters.state}
                onChange={e => fld('state', e.target.value)}
              >
                <option value="">All States</option>
                {STATES.filter(Boolean).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>District</label>
              <select
                className="form-input"
                style={{ width: '100%' }}
                value={filters.district}
                onChange={e => fld('district', e.target.value)}
              >
                <option value="">Select / Change District</option>
                {(filters.state && DISTRICTS[filters.state] ? DISTRICTS[filters.state] : Object.values(DISTRICTS).flat()).map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Max Distance Slider */}
            <div style={{ marginBottom: 20, background: '#f0fdf4', padding: '12px 14px', borderRadius: 8, border: '1px solid #dcfce7' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#15803d' }}>Maximum Distance</label>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#166534' }}>{filters.max_distance} km</span>
              </div>
              <input
                type="range"
                min="5"
                max="300"
                step="5"
                value={filters.max_distance}
                onChange={e => fld('max_distance', e.target.value)}
                style={{ width: '100%', accentColor: '#15803d', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#6b7280', marginTop: 4 }}>
                <span>5 km</span>
                <span>150 km</span>
                <span>300 km</span>
              </div>
            </div>

            {/* Residue Preferences */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Crop Type</label>
              <select className="form-input" style={{ width: '100%' }} value={filters.crop} onChange={e => fld('crop', e.target.value)}>
                <option value="">All Crops</option>
                {CROPS.filter(Boolean).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Residue Type</label>
              <select className="form-input" style={{ width: '100%' }} value={filters.residue_type} onChange={e => fld('residue_type', e.target.value)}>
                <option value="">All Residue Types</option>
                {RESIDUE_TYPES.filter(Boolean).map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Condition</label>
              <select className="form-input" style={{ width: '100%' }} value={filters.condition} onChange={e => fld('condition', e.target.value)}>
                <option value="">Any Condition</option>
                {CONDITIONS.filter(Boolean).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Qty Range */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Min Qty (t)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Min"
                  value={filters.min_qty}
                  onChange={e => fld('min_qty', e.target.value)}
                  min="0"
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Max Qty (t)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Max"
                  value={filters.max_qty}
                  onChange={e => fld('max_qty', e.target.value)}
                  min="0"
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            {/* Max Price */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Max Price (₹ / tonne)</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 3500"
                value={filters.max_price}
                onChange={e => fld('max_price', e.target.value)}
                min="0"
                style={{ width: '100%' }}
              />
            </div>

            {/* Harvest Date */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Harvested After</label>
              <input
                type="date"
                className="form-input"
                value={filters.harvest_after}
                onChange={e => fld('harvest_after', e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleReset}
                style={{ flex: 1, padding: '10px 14px', fontSize: 13 }}
              >
                Reset
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSearch}
                disabled={loading}
                style={{ flex: 2, padding: '10px 16px', fontSize: 13, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6 }}
              >
                <Search size={15} />
                {loading ? 'Searching Farmers...' : 'Search Farmers'}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Available Farmers / Listings */}
        <div>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 20px', marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontWeight: 700, color: '#111827', fontSize: 16 }}>Available Farmer Listings</span>
              {searched && (
                <span style={{ marginLeft: 10, background: '#f0fdf4', color: '#15803d', fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 14, border: '1px solid #bbf7d0' }}>
                  {listings.length} found
                </span>
              )}
            </div>
            <div style={{ fontSize: 13, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>Sorted by:</span>
              <strong style={{ color: '#15803d' }}>Nearest Distance First</strong>
            </div>
          </div>

          {loading && (
            <div style={{ textAlign: 'center', padding: '60px 0', background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🧭</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#374151' }}>Calculating distances and finding nearest farmers...</div>
              <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>Checking available stubble inventory</div>
            </div>
          )}

          {!searched && !loading && (
            <div className="card" style={{ textAlign: 'center', padding: '60px 24px', background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: 52, marginBottom: 14 }}>📍</div>
              <h3 style={{ color: '#1f2937', marginBottom: 8, fontSize: 18 }}>Ready to Find Nearby Residue</h3>
              <p style={{ color: '#6b7280', fontSize: 14, maxWidth: 460, margin: '0 auto' }}>
                Fill in your requirements (location, crop, quantity, and price) on the left panel, then click <strong>"Search Farmers"</strong> below the form to view available matches.
              </p>
            </div>
          )}

          {searched && !loading && listings.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '56px 24px', background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: 48, marginBottom: 14 }}>🌾</div>
              <h3 style={{ color: '#374151', marginBottom: 8, fontSize: 18 }}>No listings found within the specified range</h3>
              <p style={{ color: '#6b7280', fontSize: 14, maxWidth: 440, margin: '0 auto 16px auto' }}>
                Try increasing the maximum distance radius or removing some of the crop filters on the left panel.
              </p>
              <button className="btn btn-primary" onClick={() => { fld('max_distance', '250'); }}>
                Expand Radius to 250 km
              </button>
            </div>
          )}

          {searched && !loading && listings.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 18 }}>
              {listings.map(listing => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  isSaved={savedIds.includes(listing.id)}
                  onToggleSave={handleToggleSave}
                  hasInterest={myInterestIds.includes(listing.id)}
                  onContact={handleContact}
                  onViewDetails={setDetailListing}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {detailListing && (
        <DetailModal
          listing={detailListing}
          onClose={() => setDetailListing(null)}
          onContact={handleContact}
          hasInterest={myInterestIds.includes(detailListing.id)}
        />
      )}

      {contactListing && (
        <ContactModal
          listing={contactListing}
          onClose={() => setContactListing(null)}
          onSend={handleSendInterest}
          sending={sending}
        />
      )}
    </div>
  );
}
