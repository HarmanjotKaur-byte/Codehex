filepath = r"D:\Hackathon\CodeHex-AI-Enabled-Platform-for-Connecting-Farmers-with-Biomass-Buyers-to-Reduce-Paddy-Stubble-Burni\frontend\src\pages\buyer\FindResidue.jsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

fn_start = content.find("export default function FindResidue()")
return_start = content.find("  return (", fn_start)

new_return_block = """
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
"""

content = content[:return_start] + new_return_block
with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Done: full-width centered form")
