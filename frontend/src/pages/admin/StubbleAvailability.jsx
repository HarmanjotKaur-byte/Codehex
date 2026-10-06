import { useState } from 'react';
import { Layers, MapPin, Eye, CheckCircle, AlertTriangle } from 'lucide-react';
import { DEMO_MARKETPLACE_LISTINGS } from '../../services/marketplace';

export default function StubbleAvailability() {
  const [districtFilter, setDistrictFilter] = useState('ALL');

  const districts = ['ALL', 'Ludhiana', 'Patiala', 'Karnal', 'Jalandhar', 'Bathinda', 'Sangrur'];

  const filtered = DEMO_MARKETPLACE_LISTINGS.filter(item => 
    districtFilter === 'ALL' || item.district === districtFilter
  );

  const totalVol = filtered.reduce((acc, curr) => acc + curr.stubble_quantity_tonnes, 0);

  return (
    <div>
      <div className="page-header">
        <h2>📊 Regional Stubble Availability Oversight</h2>
        <p>Monitor recoverable paddy residue across Punjab and Haryana administrative districts.</p>
      </div>

      {/* Overview Cards */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: 'var(--green-100)', color: 'var(--green-700)' }}>
            <Layers size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Listed Biomass Volume</span>
            <span className="stat-value">{totalVol.toFixed(1)} t</span>
            <span className="stat-sub">{filtered.length} farm parcels</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: 'var(--blue-100)', color: 'var(--blue-600)' }}>
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Available for Offtake</span>
            <span className="stat-value">
              {filtered.filter(i => i.is_available).reduce((a, b) => a + b.stubble_quantity_tonnes, 0).toFixed(1)} t
            </span>
            <span className="stat-sub">Not yet bound by contracts</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: 'var(--amber-100)', color: 'var(--amber-600)' }}>
            <AlertTriangle size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Diversion Progress</span>
            <span className="stat-value">Active</span>
            <span className="stat-sub">Direct commercial off-take</span>
          </div>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div className="card-title">Tracked Biomass Supply Listings</div>
            <div className="card-subtitle" style={{ marginBottom: 0 }}>Verified parcel-level inventories</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>District:</label>
            <select 
              className="form-select" 
              style={{ width: 'auto', padding: '6px 12px' }}
              value={districtFilter}
              onChange={e => setDistrictFilter(e.target.value)}
            >
              {districts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--gray-400)' }}>
            <p>No marketplace availability data available for this district.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="metrics-table">
              <thead>
                <tr>
                  <th>Parcel ID</th>
                  <th>Location</th>
                  <th>Coordinates</th>
                  <th>Quantity (t)</th>
                  <th>Season</th>
                  <th>Asking Price</th>
                  <th>Offtake Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => (
                  <tr key={item.id}>
                    <td><strong>{item.id}</strong></td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={13} color="var(--gray-500)" />
                        {item.district}, {item.state}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--gray-600)' }}>
                      {item.latitude}°N, {item.longitude}°E
                    </td>
                    <td><strong>{item.stubble_quantity_tonnes} t</strong></td>
                    <td>{item.season} {item.crop_year}</td>
                    <td>₹{item.asking_price_per_tonne}/t</td>
                    <td>
                      {item.is_available ? (
                        <span className="chip chip-green">Available</span>
                      ) : (
                        <span className="chip chip-red">Reserved</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
