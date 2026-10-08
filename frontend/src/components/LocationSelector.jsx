import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Search, MapPin } from 'lucide-react';
import { apiFetch } from '../services/api';

export default function LocationSelector({
  selectedState,
  setSelectedState,
  selectedDistrict,
  setSelectedDistrict,
  selectedVillage,
  setSelectedVillage,
  showVillage = true
}) {
  const { t } = useLanguage();
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [villages, setVillages] = useState([]);

  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  const [stateSearch, setStateSearch] = useState('');
  const [districtSearch, setDistrictSearch] = useState('');
  
  const [isStateOpen, setIsStateOpen] = useState(false);
  const [isDistrictOpen, setIsDistrictOpen] = useState(false);

  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(t('location.unavailable') || 'Unable to determine your location. Please enter your village manually.');
      return;
    }
    setLoadingLocation(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const resp = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );
          const data = await resp.json();
          const village = data.address.village || data.address.town || data.address.city || data.address.county;
          if (village) {
            setSelectedVillage(village);
            setLocationError('');
          } else {
            setLocationError(t('location.unavailable') || 'Unable to determine your location. Please enter your village manually.');
          }
        } catch (e) {
          setLocationError(t('location.fetchError') || 'Error fetching location. Please try again or enter your village manually.');
        } finally {
          setLoadingLocation(false);
        }
      },
      (err) => {
        let msg = 'Unable to determine your location. Please enter your village manually.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location permission denied. Please enter your village manually.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Location request timed out. Please try again or enter your village manually.';
        }
        setLocationError(t('location.error') || msg);
        setLoadingLocation(false);
      },
      { timeout: 10000 }
    );
  };


  useEffect(() => {
    setLoadingStates(true);
    apiFetch('/api/locations/states')
      .then(data => setStates(data))
      .catch(console.error)
      .finally(() => setLoadingStates(false));
  }, []);

  useEffect(() => {
    if (selectedState?.id) {
      setLoadingDistricts(true);
      apiFetch(`/api/locations/districts?state_id=${selectedState.id}`)
        .then(data => setDistricts(data))
        .catch(console.error)
        .finally(() => setLoadingDistricts(false));
    } else {
      setDistricts([]);
    }
  }, [selectedState]);

  const handleStateSelect = (st) => {
    setSelectedState({ id: st.id, name: st.name });
    setSelectedDistrict(null);
    setSelectedVillage('');
    setIsStateOpen(false);
    setStateSearch('');
  };

  const handleDistrictSelect = (dst) => {
    setSelectedDistrict({ id: dst.id, name: dst.name });
    setSelectedVillage('');
    setIsDistrictOpen(false);
    setDistrictSearch('');
  };

  const filteredStates = states.filter(s => s.name.toLowerCase().includes(stateSearch.toLowerCase()));
  const priorityStates = filteredStates.filter(s => s.priority <= 3);
  const otherStates = filteredStates.filter(s => s.priority > 3);

  const filteredDistricts = districts.filter(d => d.name.toLowerCase().includes(districtSearch.toLowerCase()));
  const filteredVillages = villages.filter(v => v.name.toLowerCase().includes(villageSearch.toLowerCase()));

  // Fallback translation texts
  const tState = t('location.selectState') || 'Select your State ▼';
  const tDistrict = t('location.selectDistrict') || 'Select your District ▼';
  const tVillage = t('location.selectVillage') || 'Search and select your Village ▼';
  
  return (
    <div className="location-selector" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="form-grid-2">
        {/* State Selection */}
        <div className="form-group" style={{ position: 'relative' }}>
          <label className="form-label">{t('location.stateLabel') || 'State *'}</label>
          <button 
            type="button"
            onClick={() => setIsStateOpen(!isStateOpen)}
            className="form-input"
            style={{ textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', cursor: 'pointer' }}
          >
            {selectedState ? selectedState.name : (loadingStates ? 'Loading...' : <span style={{color: '#9ca3af'}}>{tState}</span>)}
          </button>
          {isStateOpen && (
            <div className="dropdown-menu border rounded shadow p-2" style={{ backgroundColor: '#ffffff', position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, maxHeight: '300px', overflowY: 'auto', border: '1px solid #e5e7eb', marginTop: '4px' }}>
              <div className="flex items-center mb-2 px-2 border-b" style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px', marginBottom: '8px' }}>
                <Search size={16} style={{ color: '#9ca3af' }} />
                <input 
                  autoFocus
                  type="text" 
                  placeholder={t('location.search') || "Search..."} 
                  value={stateSearch} 
                  onChange={e => setStateSearch(e.target.value)}
                  style={{ width: '100%', padding: '8px', outline: 'none', border: 'none' }}
                />
              </div>
              
              {priorityStates.length > 0 && (
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase', padding: '4px 8px', backgroundColor: '#f9fafb' }}>Frequently Selected</div>
                  {priorityStates.map(st => (
                    <div key={st.id} onClick={() => handleStateSelect(st)} style={{ padding: '8px', cursor: 'pointer', borderRadius: '4px' }} className="dropdown-item hover-bg-green">
                      {st.name}
                    </div>
                  ))}
                </div>
              )}
              
              {otherStates.length > 0 && (
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase', padding: '4px 8px', backgroundColor: '#f9fafb' }}>All States & Union Territories</div>
                  {otherStates.map(st => (
                    <div key={st.id} onClick={() => handleStateSelect(st)} style={{ padding: '8px', cursor: 'pointer', borderRadius: '4px' }} className="dropdown-item hover-bg-green">
                      {st.name}
                    </div>
                  ))}
                </div>
              )}
              {filteredStates.length === 0 && <div style={{ padding: '8px', color: '#6b7280', fontSize: '14px' }}>No states found.</div>}
            </div>
          )}
        </div>

        {/* District Selection */}
        <div className="form-group" style={{ position: 'relative' }}>
          <label className="form-label">{t('location.districtLabel') || 'District *'}</label>
          <button 
            type="button"
            disabled={!selectedState}
            onClick={() => setIsDistrictOpen(!isDistrictOpen)}
            className={`form-input`}
            style={{ textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: !selectedState ? '#f3f4f6' : '#fff', cursor: !selectedState ? 'not-allowed' : 'pointer', opacity: !selectedState ? 0.6 : 1 }}
          >
            {selectedDistrict ? selectedDistrict.name : (loadingDistricts ? 'Loading...' : <span style={{color: '#9ca3af'}}>{tDistrict}</span>)}
          </button>
          {isDistrictOpen && (
            <div className="dropdown-menu border rounded shadow p-2" style={{ backgroundColor: '#ffffff', position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, maxHeight: '300px', overflowY: 'auto', border: '1px solid #e5e7eb', marginTop: '4px' }}>
              <div className="flex items-center mb-2 px-2 border-b" style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px', marginBottom: '8px' }}>
                <Search size={16} style={{ color: '#9ca3af' }} />
                <input 
                  autoFocus
                  type="text" 
                  placeholder={t('location.search') || "Search..."} 
                  value={districtSearch} 
                  onChange={e => setDistrictSearch(e.target.value)}
                  style={{ width: '100%', padding: '8px', outline: 'none', border: 'none' }}
                />
              </div>
              {filteredDistricts.map(dst => (
                <div key={dst.id} onClick={() => handleDistrictSelect(dst)} style={{ padding: '8px', cursor: 'pointer', borderRadius: '4px' }} className="dropdown-item hover-bg-green">
                  {dst.name}
                </div>
              ))}
              {filteredDistricts.length === 0 && <div style={{ padding: '8px', color: '#6b7280', fontSize: '14px' }}>No districts found.</div>}
            </div>
          )}
        </div>
      </div>

      {/* Village Input */}
      {showVillage && (
        <div className="form-group">
          <label className="form-label">{t('location.villageLabel') || 'Village *'}</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              className="form-input"
              disabled={!selectedDistrict}
              placeholder={
                !selectedDistrict 
                  ? (t('location.selectDistrictFirst') || 'Select District first...') 
                  : (t('location.enterVillage') || 'Enter your village name (e.g. Rampur)')
              }
              value={selectedVillage || ''}
              onChange={(e) => setSelectedVillage(e.target.value)}
              style={{
                flex: 1,
                backgroundColor: !selectedDistrict ? '#f3f4f6' : '#fff',
                cursor: !selectedDistrict ? 'not-allowed' : 'text',
                opacity: !selectedDistrict ? 0.7 : 1
              }}
            />
            <button
              type="button"
              onClick={handleUseLocation}
              disabled={!selectedDistrict || loadingLocation}
              className="btn btn-secondary"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                padding: '0 15px',
                whiteSpace: 'nowrap',
                backgroundColor: (!selectedDistrict || loadingLocation) ? '#e5e7eb' : '#f0fdf4',
                color: (!selectedDistrict || loadingLocation) ? '#9ca3af' : '#166534',
                border: `1px solid ${(!selectedDistrict || loadingLocation) ? '#d1d5db' : '#bbf7d0'}`,
                borderRadius: '8px',
                cursor: (!selectedDistrict || loadingLocation) ? 'not-allowed' : 'pointer'
              }}
            >
              <MapPin size={16} />
              {loadingLocation ? (t('location.loading') || 'Loading...') : (t('location.useMyLocation') || 'Use My Location / ਮੇਰੀ ਲੋਕੇਸ਼ਨ ਵਰਤੋ')}
            </button>
          </div>
          {locationError && (
            <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '5px' }}>
              {locationError}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
