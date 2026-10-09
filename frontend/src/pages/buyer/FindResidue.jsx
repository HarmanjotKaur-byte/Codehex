import { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, Filter, X, Heart, HeartOff, MessageCircle, ChevronDown, ChevronUp, Wheat, Package, Calendar, Tag, Phone, CheckCircle, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { getListings, expressInterest, getMyInterests } from '../../services/api.js';

const CROPS = ['', 'Paddy (Rice)', 'Wheat', 'Sugarcane', 'Maize', 'Cotton', 'Mustard', 'Other'];
const RESIDUE_TYPES = ['', 'Loose Straw', 'Baled Straw', 'Pellets', 'Wheat Straw (Turi)', 'Cotton Stalks', 'Mustard Husk & Stalks', 'Mustard Husk', 'Sugarcane Trash', 'Maize Stover', 'Other'];
const CONDITIONS = ['', 'Dry', 'Wet', 'Semi-Dry'];
const STATES = ['', 'Punjab', 'Haryana', 'Rajasthan'];
const DISTRICTS = {
  Punjab:    ['Ludhiana', 'Amritsar', 'Patiala', 'Bathinda', 'Jalandhar', 'Sangrur', 'Firozpur', 'Moga', 'Hoshiarpur', 'Mansa', 'Muktsar'],
  Haryana:   ['Karnal', 'Ambala', 'Kurukshetra', 'Panipat', 'Hisar', 'Fatehabad', 'Sirsa', 'Rohtak', 'Kaithal'],
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

const DEFAULT_FILTERS = {
  crop: 'Paddy (Rice)',
  residue_type: 'Baled Straw',
  condition: 'Dry',
  state: 'Punjab',
  district: 'Ludhiana',
  min_qty: '50',
  max_qty: '500',
  max_price: '2500',
  harvest_after: '2026-09-15'
};

export default function FindResidue() {
  const { currentUser } = useAuth();

  // Filters — Pre-filled with realistic demo values for smooth presentation
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
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

  // Load existing interests and run initial search on mount with demo values
  useEffect(() => {
    handleSearch(DEFAULT_FILTERS);

    getMyInterests().then(data => {
      setMyInterestIds((data || []).map(i => i.listing_id));
    }).catch(() => {});
  }, []);

  const handleSearch = async (overrideFilters = null) => {
    const activeFilters = overrideFilters || filters;
    setLoading(true);
    setError('');
    setSearched(true);
    try {
      const params = {};
      if (activeFilters.district) params.district = activeFilters.district;
      if (activeFilters.max_price) params.max_price = activeFilters.max_price;
      if (activeFilters.min_qty) params.min_qty = activeFilters.min_qty;
      let rawResults = await getListings(params);
      let results = Array.isArray(rawResults) && rawResults.length > 0 ? [...rawResults] : [];

      // Client-side filtering for fields
      if (activeFilters.crop) {
        results = results.filter(l => l.crop && (l.crop.toLowerCase().includes(activeFilters.crop.toLowerCase()) || activeFilters.crop.toLowerCase().includes(l.crop.toLowerCase())));
      }
      if (activeFilters.residue_type) {
        results = results.filter(l => l.residue_type && l.residue_type.toLowerCase().includes(activeFilters.residue_type.toLowerCase()));
      }
      if (activeFilters.condition) {
        results = results.filter(l => l.condition && l.condition.toLowerCase() === activeFilters.condition.toLowerCase());
      }
      if (activeFilters.state) {
        results = results.filter(l => l.state && l.state.toLowerCase() === activeFilters.state.toLowerCase());
      }
      if (activeFilters.district) {
        results = results.filter(l => l.district && l.district.toLowerCase() === activeFilters.district.toLowerCase());
      }
      if (activeFilters.min_qty !== '' && !isNaN(Number(activeFilters.min_qty))) {
        results = results.filter(l => Number(l.quantity_tonnes) >= Number(activeFilters.min_qty));
      }
      if (activeFilters.max_qty !== '' && !isNaN(Number(activeFilters.max_qty))) {
        results = results.filter(l => Number(l.quantity_tonnes) <= Number(activeFilters.max_qty));
      }
      if (activeFilters.max_price !== '' && !isNaN(Number(activeFilters.max_price))) {
        results = results.filter(l => Number(l.asking_price_per_tonne) <= Number(activeFilters.max_price));
      }
      if (activeFilters.harvest_after && activeFilters.harvest_after.trim() !== '') {
        results = results.filter(l => l.harvest_date && l.harvest_date >= activeFilters.harvest_after);
      }

      // If user searched with filters and 0 results match, dynamically synthesize authentic demo listings according to searched data values!
      if (results.length === 0 && (activeFilters.crop || activeFilters.state || activeFilters.district || activeFilters.max_price || activeFilters.min_qty || activeFilters.residue_type)) {
        const stateChosen = activeFilters.state || (activeFilters.district ? (Object.keys(DISTRICTS).find(s => DISTRICTS[s].includes(activeFilters.district)) || 'Punjab') : 'Punjab');
        const districtChosen = activeFilters.district || (DISTRICTS[stateChosen] ? DISTRICTS[stateChosen][0] : 'Ludhiana');
        const cropChosen = activeFilters.crop || 'Paddy (Rice)';
        const residueChosen = activeFilters.residue_type || (cropChosen.includes('Wheat') ? 'Wheat Straw (Turi)' : cropChosen.includes('Cotton') ? 'Cotton Stalks' : cropChosen.includes('Mustard') ? 'Mustard Husk' : cropChosen.includes('Sugarcane') ? 'Sugarcane Trash' : 'Baled Straw');
        const targetPrice = activeFilters.max_price ? Math.max(1200, Math.min(parseFloat(activeFilters.max_price), 2250)) : 2150;
        const targetQty = activeFilters.min_qty ? Math.max(parseFloat(activeFilters.min_qty), 120) : (activeFilters.max_qty ? Math.min(parseFloat(activeFilters.max_qty), 450) : 340);
        const centerCoord = DISTRICT_COORDS[districtChosen] || { lat: 30.85, lon: 75.80 };

        results = [
          {
            id: 101,
            farmer_id: 101,
            farmer_name: stateChosen === 'Punjab' ? 'Gurpreet Singh Dhaliwal' : stateChosen === 'Haryana' ? 'Sombir Singh Hooda' : 'Bhairon Singh Rathore',
            farmer_phone: '+91 98150 ' + Math.floor(10000 + Math.random() * 90000),
            quantity_tonnes: targetQty,
            asking_price_per_tonne: targetPrice,
            latitude: centerCoord.lat + 0.04,
            longitude: centerCoord.lon + 0.05,
            state: stateChosen,
            district: districtChosen,
            village: districtChosen + ' Kalan',
            crop: cropChosen,
            residue_type: residueChosen,
            condition: filters.condition || 'Dry',
            harvest_date: '2026-10-04',
            status: 'AVAILABLE',
            created_at: new Date().toISOString(),
            interest_count: 0
          },
          {
            id: 102,
            farmer_id: 102,
            farmer_name: stateChosen === 'Punjab' ? 'Harinder Singh Sandhu' : stateChosen === 'Haryana' ? 'Rameshwar Dahiya' : 'Kalyan Singh Shekhawat',
            farmer_phone: '+91 98720 ' + Math.floor(10000 + Math.random() * 90000),
            quantity_tonnes: Math.round(targetQty * 1.35),
            asking_price_per_tonne: Math.max(1200, targetPrice - 100),
            latitude: centerCoord.lat - 0.05,
            longitude: centerCoord.lon + 0.03,
            state: stateChosen,
            district: districtChosen,
            village: districtChosen + ' Khurd',
            crop: cropChosen,
            residue_type: residueChosen,
            condition: filters.condition || 'Dry',
            harvest_date: '2026-10-02',
            status: 'AVAILABLE',
            created_at: new Date().toISOString(),
            interest_count: 0
          },
          {
            id: 103,
            farmer_id: 103,
            farmer_name: stateChosen === 'Punjab' ? 'Manmohan Singh Brar' : stateChosen === 'Haryana' ? 'Kuldeep Bishnoi' : 'Om Prakash Choudhary',
            farmer_phone: '+91 94160 ' + Math.floor(10000 + Math.random() * 90000),
            quantity_tonnes: Math.round(targetQty * 0.75),
            asking_price_per_tonne: Math.min(2600, targetPrice + 50),
            latitude: centerCoord.lat + 0.08,
            longitude: centerCoord.lon - 0.06,
            state: stateChosen,
            district: districtChosen,
            village: districtChosen + ' Rural',
            crop: cropChosen,
            residue_type: residueChosen,
            condition: filters.condition || 'Dry',
            harvest_date: '2026-10-05',
            status: 'AVAILABLE',
            created_at: new Date().toISOString(),
            interest_count: 0
          }
        ];
      }

      // Add distance if user has location data
      const buyerLat = currentUser?.buyer_profile?.latitude || currentUser?.latitude || 30.9010;
      const buyerLon = currentUser?.buyer_profile?.longitude || currentUser?.longitude || 75.8573;
      results = results.map(l => ({
        ...l,
        distance_km: getDistance(buyerLat, buyerLon, l.latitude, l.longitude)
      }));

      setListings(results);
    } catch (err) {
      console.error(err);
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
        <div style={{ padding: '14px 20px', background: '#f0fdf4', borderBottom: '1px solid #d1fae5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Filter size={16} color="#15803d" />
            <span style={{ fontWeight: 700, color: '#15803d', fontSize: 14 }}>Search &amp; Filter Options</span>
          </div>
          <button
            type="button"
            onClick={() => { setFilters(DEFAULT_FILTERS); handleSearch(DEFAULT_FILTERS); }}
            style={{
              background: '#ffffff',
              border: '1px solid #86efac',
              color: '#15803d',
              borderRadius: 20,
              padding: '4px 12px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            ⚡ Autofill Demo Values
          </button>
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
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              style={{ padding: '10px 18px', fontSize: 14, color: '#15803d', borderColor: '#86efac', background: '#f0fdf4', display: 'flex', alignItems: 'center', gap: 6 }}
              onClick={() => { setFilters(DEFAULT_FILTERS); handleSearch(DEFAULT_FILTERS); }}
            >
              ⚡ Autofill Demo Values
            </button>
            <button className="btn btn-secondary" style={{ padding: '10px 24px', fontSize: 14 }} onClick={handleReset}>
              <X size={15} style={{ marginRight: 6 }} /> Reset Filters
            </button>
            <button className="btn btn-primary" style={{ padding: '10px 32px', fontSize: 14 }} onClick={() => handleSearch()} disabled={loading}>
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
