filepath = r"D:\Hackathon\CodeHex-AI-Enabled-Platform-for-Connecting-Farmers-with-Biomass-Buyers-to-Reduce-Paddy-Stubble-Burni\frontend\src\pages\buyer\FindResidue.jsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the return block of FindResidue (from the export default function down to the end)
export_idx = content.find("export default function FindResidue()")
# Find the closing of the filter block and replace the showFilters && ... block and outer return
old_block_start = content.find("        {showFilters && (", export_idx)
old_block_end = content.rfind("}") + 1  # very end of file

new_return_block = """
  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <Search size={24} color="#15803d" /> Find Residue
        </h2>
        <p style={{ color: '#6b7280', margin: 0 }}>Search and filter available crop residue from farmers across Punjab &amp; Haryana</p>
      </div>

      {successMsg && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, color: '#15803d' }}>
          <CheckCircle size={18} /> {successMsg}
        </div>
      )}

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

        {/* Vertical Filter Panel */}
        <div style={{ width: 280, flexShrink: 0, position: 'sticky', top: 80 }}>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', background: '#f0fdf4', borderBottom: '1px solid #d1fae5', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Filter size={15} color="#15803d" />
              <span style={{ fontWeight: 700, color: '#15803d', fontSize: 13 }}>Search &amp; Filter</span>
            </div>

            <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: 4, letterSpacing: '0.04em' }}>Crop Type</label>
                <input type="text" list="fr-crop-list" className="form-input" style={{ padding: '8px 10px', fontSize: 13, width: '100%', boxSizing: 'border-box' }} value={filters.crop} onChange={e => fld('crop', e.target.value)} placeholder="Type or pick…" />
                <datalist id="fr-crop-list">{CROPS.filter(Boolean).map(c => <option key={c} value={c} />)}</datalist>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: 4, letterSpacing: '0.04em' }}>Residue Type</label>
                <input type="text" list="fr-residue-list" className="form-input" style={{ padding: '8px 10px', fontSize: 13, width: '100%', boxSizing: 'border-box' }} value={filters.residue_type} onChange={e => fld('residue_type', e.target.value)} placeholder="Type or pick…" />
                <datalist id="fr-residue-list">{RESIDUE_TYPES.filter(Boolean).map(r => <option key={r} value={r} />)}</datalist>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: 4, letterSpacing: '0.04em' }}>Condition</label>
                <input type="text" list="fr-condition-list" className="form-input" style={{ padding: '8px 10px', fontSize: 13, width: '100%', boxSizing: 'border-box' }} value={filters.condition} onChange={e => fld('condition', e.target.value)} placeholder="Type or pick…" />
                <datalist id="fr-condition-list">{CONDITIONS.filter(Boolean).map(c => <option key={c} value={c} />)}</datalist>
              </div>

              <div style={{ borderTop: '1px dashed #e5e7eb' }} />

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: 4, letterSpacing: '0.04em' }}>State</label>
                <input type="text" list="fr-state-list" className="form-input" style={{ padding: '8px 10px', fontSize: 13, width: '100%', boxSizing: 'border-box' }} value={filters.state} onChange={e => fld('state', e.target.value)} placeholder="Type or pick…" />
                <datalist id="fr-state-list">{STATES.filter(Boolean).map(s => <option key={s} value={s} />)}</datalist>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: 4, letterSpacing: '0.04em' }}>District</label>
                <input type="text" list="fr-district-list" className="form-input" style={{ padding: '8px 10px', fontSize: 13, width: '100%', boxSizing: 'border-box' }} value={filters.district} onChange={e => fld('district', e.target.value)} placeholder="Type or pick…" />
                <datalist id="fr-district-list">
                  {(filters.state && DISTRICTS[filters.state] ? DISTRICTS[filters.state] : Object.values(DISTRICTS).flat()).map(d => <option key={d} value={d} />)}
                </datalist>
              </div>

              <div style={{ borderTop: '1px dashed #e5e7eb' }} />

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: 4, letterSpacing: '0.04em' }}>Min Quantity (tonnes)</label>
                <input type="number" className="form-input" style={{ padding: '8px 10px', fontSize: 13, width: '100%', boxSizing: 'border-box' }} value={filters.min_qty} onChange={e => fld('min_qty', e.target.value)} placeholder="e.g. 10" min="0" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: 4, letterSpacing: '0.04em' }}>Max Quantity (tonnes)</label>
                <input type="number" className="form-input" style={{ padding: '8px 10px', fontSize: 13, width: '100%', boxSizing: 'border-box' }} value={filters.max_qty} onChange={e => fld('max_qty', e.target.value)} placeholder="e.g. 500" min="0" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: 4, letterSpacing: '0.04em' }}>Max Price (₹ / tonne)</label>
                <input type="number" className="form-input" style={{ padding: '8px 10px', fontSize: 13, width: '100%', boxSizing: 'border-box' }} value={filters.max_price} onChange={e => fld('max_price', e.target.value)} placeholder="e.g. 3000" min="0" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: 4, letterSpacing: '0.04em' }}>Harvested After</label>
                <input type="date" className="form-input" style={{ padding: '8px 10px', fontSize: 13, width: '100%', boxSizing: 'border-box' }} value={filters.harvest_after} onChange={e => fld('harvest_after', e.target.value)} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 4 }}>
                <button className="btn btn-primary" style={{ width: '100%', padding: '10px', fontSize: 13 }} onClick={handleSearch} disabled={loading}>
                  {loading ? '🔍 Searching…' : <><Search size={14} style={{ marginRight: 6 }} />Search Listings</>}
                </button>
                <button className="btn btn-secondary" style={{ width: '100%', fontSize: 13 }} onClick={handleReset}>
                  <X size={14} style={{ marginRight: 4 }} /> Reset Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results area */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', color: '#dc2626', marginBottom: 16 }}>
              ⚠️ {error}
            </div>
          )}

          {searched && !loading && (
            <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 600, color: '#374151' }}>
                {listings.length === 0 ? 'No listings found' : `${listings.length} listing${listings.length !== 1 ? 's' : ''} found`}
              </div>
              {listings.length > 0 && <div style={{ fontSize: 12, color: '#6b7280' }}>Sorted by newest first</div>}
            </div>
          )}

          {loading && (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
              <div style={{ color: '#6b7280' }}>Searching listings...</div>
            </div>
          )}

          {!loading && searched && listings.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🌾</div>
              <h3 style={{ color: '#374151', marginBottom: 8 }}>No listings match your criteria</h3>
              <p style={{ color: '#6b7280' }}>Try adjusting your filters or removing some to see more results.</p>
              <button className="btn btn-primary" onClick={handleReset} style={{ marginTop: 16 }}>Clear All Filters</button>
            </div>
          )}

          {!loading && !searched && (
            <div className="card" style={{ textAlign: 'center', padding: '48px 24px', background: '#f9fafb' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🌱</div>
              <h3 style={{ color: '#374151', marginBottom: 8 }}>Set your requirements and search</h3>
              <p style={{ color: '#6b7280' }}>Use the filter panel on the left to find the right residue for your needs.</p>
            </div>
          )}

          {!loading && listings.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
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
"""

# Find the start of the return statement inside FindResidue function
fn_start = content.find("export default function FindResidue()")
return_start = content.find("  return (", fn_start)
if return_start == -1:
    print("ERROR: could not find return statement")
else:
    content = content[:return_start] + new_return_block
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Done: replaced return block")
