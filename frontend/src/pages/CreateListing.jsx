import { useState, useEffect } from 'react';
import { PackagePlus, Info, CheckCircle, Image as ImageIcon, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { createListing } from '../services/api'; // Or standard fetch

const STATES = ['Punjab', 'Haryana'];
const DISTRICTS = {
  Punjab:  ['Ludhiana', 'Amritsar', 'Patiala', 'Bathinda', 'Jalandhar', 'Sangrur'],
  Haryana: ['Karnal', 'Ambala', 'Kurukshetra', 'Panipat'],
};

const CROPS = ['Paddy (Rice)', 'Wheat', 'Sugarcane', 'Maize', 'Other'];
const RESIDUE_TYPES = ['Loose Straw', 'Baled Straw', 'Pellets', 'Other'];
const CONDITIONS = ['Dry', 'Wet', 'Semi-Dry'];

export default function CreateListing({ stubbleResult }) {
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const defaultState = stubbleResult?.state || currentUser?.farmer_profile?.state || 'Punjab';
  const defaultDistrict = stubbleResult?.district || currentUser?.farmer_profile?.district || 'Ludhiana';

  const [formData, setFormData] = useState({
    name: currentUser?.full_name || 'Farmer Name',
    contact: currentUser?.phone || '',
    state: defaultState,
    district: defaultDistrict,
    village: currentUser?.farmer_profile?.village || '',
    crop: 'Paddy (Rice)',
    residueType: 'Baled Straw',
    quantity: stubbleResult?.tonnes ? String(stubbleResult.tonnes.toFixed(1)) : '',
    condition: 'Dry',
    harvestDate: '',
    expectedPrice: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
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
  };

  const calculateAge = () => {
    if (!formData.harvestDate) return null;
    const hDate = new Date(formData.harvestDate);
    const todayDate = new Date();
    const diffTime = Math.abs(todayDate - hDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleInputChange = (e) => {
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Fallback coords based on district for the backend
    const coords = { lat: 30.9, lon: 75.85 };
    
    const payload = {
      quantity_tonnes: parseFloat(formData.quantity) || 50,
      asking_price_per_tonne: parseFloat(formData.expectedPrice) || 2500,
      latitude: coords.lat,
      longitude: coords.lon,
      state: formData.state,
      district: formData.district,
      // We could also pass these extra fields if the backend allowed, but we'll stick to schema limits or simulate
      village: formData.village,
      crop: formData.crop,
      residue_type: formData.residueType,
      condition: formData.condition,
      harvest_date: formData.harvestDate,
    };

    try {
      await createListing(payload);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to create listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div>
        <div className="page-header">
          <h2><PackagePlus size={24} style={{display: 'inline', verticalAlign: 'middle'}}/> Create Listing</h2>
          <p>List your stubble on the marketplace</p>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <CheckCircle size={48} color="var(--green-600)" style={{ marginBottom: 16 }} />
          <h3 style={{ fontSize: '1.5rem', marginBottom: 8 }}>Listing Created Successfully!</h3>
          <p style={{ color: 'var(--gray-600)', marginBottom: 24 }}>Your stubble is now visible to active buyers on the platform.</p>
          <button className="btn btn-primary" onClick={() => setSuccess(false)}>Create Another Listing</button>
        </div>
      </div>
    );
  }

  const ageOfResidue = calculateAge();

  return (
    <div>
      <div className="page-header">
        <h2><PackagePlus size={24} style={{display: 'inline', verticalAlign: 'middle', marginRight: 8}}/> Create Listing</h2>
        <p>Fill in the details to list your stubble on the marketplace</p>
      </div>

      <div className="card" style={{ maxWidth: 800, margin: '0 auto' }}>
        <form onSubmit={handleSubmit}>
          
          <div className="card-title" style={{ marginBottom: 16, fontSize: '1.1rem' }}>Farmer Details</div>
          
          <div className="form-row" style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label">Farmer Name</label>
              <input type="text" className="form-input" name="name" value={formData.name} disabled />
            </div>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label">Contact Number</label>
              <input type="text" className="form-input" name="contact" value={formData.contact} onChange={handleInputChange} required />
            </div>
          </div>

          <div className="card-title" style={{ marginBottom: 16, fontSize: '1.1rem', marginTop: 32 }}>Location Information</div>
          
          <div className="form-row" style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label">State</label>
              <input type="text" className="form-input" list="state-options" name="state" value={formData.state} onChange={handleInputChange} placeholder="Select or type..." />
              <datalist id="state-options">
                {STATES.map(s => <option key={s} value={s} />)}
              </datalist>
            </div>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label">District</label>
              <input type="text" className="form-input" list="district-options" name="district" value={formData.district} onChange={handleInputChange} placeholder="Select or type..." />
              <datalist id="district-options">
                {(DISTRICTS[formData.state] || []).map(d => <option key={d} value={d} />)}
              </datalist>
            </div>
          </div>
          
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">Village</label>
            <input type="text" className="form-input" name="village" value={formData.village} onChange={handleInputChange} required placeholder="Enter village name" />
          </div>

          <div className="card-title" style={{ marginBottom: 16, fontSize: '1.1rem', marginTop: 32 }}>Stubble Information</div>

          <div className="form-row" style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label">Crop</label>
              <input type="text" className="form-input" list="crop-options" name="crop" value={formData.crop} onChange={handleInputChange} placeholder="Select or type..." />
              <datalist id="crop-options">
                {CROPS.map(c => <option key={c} value={c} />)}
              </datalist>
            </div>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label">Residue Type</label>
              <input type="text" className="form-input" list="residue-options" name="residueType" value={formData.residueType} onChange={handleInputChange} placeholder="Select or type..." />
              <datalist id="residue-options">
                {RESIDUE_TYPES.map(r => <option key={r} value={r} />)}
              </datalist>
            </div>
          </div>

          <div className="form-row" style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label">Quantity (Tonnes)</label>
              <input type="number" className="form-input" name="quantity" value={formData.quantity} onChange={handleInputChange} step="0.1" min="0.1" required placeholder="e.g. 50" />
            </div>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label">Expected Price (₹ per tonne)</label>
              <input type="number" className="form-input" name="expectedPrice" value={formData.expectedPrice} onChange={handleInputChange} step="1" min="100" required placeholder="e.g. 2500" />
            </div>
          </div>

          <div className="card-title" style={{ marginBottom: 16, fontSize: '1.1rem', marginTop: 32 }}>Quality Details</div>

          <div className="form-row" style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label">Condition</label>
              <input type="text" className="form-input" list="condition-options" name="condition" value={formData.condition} onChange={handleInputChange} placeholder="Select or type..." />
              <datalist id="condition-options">
                {CONDITIONS.map(c => <option key={c} value={c} />)}
              </datalist>
            </div>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label">Date of Harvesting</label>
              <input type="date" className="form-input" name="harvestDate" max={today} value={formData.harvestDate} onChange={handleInputChange} required />
            </div>
          </div>

          {ageOfResidue !== null && (
            <div className="info-banner" style={{ marginBottom: 16 }}>
              <Info size={16} />
              <span>Age of Residue: <strong>{ageOfResidue} days old</strong></span>
            </div>
          )}

          <div className="form-row" style={{ display: 'flex', gap: 16, marginBottom: 16, marginTop: 16 }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label">Listing Date (Automatic)</label>
              <input type="text" className="form-input" value={today} disabled />
            </div>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label">Status (Automatic)</label>
              <input type="text" className="form-input" value="Available" style={{ color: 'var(--green-700)', fontWeight: 'bold', backgroundColor: '#f0fdf4' }} disabled />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: 24, padding: 24, border: '1px dashed #d1d5db', borderRadius: 8, textAlign: 'center', backgroundColor: '#f9fafb', position: 'relative' }}>
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
          </div>

          {error && <div className="error-message" style={{ color: 'red', marginTop: '10px' }}>{error}</div>}

          <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 24 }} disabled={loading}>
            {loading ? 'Creating Listing...' : 'Submit Listing'}
          </button>
        </form>
      </div>
    </div>
  );
}
