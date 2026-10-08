import { useState, useEffect } from 'react';
import { ShoppingBag, Wheat, MapPin, Calendar, Star, MessageCircle, CheckCircle, X, ChevronRight, RefreshCw, Eye } from 'lucide-react';
import { getListings, expressInterest, getMyInterests } from '../../services/api.js';

function getSaved() {
  try { return JSON.parse(localStorage.getItem('paralipay_saved_listings') || '[]'); } catch { return []; }
}
function setSaved(arr) {
  localStorage.setItem('paralipay_saved_listings', JSON.stringify(arr));
}

function ListingCard({ listing, isSaved, onToggleSave, hasInterest, onContact, onViewDetails }) {
  const statusColor = listing.condition === 'Dry' ? '#16a34a' : listing.condition === 'Wet' ? '#2563eb' : '#d97706';

  return (
    <div 
      className="card" 
      style={{ 
        border: '1px solid #e5e7eb', 
        borderRadius: 14, 
        overflow: 'hidden', 
        transition: 'all 0.2s ease', 
        background: '#fff',
        display: 'flex',
        flexDirection: 'column'
      }}
      onMouseOver={e => e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)'}
      onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
    >
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', padding: '16px 20px', borderBottom: '1px solid #d1fae5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ background: '#16a34a', color: 'white', padding: '8px', borderRadius: '50%', display: 'flex' }}>
            <Wheat size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#15803d' }}>{listing.crop || 'Agricultural Residue'}</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>{listing.residue_type || 'Crop Residue'}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {listing.condition && (
            <span style={{ background: statusColor + '20', color: statusColor, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
              {listing.condition}
            </span>
          )}
          <button
            type="button"
            onClick={() => onToggleSave(listing)}
            style={{ 
              background: isSaved ? '#fef9c3' : '#ffffff', 
              border: '1px solid ' + (isSaved ? '#fde047' : '#e5e7eb'), 
              borderRadius: '50%', 
              padding: 7, 
              cursor: 'pointer', 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}
            title={isSaved ? 'Saved! Click to remove' : 'Save listing to "Saved Listings"'}
          >
            {isSaved ? <Star size={16} color="#ca8a04" fill="#ca8a04" /> : <Star size={16} color="#9ca3af" />}
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 18px', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600, marginBottom: 2 }}>Available Quantity</div>
            <div style={{ fontWeight: 700, fontSize: 17, color: '#111827' }}>
              {listing.quantity_tonnes} <span style={{ fontWeight: 400, fontSize: 13, color: '#6b7280' }}>tonnes</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600, marginBottom: 2 }}>Asking Price</div>
            <div style={{ fontWeight: 700, fontSize: 17, color: '#15803d' }}>
              ₹{listing.asking_price_per_tonne?.toLocaleString('en-IN')}{' '}
              <span style={{ fontSize: 12, fontWeight: 400, color: '#6b7280' }}>/ tonne</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600, marginBottom: 2 }}>Location</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#374151', fontWeight: 500 }}>
              <MapPin size={14} color="#6b7280" style={{ flexShrink: 0 }} />
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {[listing.village, listing.district, listing.state].filter(Boolean).join(', ') || 'Punjab / Haryana'}
              </span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600, marginBottom: 2 }}>Harvest Date</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#374151' }}>
              <Calendar size={14} color="#6b7280" style={{ flexShrink: 0 }} />
              <span>{listing.harvest_date ? new Date(listing.harvest_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Ready Now'}</span>
            </div>
          </div>
        </div>

        {/* Farmer tag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#f8fafc', borderRadius: 10, marginBottom: 14 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#1d4ed8' }}>{(listing.farmer_name || 'F')[0].toUpperCase()}</span>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{listing.farmer_name || 'Farmer'}</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>Active Farmer · Listing #{listing.id}</div>
          </div>
          <div style={{ marginLeft: 'auto', background: '#f0fdf4', color: '#15803d', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 12, border: '1px solid #bbf7d0' }}>
            ● ACTIVE
          </div>
        </div>

        {/* Estimated value */}
        <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '10px 14px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#15803d', fontWeight: 500 }}>Estimated Total Deal Value</span>
          <span style={{ fontWeight: 800, fontSize: 15, color: '#15803d' }}>
            ₹{(listing.quantity_tonnes * listing.asking_price_per_tonne).toLocaleString('en-IN')}
          </span>
        </div>

        {/* Actions: 1. View Details, 2. Save Listing, 3. Contact Seller */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.3fr', gap: 8, marginTop: 'auto' }}>
          {/* 1. View */}
          <button
            type="button"
            onClick={() => onViewDetails(listing)}
            className="btn btn-secondary"
            style={{ fontSize: 13, padding: '9px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
            title="View full listing details"
          >
            <Eye size={14} /> View
          </button>

          {/* 2. Save */}
          <button
            type="button"
            onClick={() => onToggleSave(listing)}
            className="btn btn-secondary"
            style={{ 
              fontSize: 13, 
              padding: '9px 10px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: 5,
              background: isSaved ? '#fef9c3' : '#ffffff',
              borderColor: isSaved ? '#facc15' : '#e5e7eb',
              color: isSaved ? '#854d0e' : '#374151',
              fontWeight: isSaved ? 700 : 500
            }}
            title={isSaved ? 'Saved in "Saved Listings" (Click to remove)' : 'Save to "Saved Listings"'}
          >
            <Star size={14} color={isSaved ? '#ca8a04' : '#6b7280'} fill={isSaved ? '#ca8a04' : 'none'} />
            {isSaved ? 'Saved' : 'Save'}
          </button>

          {/* 3. Contact Seller */}
          {hasInterest ? (
            <button 
              type="button"
              className="btn" 
              style={{ fontSize: 13, padding: '9px 10px', background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: 8, cursor: 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontWeight: 600 }} 
              disabled
              title="Message sent! Tracked under My Activity"
            >
              <CheckCircle size={14} /> Contacted
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onContact(listing)}
              className="btn btn-primary"
              style={{ fontSize: 13, padding: '9px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
              title="Send message to farmer (shows in My Activity)"
            >
              <MessageCircle size={14} /> Contact Seller
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
      <div className="card" style={{ width: '100%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto', padding: 0, borderRadius: 14, position: 'relative' }}>
        <div style={{ background: 'linear-gradient(135deg, #15803d, #16a34a)', color: 'white', padding: '22px 24px', borderRadius: '14px 14px 0 0', position: 'relative' }}>
          <button 
            type="button"
            onClick={e => { e.stopPropagation(); onClose(); }} 
            style={{ 
              position: 'absolute', 
              top: 14, 
              right: 14, 
              background: 'white', 
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
          <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 4 }}>Active Marketplace Listing #{listing.id}</div>
          <div style={{ fontSize: 22, fontWeight: 700, paddingRight: 40 }}>{listing.crop || 'Agricultural Residue'}</div>
          <div style={{ fontSize: 13, opacity: 0.9 }}>{listing.residue_type || 'Crop Stubble'}</div>
        </div>

        <div style={{ padding: '22px 24px' }}>
          {/* Key specs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Available Quantity', value: `${listing.quantity_tonnes} tonnes`, icon: '⚖️' },
              { label: 'Price per Tonne', value: `₹${listing.asking_price_per_tonne?.toLocaleString('en-IN')}`, icon: '💰' },
              { label: 'Total Value', value: `₹${(listing.quantity_tonnes * listing.asking_price_per_tonne).toLocaleString('en-IN')}`, icon: '🧾' },
              { label: 'Condition', value: listing.condition || 'Good / Standard', icon: '✅' },
              { label: 'Harvest Date', value: listing.harvest_date ? new Date(listing.harvest_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Ready for pickup', icon: '📅' },
              { label: 'Listing Status', value: listing.status || 'AVAILABLE', icon: '🟢' },
            ].map(({ label, value, icon }) => (
              <div key={label} style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: 10, border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 3 }}>{icon} {label}</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Location info */}
          <div style={{ background: '#f0fdf4', borderRadius: 10, padding: '14px 18px', marginBottom: 16, border: '1px solid #dcfce7' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#15803d', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
              <MapPin size={14} /> Location Information
            </div>
            <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.6 }}>
              <div>Village: <strong>{listing.village || 'N/A'}</strong></div>
              <div>District: <strong>{listing.district || 'N/A'}</strong></div>
              <div>State: <strong>{listing.state || 'N/A'}</strong></div>
            </div>
          </div>

          {/* Farmer Contact info */}
          <div style={{ background: '#eff6ff', borderRadius: 10, padding: '14px 18px', marginBottom: 22, border: '1px solid #dbeafe' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#1d4ed8', marginBottom: 6 }}>👨‍🌾 Farmer / Seller Details</div>
            <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.6 }}>
              <div>Farmer Name: <strong>{listing.farmer_name || 'Registered Farmer'}</strong></div>
              <div>Phone Number: <strong>{hasInterest && listing.farmer_phone ? listing.farmer_phone : '(Available after contacting seller)'}</strong></div>
            </div>
          </div>

          {/* Action button */}
          {hasInterest ? (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
              <CheckCircle size={22} color="#15803d" style={{ marginBottom: 4 }} />
              <div style={{ color: '#15803d', fontWeight: 700 }}>You have already contacted this farmer</div>
              <div style={{ color: '#6b7280', fontSize: 12 }}>You can track this offer in the "My Activity" section.</div>
            </div>
          ) : (
            <button 
              type="button"
              onClick={() => onContact(listing)} 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '13px', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <MessageCircle size={18} /> Contact Farmer & Register Interest
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ContactModal({ listing, onClose, onSend, sending }) {
  const [message, setMessage] = useState(
    `Hello, I am interested in purchasing ${listing.quantity_tonnes} tonnes of ${listing.crop || 'residue'} listed at ₹${listing.asking_price_per_tonne}/tonne from ${listing.district || 'your location'}, ${listing.state || ''}. Please let me know how to proceed.`
  );

  return (
    <div 
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100000, padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="card" style={{ width: '100%', maxWidth: 480, padding: 24, borderRadius: 14, position: 'relative' }}>
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
        <h3 style={{ margin: '0 0 6px', fontSize: 18, color: '#111827' }}>Contact Farmer</h3>
        <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 16 }}>
          Send an inquiry directly to <strong>{listing.farmer_name}</strong>. This interest will appear under your <strong>"My Activity"</strong> tab.
        </p>

        <div style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 14px', marginBottom: 16, fontSize: 13, border: '1px solid #e2e8f0' }}>
          <div><strong>Residue:</strong> {listing.crop || 'Crop Residue'} ({listing.quantity_tonnes} tonnes)</div>
          <div><strong>Price:</strong> ₹{listing.asking_price_per_tonne}/tonne</div>
          <div><strong>Location:</strong> {[listing.district, listing.state].filter(Boolean).join(', ') || 'N/A'}</div>
        </div>

        <div className="form-group" style={{ marginBottom: 18 }}>
          <label className="form-label" style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, display: 'block' }}>Your Message to Farmer</label>
          <textarea
            className="form-input"
            style={{ minHeight: 110, resize: 'vertical', width: '100%', boxSizing: 'border-box' }}
            value={message}
            onChange={e => setMessage(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1, padding: '10px 14px' }}>Cancel</button>
          <button
            type="button"
            onClick={() => onSend(listing, message)}
            className="btn btn-primary"
            style={{ flex: 2, padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            disabled={sending || !message.trim()}
          >
            {sending ? 'Sending...' : '📨 Send & Track in My Activity'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BrowseAllListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination: show 6 per page
  const PAGE_SIZE = 6;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const [savedIds, setSavedIds] = useState(() => getSaved().map(l => l.id));
  const [myInterestIds, setMyInterestIds] = useState([]);

  const [detailListing, setDetailListing] = useState(null);
  const [contactListing, setContactListing] = useState(null);
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchAllListings = async () => {
    setLoading(true);
    setError('');
    try {
      // Get all active listings without location or filter parameters
      const data = await getListings({});
      // Filter out any non-available or deleted statuses if present
      const activeListings = (data || []).filter(l => (l.status || 'AVAILABLE').toUpperCase() === 'AVAILABLE');
      setListings(activeListings);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load marketplace listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllListings();

    // Load buyer's already registered interest IDs
    getMyInterests().then(data => {
      setMyInterestIds((data || []).map(i => i.listing_id));
    }).catch(() => {});
  }, []);

  const handleToggleSave = listing => {
    const current = getSaved();
    const exists = current.find(l => l.id === listing.id);
    let updated;
    if (exists) {
      updated = current.filter(l => l.id !== listing.id);
      setSuccessMsg(`Listing #${listing.id} removed from Saved Listings.`);
    } else {
      updated = [...current, listing];
      setSuccessMsg(`Listing #${listing.id} saved! View it anytime under "Saved Listings" on the left menu.`);
    }
    setSaved(updated);
    setSavedIds(updated.map(l => l.id));
    setTimeout(() => setSuccessMsg(''), 4500);
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
      setSuccessMsg(`Message sent to ${listing.farmer_name}! This interest is now tracked under "My Activity" on the left menu.`);
      setTimeout(() => setSuccessMsg(''), 5500);
    } catch (err) {
      alert(err.message || 'Failed to send interest to farmer');
    } finally {
      setSending(false);
    }
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + PAGE_SIZE);
  };

  const displayedListings = listings.slice(0, visibleCount);

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1300, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '0 0 6px 0', fontSize: 24, color: '#111827' }}>
            <ShoppingBag size={26} color="#15803d" /> Browse All Listings
          </h2>
          <p style={{ color: '#6b7280', margin: 0, fontSize: 14 }}>
            Explore every active crop residue and stubble listing created by farmers across all regions.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchAllListings}
          disabled={loading}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '8px 14px' }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Marketplace
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '12px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, color: '#15803d', fontWeight: 500 }}>
          <CheckCircle size={18} /> {successMsg}
        </div>
      )}

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 18px', color: '#dc2626', marginBottom: 20 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Summary Bar */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 20px', marginBottom: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontWeight: 700, color: '#111827', fontSize: 16 }}>All Active Farmer Listings</span>
          {!loading && (
            <span style={{ background: '#f0fdf4', color: '#15803d', fontSize: 12, fontWeight: 700, padding: '3px 12px', borderRadius: 20, border: '1px solid #bbf7d0' }}>
              {listings.length} Active {listings.length === 1 ? 'Listing' : 'Listings'}
            </span>
          )}
        </div>
        <div style={{ fontSize: 13, color: '#6b7280' }}>
          Showing <strong>{Math.min(visibleCount, listings.length)}</strong> of <strong>{listings.length}</strong>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '80px 0', background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🌾</div>
          <div style={{ fontSize: 17, fontWeight: 600, color: '#374151' }}>Loading active marketplace listings...</div>
          <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>Connecting with verified farmers</div>
        </div>
      )}

      {/* Empty State */}
      {!loading && listings.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '70px 24px', background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: 52, marginBottom: 14 }}>🌾</div>
          <h3 style={{ color: '#111827', marginBottom: 8, fontSize: 19 }}>No Active Listings in Marketplace Yet</h3>
          <p style={{ color: '#6b7280', fontSize: 14, maxWidth: 460, margin: '0 auto 18px auto' }}>
            There are currently no active stubble or biomass listings posted by farmers. Check back soon or refresh.
          </p>
          <button type="button" className="btn btn-primary" onClick={fetchAllListings}>
            <RefreshCw size={15} style={{ marginRight: 6 }} /> Check Again
          </button>
        </div>
      )}

      {/* Grid of Listings */}
      {!loading && displayedListings.length > 0 && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 20, marginBottom: 28 }}>
            {displayedListings.map(listing => (
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

          {/* Load More Button */}
          {visibleCount < listings.length && (
            <div style={{ textAlign: 'center', padding: '16px 0 32px 0' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleLoadMore}
                style={{ padding: '12px 32px', fontSize: 14, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8 }}
              >
                Load More Listings ({listings.length - visibleCount} remaining) <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {/* View Details Modal */}
      {detailListing && (
        <DetailModal
          listing={detailListing}
          onClose={() => setDetailListing(null)}
          onContact={handleContact}
          hasInterest={myInterestIds.includes(detailListing.id)}
        />
      )}

      {/* Contact Farmer Modal */}
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
