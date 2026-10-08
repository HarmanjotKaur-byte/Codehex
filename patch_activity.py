import re

filepath = r"D:\Hackathon\CodeHex-AI-Enabled-Platform-for-Connecting-Farmers-with-Biomass-Buyers-to-Reduce-Paddy-Stubble-Burni\frontend\src\pages\FarmerActivity.jsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add state for view/edit modal
state_insert = """  const [tab, setTab] = useState('interests');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');"""
state_new = """  const [tab, setTab] = useState('interests');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [viewingListing, setViewingListing] = useState(null);
  const [editingListing, setEditingListing] = useState(null);
  const [editForm, setEditForm] = useState({ quantity_tonnes: '', asking_price_per_tonne: '' });"""
content = content.replace(state_insert, state_new)

# Add edit/delete handler functions inside component
fetch_insert = """  useEffect(() => {
    fetchAll();
  }, []);"""
funcs_new = """  useEffect(() => {
    fetchAll();
  }, []);

  const handleDeleteListing = async (id) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    try {
      const res = await apiFetch(`/api/listings/${id}`, { method: 'DELETE' });
      setListings(listings.filter(l => l.id !== id));
    } catch (err) {
      alert("Failed to delete listing.");
    }
  };

  const handleEditClick = (l) => {
    setEditingListing(l);
    setEditForm({ 
      quantity_tonnes: l.quantity_tonnes, 
      asking_price_per_tonne: l.asking_price_per_tonne,
      crop: l.crop || '',
      condition: l.condition || ''
    });
  };

  const handleUpdateListing = async () => {
    try {
      const res = await apiFetch(`/api/listings/${editingListing.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          quantity_tonnes: parseFloat(editForm.quantity_tonnes),
          asking_price_per_tonne: parseFloat(editForm.asking_price_per_tonne),
          crop: editForm.crop,
          condition: editForm.condition
        })
      });
      setListings(listings.map(l => l.id === editingListing.id ? res : l));
      setEditingListing(null);
    } catch (err) {
      alert("Failed to update listing.");
    }
  };"""
content = content.replace(fetch_insert, funcs_new)

# Modify Table Headers
header_old = """                        <th>{t('farmer.matchedBuyers')}</th>
                        <th>{t('common.status')}</th>
                        <th>{t('common.date')}</th>
                      </tr>
                    </thead>"""
header_new = """                        <th>{t('farmer.matchedBuyers')}</th>
                        <th>{t('common.status')}</th>
                        <th>{t('common.date')}</th>
                        <th>Actions</th>
                      </tr>
                    </thead>"""
content = content.replace(header_old, header_new)

# Modify Table Body
body_old = """                          <td>{statusBadge(l.status)}</td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{fmtDate(l.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>"""
body_new = """                          <td>{statusBadge(l.status)}</td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{fmtDate(l.created_at)}</td>
                          <td>
                            <button onClick={() => setViewingListing(l)} className="btn btn-secondary" style={{padding: '4px 8px', fontSize: '0.75rem', marginRight: 4}}>View</button>
                            <button onClick={() => handleEditClick(l)} className="btn btn-primary" style={{padding: '4px 8px', fontSize: '0.75rem', marginRight: 4}}>Edit</button>
                            <button onClick={() => handleDeleteListing(l.id)} className="btn btn-secondary" style={{padding: '4px 8px', fontSize: '0.75rem', color: 'red'}}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>"""
content = content.replace(body_old, body_new)

# Add modals to end of component
end_insert = """    </div>
  );
}"""
modals_new = """      {viewingListing && (
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
}"""
content = content.replace(end_insert, modals_new)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("FarmerActivity patched successfully")
