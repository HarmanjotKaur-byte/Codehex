import { useState, useEffect } from 'react';
import { 
  Building2, Wheat, MapPin, CheckCircle2, AlertCircle, 
  RefreshCw, Check, Edit3, Trash2, Save, Phone, Mail,
  Coins, Compass
} from 'lucide-react';
import { getBuyerProfile, registerBuyerInterest, deleteBuyerProfile } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

const BUYER_TYPES = [
  'Biomass Aggregator',
  'Pellet & Briquette Manufacturer',
  'Biomass Power Plant / Thermal Plant',
  'Bio-CNG & Biogas Producer',
  'Paper & Packaging Mill',
  'Industrial Boiler Operator',
  'Animal Feed & Dairy Farm',
  'Commercial Exporter'
];

const MATERIAL_TYPES = [
  'Paddy Straw Bales',
  'Loose Paddy Straw',
  'Chopped Paddy Straw',
  'Paddy Straw Pellets',
  'Rice Husk',
  'Mustard Stubble',
  'Wheat Straw',
  'Mixed Agricultural Biomass'
];

const STATES = ['Punjab', 'Haryana', 'Rajasthan', 'Uttar Pradesh', 'Delhi NCR'];

const DISTRICTS_BY_STATE = {
  'Punjab': ['Ludhiana', 'Amritsar', 'Patiala', 'Bathinda', 'Jalandhar', 'Sangrur', 'Firozpur', 'Moga', 'Hoshiarpur', 'Fazilka', 'Barnala', 'Fatehgarh Sahib', 'Kapurthala', 'Mansa', 'Muktsar', 'Rupnagar', 'SAS Nagar (Mohali)', 'Shahid Bhagat Singh Nagar', 'Tarn Taran'],
  'Haryana': ['Karnal', 'Ambala', 'Kurukshetra', 'Panipat', 'Kaithal', 'Hisar', 'Fatehabad', 'Jind', 'Rohtak', 'Sonipat', 'Sirsa', 'Yamunanagar'],
  'Rajasthan': ['Sri Ganganagar', 'Hanumangarh', 'Alwar', 'Bharatpur', 'Jaipur'],
  'Uttar Pradesh': ['Saharanpur', 'Muzaffarnagar', 'Meerut', 'Bijnor', 'Moradabad', 'Rampur', 'Bareilly', 'Pilibhit'],
  'Delhi NCR': ['New Delhi', 'North Delhi', 'South Delhi', 'West Delhi', 'East Delhi']
};

export default function RegisterInterest() {
  const { currentUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  
  // Registration view mode: true = form open, false = form closed (registered view)
  const [isFormOpen, setIsFormOpen] = useState(true);
  const [hasRegistered, setHasRegistered] = useState(false);
  const [savedData, setSavedData] = useState(null);

  // Form State containing only the 3 sections from the image
  const [formData, setFormData] = useState({
    // 1. Company & Contact Details
    businessName: '',
    buyerType: 'Biomass Aggregator',
    fullName: '',
    phone: '',
    email: '',

    // 2. Biomass & Quantity Specifications
    preferredMaterial: 'Paddy Straw Bales',
    requiredQuantityTonnes: 100,
    purchaseFrequency: 'Regular / Seasonal',

    // 3. Preferred Sourcing Location & Budget
    state: 'Punjab',
    district: 'Ludhiana',
    maxDistanceKm: 100,
    budgetPerTonne: 2000,
    locationAddress: ''
  });

  const showToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 4500);
  };

  // Load existing profile from backend
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await getBuyerProfile();
      if (data) {
        const isRegistered = Boolean(data.business_name && (data.required_quantity_tonnes || 0) > 0);
        setHasRegistered(isRegistered);
        setSavedData(data);

        setFormData({
          businessName: data.business_name || (currentUser?.full_name ? `${currentUser.full_name}'s Enterprise` : ''),
          buyerType: data.buyer_type || 'Biomass Aggregator',
          fullName: data.full_name || currentUser?.full_name || '',
          phone: data.phone || currentUser?.phone || '',
          email: data.email || currentUser?.email || '',
          preferredMaterial: data.preferred_material || 'Paddy Straw Bales',
          requiredQuantityTonnes: data.required_quantity_tonnes || 100,
          purchaseFrequency: data.purchase_frequency || 'Regular / Seasonal',
          state: data.state || 'Punjab',
          district: data.district || 'Ludhiana',
          maxDistanceKm: data.max_distance_km || 100,
          budgetPerTonne: data.budget_per_tonne || 2000,
          locationAddress: data.location_address || ''
        });

        // If user is already registered, close form by default and show the registered confirmation view
        if (isRegistered) {
          setIsFormOpen(false);
        } else {
          setIsFormOpen(true);
        }
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      setFormData(prev => ({
        ...prev,
        fullName: currentUser?.full_name || '',
        email: currentUser?.email || '',
        phone: currentUser?.phone || '',
        businessName: currentUser?.full_name ? `${currentUser.full_name}'s Enterprise` : ''
      }));
      setIsFormOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'state') {
        const dists = DISTRICTS_BY_STATE[value] || [];
        updated.district = dists[0] || '';
      }
      return updated;
    });
  };

  // Save Registration Handler
  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.businessName.trim()) {
      showToast('Please enter your Buyer / Enterprise Name', 'error');
      return;
    }
    if (!formData.phone.trim()) {
      showToast('Please enter a Contact Phone Number', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        business_name: formData.businessName.trim(),
        buyer_type: formData.buyerType,
        full_name: formData.fullName.trim(),
        phone: formData.phone.trim(),
        preferred_material: formData.preferredMaterial,
        required_quantity_tonnes: parseFloat(formData.requiredQuantityTonnes) || 100,
        purchase_frequency: formData.purchaseFrequency,
        state: formData.state,
        district: formData.district,
        max_distance_km: parseFloat(formData.maxDistanceKm) || 100,
        budget_per_tonne: parseFloat(formData.budgetPerTonne) || 2000,
        location_address: formData.locationAddress.trim()
      };

      const updated = await registerBuyerInterest(payload);
      setSavedData(updated);
      setHasRegistered(true);
      // Close form as requested!
      setIsFormOpen(false);
      showToast('Successfully registered as a buyer on Paralipay!');
    } catch (err) {
      console.error('Save failed:', err);
      showToast(err.message || 'Failed to save registration. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Registration Handler
  const handleDelete = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your buyer registration? You will no longer appear to farmers in "Search Buyers".'
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      await deleteBuyerProfile();
      setHasRegistered(false);
      setSavedData(null);
      // Reset form fields
      setFormData({
        businessName: '',
        buyerType: 'Biomass Aggregator',
        fullName: currentUser?.full_name || '',
        phone: currentUser?.phone || '',
        email: currentUser?.email || '',
        preferredMaterial: 'Paddy Straw Bales',
        requiredQuantityTonnes: 100,
        purchaseFrequency: 'Regular / Seasonal',
        state: 'Punjab',
        district: 'Ludhiana',
        maxDistanceKm: 100,
        budgetPerTonne: 2000,
        locationAddress: ''
      });
      // Open clean form
      setIsFormOpen(true);
      showToast('Buyer registration deleted successfully.');
    } catch (err) {
      console.error('Delete failed:', err);
      showToast(err.message || 'Failed to delete registration.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ padding: '24px 20px', maxWidth: '1050px', margin: '0 auto', fontFamily: 'var(--font-sans)' }}>
      
      {/* Toast Alert */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: toastType === 'error' ? '#991b1b' : '#1f2937',
          color: '#fff',
          padding: '12px 20px',
          borderRadius: 10,
          boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 14,
          fontWeight: 500,
          animation: 'fadeIn 0.2s ease'
        }}>
          {toastType === 'error' ? <AlertCircle size={18} color="#fca5a5" /> : <CheckCircle2 size={18} color="#4ade80" />}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--gray-900)', margin: '0 0 6px 0' }}>
          Registration as a Buyer
        </h1>
        <p style={{ color: 'var(--gray-600)', margin: 0, fontSize: 14 }}>
          Fill in your company requirements and contact details below to register yourself on Paralipay so farmers can discover you through "Search Buyers".
        </p>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 0', background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
          <div style={{ color: 'var(--gray-600)', fontSize: 14, fontWeight: 500 }}>Loading registration details...</div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW: REGISTERED CONFIRMATION (Shown when form is closed after submission) */}
      {/* ========================================================================= */}
      {!loading && !isFormOpen && hasRegistered && savedData && (
        <div style={{ display: 'grid', gap: 20 }}>
          
          {/* Successfully Registered Banner */}
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #86efac',
            borderRadius: 14,
            padding: '24px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                background: '#15803d',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <CheckCircle2 size={30} />
              </div>
              <div>
                <h2 style={{ fontSize: 19, fontWeight: 700, color: '#14532d', margin: 0 }}>
                  Successfully Registered as a Buyer
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: 13, color: '#166534' }}>
                  Your requirements are active in the database. Farmers searching for buyers in your area can now find and contact your enterprise.
                </p>
              </div>
            </div>

            {/* Action Buttons: Edit or Delete */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                onClick={() => setIsFormOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '9px 18px',
                  background: '#15803d',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#ffffff',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(21, 128, 61, 0.25)',
                  transition: 'background 0.15s ease'
                }}
                onMouseOver={e => e.currentTarget.style.background = '#166534'}
                onMouseOut={e => e.currentTarget.style.background = '#15803d'}
              >
                <Edit3 size={15} />
                <span>Edit Registration</span>
              </button>

              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '9px 18px',
                  background: '#ffffff',
                  border: '1px solid #fca5a5',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#dc2626',
                  cursor: deleting ? 'not-allowed' : 'pointer',
                  transition: 'background 0.15s ease'
                }}
                onMouseOver={e => { if (!deleting) e.currentTarget.style.background = '#fef2f2'; }}
                onMouseOut={e => { if (!deleting) e.currentTarget.style.background = '#ffffff'; }}
              >
                <Trash2 size={15} />
                <span>{deleting ? 'Deleting...' : 'Delete Registration'}</span>
              </button>
            </div>
          </div>

          {/* Registered Details Summary Card (The 3 Sections) */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: 14,
            padding: '24px 28px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 18 }}>
              Registered Buyer Details
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
              
              {/* Section 1 Summary */}
              <div style={{ background: '#f9fafb', borderRadius: 10, padding: '16px', border: '1px solid #f3f4f6' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Building2 size={17} color="#15803d" />
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-800)' }}>1. Company & Contact</span>
                </div>
                <div style={{ display: 'grid', gap: 8, fontSize: 13 }}>
                  <div>
                    <span style={{ color: 'var(--gray-500)', fontSize: 11, fontWeight: 600, display: 'block' }}>ENTERPRISE NAME</span>
                    <strong style={{ color: 'var(--gray-900)' }}>{savedData.business_name}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--gray-500)', fontSize: 11, fontWeight: 600, display: 'block' }}>BUSINESS TYPE</span>
                    <span style={{ color: '#15803d', fontWeight: 600 }}>{savedData.buyer_type}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--gray-500)', fontSize: 11, fontWeight: 600, display: 'block' }}>CONTACT PERSON & PHONE</span>
                    <span>{savedData.full_name || 'N/A'} • {savedData.phone || 'N/A'}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--gray-500)', fontSize: 11, fontWeight: 600, display: 'block' }}>EMAIL</span>
                    <span style={{ color: 'var(--gray-700)' }}>{savedData.email || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Section 2 Summary */}
              <div style={{ background: '#f9fafb', borderRadius: 10, padding: '16px', border: '1px solid #f3f4f6' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Wheat size={17} color="#15803d" />
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-800)' }}>2. Biomass Specifications</span>
                </div>
                <div style={{ display: 'grid', gap: 8, fontSize: 13 }}>
                  <div>
                    <span style={{ color: 'var(--gray-500)', fontSize: 11, fontWeight: 600, display: 'block' }}>MATERIAL / RESIDUE</span>
                    <strong style={{ color: '#14532d' }}>{savedData.preferred_material}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--gray-500)', fontSize: 11, fontWeight: 600, display: 'block' }}>REQUIRED QUANTITY</span>
                    <strong style={{ color: 'var(--gray-900)' }}>{savedData.required_quantity_tonnes} tonnes</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--gray-500)', fontSize: 11, fontWeight: 600, display: 'block' }}>PURCHASE FREQUENCY</span>
                    <span>{savedData.purchase_frequency}</span>
                  </div>
                </div>
              </div>

              {/* Section 3 Summary */}
              <div style={{ background: '#f9fafb', borderRadius: 10, padding: '16px', border: '1px solid #f3f4f6' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <MapPin size={17} color="#15803d" />
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-800)' }}>3. Location & Budget</span>
                </div>
                <div style={{ display: 'grid', gap: 8, fontSize: 13 }}>
                  <div>
                    <span style={{ color: 'var(--gray-500)', fontSize: 11, fontWeight: 600, display: 'block' }}>PREFERRED LOCATION</span>
                    <span>{savedData.district}, {savedData.state}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--gray-500)', fontSize: 11, fontWeight: 600, display: 'block' }}>MAX SOURCING DISTANCE</span>
                    <span>{savedData.max_distance_km} km</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--gray-500)', fontSize: 11, fontWeight: 600, display: 'block' }}>EXPECTED PRICE / BUDGET</span>
                    <strong style={{ color: '#15803d' }}>₹{Number(savedData.budget_per_tonne || 0).toLocaleString('en-IN')}/tonne</strong>
                  </div>
                  {savedData.location_address && (
                    <div>
                      <span style={{ color: 'var(--gray-500)', fontSize: 11, fontWeight: 600, display: 'block' }}>DELIVERY POINT</span>
                      <span style={{ color: 'var(--gray-700)' }}>{savedData.location_address}</span>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FORM: 3 SECTIONS (Shown when registering new or when user clicks Edit)     */}
      {/* ========================================================================= */}
      {!loading && isFormOpen && (
        <form 
          onSubmit={handleSave}
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: 14,
            padding: '28px 30px',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          {/* Header row when editing existing registration */}
          {hasRegistered && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid #f3f4f6' }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-700)' }}>
                Editing Buyer Registration
              </span>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                style={{
                  padding: '6px 14px',
                  background: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--gray-700)',
                  cursor: 'pointer'
                }}
              >
                Cancel Edit
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* 1. Company & Contact Details                              */}
          {/* ========================================================= */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <Building2 size={20} color="#15803d" />
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-900)', margin: 0 }}>
                1. Company & Contact Details
              </h2>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
              gap: 16,
              marginBottom: 16
            }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 6 }}>
                  Buyer / Enterprise Name <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  name="businessName"
                  required
                  placeholder="e.g. Patel Bio-Pellet Mills"
                  value={formData.businessName}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: '1px solid #d1d5db',
                    fontSize: 13,
                    outline: 'none',
                    background: '#fff'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 6 }}>
                  Buyer / Business Type <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <select
                  name="buyerType"
                  value={formData.buyerType}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: '1px solid #d1d5db',
                    fontSize: 13,
                    outline: 'none',
                    background: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  {BUYER_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 6 }}>
                  Authorized Contact Person
                </label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="e.g. E2E Buyer Vikram Patel"
                  value={formData.fullName}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: '1px solid #d1d5db',
                    fontSize: 13,
                    outline: 'none',
                    background: '#fff'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 6 }}>
                  Contact Phone Number <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="e.g. 9876543211"
                  value={formData.phone}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: '1px solid #d1d5db',
                    fontSize: 13,
                    outline: 'none',
                    background: '#fff'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 6 }}>
                Official Email Address (Auto-filled)
              </label>
              <input
                type="email"
                name="email"
                disabled
                value={formData.email}
                style={{
                  width: '100%',
                  maxWidth: '320px',
                  padding: '9px 12px',
                  borderRadius: 8,
                  border: '1px solid #e5e7eb',
                  fontSize: 13,
                  background: '#f3f4f6',
                  color: 'var(--gray-600)',
                  cursor: 'not-allowed'
                }}
              />
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #f3f4f6', margin: '24px 0' }} />

          {/* ========================================================= */}
          {/* 2. Biomass & Quantity Specifications                      */}
          {/* ========================================================= */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <Wheat size={20} color="#15803d" />
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-900)', margin: 0 }}>
                2. Biomass & Quantity Specifications
              </h2>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
              gap: 16 
            }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 6 }}>
                  Material / Residue Type <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <select
                  name="preferredMaterial"
                  value={formData.preferredMaterial}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: '1px solid #d1d5db',
                    fontSize: 13,
                    outline: 'none',
                    background: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  {MATERIAL_TYPES.map(mat => (
                    <option key={mat} value={mat}>{mat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 6 }}>
                  Required Quantity (in Tonnes) <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="number"
                  name="requiredQuantityTonnes"
                  min="1"
                  step="0.5"
                  required
                  placeholder="e.g. 100"
                  value={formData.requiredQuantityTonnes}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: '1px solid #d1d5db',
                    fontSize: 13,
                    outline: 'none',
                    background: '#fff'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 6 }}>
                  Purchase Frequency <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <select
                  name="purchaseFrequency"
                  value={formData.purchaseFrequency}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: '1px solid #d1d5db',
                    fontSize: 13,
                    outline: 'none',
                    background: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  <option value="Regular / Seasonal">Regular / Seasonal</option>
                  <option value="One-time Sourcing">One-time Sourcing</option>
                  <option value="Monthly Contract">Monthly Contract</option>
                  <option value="Annual Supply Agreement">Annual Supply Agreement</option>
                </select>
              </div>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #f3f4f6', margin: '24px 0' }} />

          {/* ========================================================= */}
          {/* 3. Preferred Sourcing Location & Budget                   */}
          {/* ========================================================= */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <MapPin size={20} color="#15803d" />
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-900)', margin: 0 }}>
                3. Preferred Sourcing Location & Budget
              </h2>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
              gap: 16,
              marginBottom: 16
            }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 6 }}>
                  Preferred State <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: '1px solid #d1d5db',
                    fontSize: 13,
                    outline: 'none',
                    background: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  {STATES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 6 }}>
                  Preferred District <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <select
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: '1px solid #d1d5db',
                    fontSize: 13,
                    outline: 'none',
                    background: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  {(DISTRICTS_BY_STATE[formData.state] || []).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 6 }}>
                  Maximum Sourcing Distance (in km) <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                  <input
                    type="range"
                    name="maxDistanceKm"
                    min="10"
                    max="300"
                    step="10"
                    value={formData.maxDistanceKm}
                    onChange={handleChange}
                    style={{ flex: 1, accentColor: '#15803d', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#15803d', minWidth: 60, textAlign: 'right' }}>
                    {formData.maxDistanceKm} km
                  </span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 6 }}>
                  Expected Price / Budget (₹/tonne) <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="number"
                  name="budgetPerTonne"
                  min="500"
                  step="50"
                  required
                  placeholder="e.g. 2000"
                  value={formData.budgetPerTonne}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: '1px solid #d1d5db',
                    fontSize: 13,
                    outline: 'none',
                    background: '#fff'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 6 }}>
                Plant / Warehouse Address or Delivery Point
              </label>
              <input
                type="text"
                name="locationAddress"
                placeholder="e.g. Focal Point Industrial Area, Phase 5, Ludhiana"
                value={formData.locationAddress}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 8,
                  border: '1px solid #d1d5db',
                  fontSize: 13,
                  outline: 'none',
                  background: '#fff'
                }}
              />
            </div>
          </div>

          {/* ========================================================= */}
          {/* Submit Action: Save Registration Button                   */}
          {/* ========================================================= */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12, borderTop: '1px solid #f3f4f6', paddingTop: 20 }}>
            {hasRegistered && (
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                style={{
                  padding: '11px 20px',
                  background: '#ffffff',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--gray-700)',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '11px 26px',
                background: submitting ? '#9ca3af' : '#15803d',
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                color: '#ffffff',
                cursor: submitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 6px rgba(21, 128, 61, 0.25)',
                transition: 'background 0.15s ease'
              }}
              onMouseOver={e => { if (!submitting) e.currentTarget.style.background = '#166534'; }}
              onMouseOut={e => { if (!submitting) e.currentTarget.style.background = '#15803d'; }}
            >
              {submitting ? (
                <>
                  <RefreshCw size={16} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Saving Registration...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save Registration</span>
                </>
              )}
            </button>
          </div>

        </form>
      )}

    </div>
  );
}
