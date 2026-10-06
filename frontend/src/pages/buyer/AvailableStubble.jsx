import { useState } from 'react';
import { Filter, Eye, Check, MapPin, X, Info } from 'lucide-react';
import { DEMO_MARKETPLACE_LISTINGS, calculateDistance } from '../../services/marketplace';

// Default reference location for buyer: Ludhiana Industrial Area
const BUYER_REF_LAT = 30.9000;
const BUYER_REF_LON = 75.8573;

export default function AvailableStubble() {
  const [maxDistance, setMaxDistance] = useState('150');
  const [minQty, setMinQty] = useState('0');
  const [maxPrice, setMaxPrice] = useState('2500');
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  // Modal / Detail state
  const [selectedListing, setSelectedListing] = useState(null);
  // Expressed interest IDs set
  const [interestedIds, setInterestedIds] = useState(new Set());
  const [alertMsg, setAlertMsg] = useState('');

  const handleExpressInterest = (id) => {
    setInterestedIds(prev => new Set(prev).add(id));
    setAlertMsg(`Interest recorded for listing ${id} in this demo.`);
    setTimeout(() => setAlertMsg(''), 4000);
  };

  // Filter listings
  const filteredListings = DEMO_MARKETPLACE_LISTINGS.filter(item => {
    const dist = calculateDistance(BUYER_REF_LAT, BUYER_REF_LON, item.latitude, item.longitude);
    if (dist > parseFloat(maxDistance)) return false;
    if (item.stubble_quantity_tonnes < parseFloat(minQty)) return false;
    if (item.asking_price_per_tonne > parseFloat(maxPrice)) return false;
    if (onlyAvailable && !item.is_available) return false;
    return true;
  });

  return (
    <div>
      <div className="page-header">
        <h2>🌾 Available Paddy Stubble Listings</h2>
        <p>Browse verified farmer listings. All coordinates snapped relative to Ludhiana central hub.</p>
      </div>

      {alertMsg && (
        <div className="success-banner" style={{ marginBottom: 16 }}>
          <Check size={16} />
          <span>{alertMsg}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: 24, padding: '18px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, fontWeight: 700 }}>
          <Filter size={18} color="var(--green-700)" />
          <span>Filter Listings</span>
        </div>

        <div className="filters-row">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Max Distance (km)</label>
            <input 
              type="number" 
              className="form-input" 
              value={maxDistance} 
              onChange={e => setMaxDistance(e.target.value)} 
              min="10" 
              max="500" 
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Min Stubble (tonnes)</label>
            <input 
              type="number" 
              className="form-input" 
              value={minQty} 
              onChange={e => setMinQty(e.target.value)} 
              min="0" 
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Max Price (₹/tonne)</label>
            <input 
              type="number" 
              className="form-input" 
              value={maxPrice} 
              onChange={e => setMaxPrice(e.target.value)} 
              min="1000" 
              step="50" 
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0, justifyContent: 'center' }}>
            <label className="form-label" style={{ marginBottom: 8 }}>Availability</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={onlyAvailable} 
                onChange={e => setOnlyAvailable(e.target.checked)} 
              />
              Available Only
            </label>
          </div>
        </div>
      </div>

      {/* Table / Listings */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span className="card-title">Demo Marketplace Listings ({filteredListings.length} found)</span>
          <span className="chip chip-green">Ludhiana Hub Context</span>
        </div>

        {filteredListings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--gray-400)' }}>
            <p>No listings match your filter criteria. Try relaxing distance or price limits.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="metrics-table">
              <thead>
                <tr>
                  <th>Listing ID</th>
                  <th>Location</th>
                  <th>Quantity</th>
                  <th>Distance</th>
                  <th>Asking Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredListings.map(item => {
                  const dist = calculateDistance(BUYER_REF_LAT, BUYER_REF_LON, item.latitude, item.longitude);
                  const isInterested = interestedIds.has(item.id);

                  return (
                    <tr key={item.id}>
                      <td><strong>{item.id}</strong></td>
                      <td>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={13} color="var(--gray-500)" />
                          {item.district}, {item.state}
                        </span>
                      </td>
                      <td><strong>{item.stubble_quantity_tonnes} t</strong></td>
                      <td>{dist} km</td>
                      <td>₹{item.asking_price_per_tonne.toLocaleString()}/t</td>
                      <td>
                        {item.is_available ? (
                          <span className="chip chip-green">Available</span>
                        ) : (
                          <span className="chip chip-red">Reserved</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                            onClick={() => setSelectedListing(item)}
                          >
                            <Eye size={13} /> View Details
                          </button>
                          
                          <button 
                            className={`btn ${isInterested ? 'btn-secondary' : 'btn-primary'}`} 
                            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                            onClick={() => handleExpressInterest(item.id)}
                            disabled={!item.is_available || isInterested}
                          >
                            {isInterested ? '✓ Interested' : 'Express Interest'}
                          </button>
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
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Listing Details: {selectedListing.id}</h3>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '4px 8px' }} 
                onClick={() => setSelectedListing(null)}
              >
                <X size={16} />
              </button>
            </div>

            <table className="metrics-table" style={{ marginBottom: 20 }}>
              <tbody>
                <tr><td>Farmer Contact</td><td>{selectedListing.farmer_name} ({selectedListing.contact_number})</td></tr>
                <tr><td>Location</td><td>{selectedListing.district}, {selectedListing.state}</td></tr>
                <tr><td>Coordinates</td><td>{selectedListing.latitude}°N, {selectedListing.longitude}°E</td></tr>
                <tr><td>Available Volume</td><td><strong>{selectedListing.stubble_quantity_tonnes} tonnes</strong></td></tr>
                <tr><td>Crop & Season</td><td>Paddy ({selectedListing.season} {selectedListing.crop_year})</td></tr>
                <tr><td>Asking Price</td><td><strong>₹{selectedListing.asking_price_per_tonne} / tonne</strong></td></tr>
                <tr>
                  <td>Distance from Hub</td>
                  <td>{calculateDistance(BUYER_REF_LAT, BUYER_REF_LON, selectedListing.latitude, selectedListing.longitude)} km</td>
                </tr>
                <tr>
                  <td>Status</td>
                  <td>
                    {selectedListing.is_available ? (
                      <span className="chip chip-green">Accepting Purchase Offers</span>
                    ) : (
                      <span className="chip chip-red">Currently Reserved</span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="info-banner" style={{ marginBottom: 16 }}>
              <Info size={16} />
              <span>Prototype note: In production, payment escrow and transport booking occur upon agreement.</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button className="btn btn-secondary" onClick={() => setSelectedListing(null)}>
                Close
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  handleExpressInterest(selectedListing.id);
                  setSelectedListing(null);
                }}
                disabled={!selectedListing.is_available || interestedIds.has(selectedListing.id)}
              >
                {interestedIds.has(selectedListing.id) ? 'Interest Recorded' : 'Express Commercial Interest'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
