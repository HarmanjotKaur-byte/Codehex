import re
import os

filepath = r"D:\Hackathon\CodeHex-AI-Enabled-Platform-for-Connecting-Farmers-with-Biomass-Buyers-to-Reduce-Paddy-Stubble-Burni\frontend\src\pages\CreateListing.jsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add image state and image handler
state_block = """  const [error, setError] = useState('');

  const today = new Date().toISOString().split('T')[0];"""

new_state_block = """  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  const today = new Date().toISOString().split('T')[0];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };"""

content = content.replace(state_block, new_state_block)

# 2. Fix handleInputChange for custom state typing
handle_change_old = """  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'state') {
      setFormData(prev => ({
        ...prev,
        state: value,
        district: DISTRICTS[value][0]
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };"""

handle_change_new = """  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'state') {
      setFormData(prev => ({
        ...prev,
        state: value,
        district: DISTRICTS[value] ? DISTRICTS[value][0] : ''
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };"""

content = content.replace(handle_change_old, handle_change_new)

# 3. Replace State Select with input + datalist
state_select_old = """              <select className="form-select" name="state" value={formData.state} onChange={handleInputChange}>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>"""
state_select_new = """              <input type="text" className="form-input" list="state-options" name="state" value={formData.state} onChange={handleInputChange} placeholder="Select or type..." />
              <datalist id="state-options">
                {STATES.map(s => <option key={s} value={s} />)}
              </datalist>"""
content = content.replace(state_select_old, state_select_new)

# 4. Replace District Select with input + datalist
district_select_old = """              <select className="form-select" name="district" value={formData.district} onChange={handleInputChange}>
                {DISTRICTS[formData.state].map(d => <option key={d} value={d}>{d}</option>)}
              </select>"""
district_select_new = """              <input type="text" className="form-input" list="district-options" name="district" value={formData.district} onChange={handleInputChange} placeholder="Select or type..." />
              <datalist id="district-options">
                {(DISTRICTS[formData.state] || []).map(d => <option key={d} value={d} />)}
              </datalist>"""
content = content.replace(district_select_old, district_select_new)

# 5. Replace Crop Select
crop_select_old = """              <select className="form-select" name="crop" value={formData.crop} onChange={handleInputChange}>
                {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>"""
crop_select_new = """              <input type="text" className="form-input" list="crop-options" name="crop" value={formData.crop} onChange={handleInputChange} placeholder="Select or type..." />
              <datalist id="crop-options">
                {CROPS.map(c => <option key={c} value={c} />)}
              </datalist>"""
content = content.replace(crop_select_old, crop_select_new)

# 6. Replace Residue Type Select
residue_select_old = """              <select className="form-select" name="residueType" value={formData.residueType} onChange={handleInputChange}>
                {RESIDUE_TYPES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>"""
residue_select_new = """              <input type="text" className="form-input" list="residue-options" name="residueType" value={formData.residueType} onChange={handleInputChange} placeholder="Select or type..." />
              <datalist id="residue-options">
                {RESIDUE_TYPES.map(r => <option key={r} value={r} />)}
              </datalist>"""
content = content.replace(residue_select_old, residue_select_new)

# 7. Replace Condition Select
condition_select_old = """              <select className="form-select" name="condition" value={formData.condition} onChange={handleInputChange}>
                {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>"""
condition_select_new = """              <input type="text" className="form-input" list="condition-options" name="condition" value={formData.condition} onChange={handleInputChange} placeholder="Select or type..." />
              <datalist id="condition-options">
                {CONDITIONS.map(c => <option key={c} value={c} />)}
              </datalist>"""
content = content.replace(condition_select_old, condition_select_new)

# 8. Replace Image upload UI
image_ui_old = """          <div className="form-group" style={{ marginTop: 24, padding: 24, border: '1px dashed #d1d5db', borderRadius: 8, textAlign: 'center', backgroundColor: '#f9fafb' }}>
            <ImageIcon size={32} color="#9ca3af" style={{ margin: '0 auto 8px auto' }} />
            <p style={{ margin: 0, color: '#4b5563', fontSize: '0.9rem', fontWeight: 500 }}>Upload Photo (Optional)</p>
            <p style={{ margin: '4px 0 12px 0', color: '#9ca3af', fontSize: '0.8rem' }}>PNG, JPG up to 5MB</p>
            <button type="button" className="btn btn-secondary">Select Image</button>
          </div>"""

image_ui_new = """          <div className="form-group" style={{ marginTop: 24, padding: 24, border: '1px dashed #d1d5db', borderRadius: 8, textAlign: 'center', backgroundColor: '#f9fafb', position: 'relative' }}>
            {imagePreview ? (
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: 8 }} />
                <button 
                  type="button" 
                  onClick={() => setImagePreview(null)} 
                  style={{ position: 'absolute', top: 5, right: 5, background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', cursor: 'pointer', padding: 4 }}
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <>
                <ImageIcon size={32} color="#9ca3af" style={{ margin: '0 auto 8px auto' }} />
                <p style={{ margin: 0, color: '#4b5563', fontSize: '0.9rem', fontWeight: 500 }}>Upload Photo (Optional)</p>
                <p style={{ margin: '4px 0 12px 0', color: '#9ca3af', fontSize: '0.8rem' }}>PNG, JPG up to 5MB</p>
                
                <input 
                  type="file" 
                  id="image-upload" 
                  accept="image/png, image/jpeg" 
                  style={{ display: 'none' }} 
                  onChange={handleImageChange} 
                />
                <label htmlFor="image-upload" className="btn btn-secondary" style={{ cursor: 'pointer', display: 'inline-block' }}>
                  Select Image
                </label>
              </>
            )}
          </div>"""

content = content.replace(image_ui_old, image_ui_new)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patching successful!")
