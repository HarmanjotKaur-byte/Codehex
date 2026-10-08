import { useState, useEffect, useMemo } from 'react';
import { 
  Handshake, MapPin, Calendar, Clock, CheckCircle, CheckCircle2, 
  XCircle, AlertCircle, Phone, Mail, MessageCircle, Eye, X, 
  Search, ArrowUpDown, Copy, Check, ExternalLink, Wheat, 
  RefreshCw, TrendingUp, Coins, ShieldCheck, ChevronRight
} from 'lucide-react';
import { getMyInterests, updateInterestStatus, expressInterest } from '../../services/api.js';

// Status styling & configuration mapping
function getStatusInfo(status) {
  const s = (status || '').toUpperCase();
  if (s === 'ACCEPTED' || s === 'CONFIRMED') {
    return {
      key: 'CONFIRMED',
      label: 'Confirmed',
      bg: '#dcfce7',
      color: '#15803d',
      border: '#86efac',
      icon: <CheckCircle size={14} />,
      desc: 'Deal agreed upon. Coordinate logistics and delivery schedule with the farmer.',
    };
  }
  if (s === 'COMPLETED') {
    return {
      key: 'COMPLETED',
      label: 'Completed',
      bg: '#dbeafe',
      color: '#1d4ed8',
      border: '#93c5fd',
      icon: <CheckCircle2 size={14} />,
      desc: 'Transaction fulfilled. Stubble successfully lifted and payment settled.',
    };
  }
  if (s === 'CANCELLED' || s === 'REJECTED') {
    return {
      key: 'CANCELLED',
      label: 'Cancelled',
      bg: '#fee2e2',
      color: '#b91c1c',
      border: '#fca5a5',
      icon: <XCircle size={14} />,
      desc: 'Deal was closed or declined.',
    };
  }
  // Default: Pending / Interested
  return {
    key: 'PENDING',
    label: 'Pending',
    bg: '#fef9c3',
    color: '#a16207',
    border: '#fde047',
    icon: <Clock size={14} />,
    desc: 'Interest registered. Awaiting farmer response or price finalization.',
  };
}

// Format numbers in Indian Rupee format
function formatINR(val) {
  if (val === null || val === undefined || isNaN(val)) return '₹0';
  return '₹' + Number(val).toLocaleString('en-IN');
}

export default function MyDeals() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  
  // Filtering & Sorting states
  const [activeTab, setActiveTab] = useState('ALL'); // ALL | CONFIRMED | PENDING | COMPLETED | CANCELLED
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // newest | oldest | quantity_desc | value_desc

  // Modal states
  const [selectedDealForDetails, setSelectedDealForDetails] = useState(null);
  const [selectedDealForContact, setSelectedDealForContact] = useState(null);
  
  // Quick status update state
  const [updatingId, setUpdatingId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const fetchDeals = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const data = await getMyInterests();
      setDeals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load deals:', err);
      setError(err.message || 'Could not fetch your deals. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  // Handle status update (e.g. buyer marks Completed or Cancelled)
  const handleStatusChange = async (dealId, newStatus) => {
    setUpdatingId(dealId);
    try {
      const updated = await updateInterestStatus(dealId, newStatus);
      setDeals(prev => prev.map(d => d.id === dealId ? { ...d, status: updated.status } : d));
      showToast(`Deal #${dealId} updated to ${newStatus}`);
      if (selectedDealForDetails && selectedDealForDetails.id === dealId) {
        setSelectedDealForDetails(prev => ({ ...prev, status: updated.status }));
      }
    } catch (err) {
      showToast(`Failed to update status: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  // Compute counts for tabs
  const tabCounts = useMemo(() => {
    const counts = { ALL: deals.length, CONFIRMED: 0, PENDING: 0, COMPLETED: 0, CANCELLED: 0 };
    deals.forEach(d => {
      const info = getStatusInfo(d.status);
      if (counts[info.key] !== undefined) {
        counts[info.key]++;
      }
    });
    return counts;
  }, [deals]);

  // Aggregate KPI stats
  const kpiStats = useMemo(() => {
    let totalTonnes = 0;
    let totalVal = 0;
    deals.forEach(d => {
      const qty = Number(d.quantity_tonnes || 0);
      const price = Number(d.asking_price || 0);
      totalTonnes += qty;
      totalVal += (qty * price);
    });
    return {
      totalDeals: deals.length,
      confirmed: tabCounts.CONFIRMED,
      pending: tabCounts.PENDING,
      completed: tabCounts.COMPLETED,
      totalTonnes: totalTonnes.toFixed(1),
      totalValue: totalVal
    };
  }, [deals, tabCounts]);

  // Filter & sort deals
  const filteredDeals = useMemo(() => {
    return deals
      .filter(deal => {
        const info = getStatusInfo(deal.status);
        if (activeTab !== 'ALL' && info.key !== activeTab) {
          return false;
        }

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchFarmer = (deal.farmer_name || '').toLowerCase().includes(q);
          const matchCrop = (deal.crop || '').toLowerCase().includes(q);
          const matchResidue = (deal.residue_type || '').toLowerCase().includes(q);
          const matchDistrict = (deal.district || '').toLowerCase().includes(q);
          const matchState = (deal.state || '').toLowerCase().includes(q);
          const matchVillage = (deal.village || '').toLowerCase().includes(q);
          const matchId = String(deal.id).includes(q) || String(deal.listing_id).includes(q);
          if (!matchFarmer && !matchCrop && !matchResidue && !matchDistrict && !matchState && !matchVillage && !matchId) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        if (sortBy === 'oldest') return new Date(a.created_at || 0) - new Date(b.created_at || 0);
        if (sortBy === 'quantity_desc') return (b.quantity_tonnes || 0) - (a.quantity_tonnes || 0);
        if (sortBy === 'value_desc') {
          const valA = (a.quantity_tonnes || 0) * (a.asking_price || 0);
          const valB = (b.quantity_tonnes || 0) * (b.asking_price || 0);
          return valB - valA;
        }
        return 0;
      });
  }, [deals, activeTab, searchQuery, sortBy]);

  return (
    <div style={{ padding: '24px 20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'var(--font-sans)' }}>
      
      {/* Toast Alert */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: '#1f2937',
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
          <CheckCircle size={18} color="#4ade80" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ 
              background: '#e0f2fe', 
              color: '#0284c7', 
              padding: 8, 
              borderRadius: 10, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Handshake size={24} />
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--gray-900)', margin: 0 }}>
              My Deals
            </h1>
          </div>
          <p style={{ color: 'var(--gray-600)', margin: 0, fontSize: 14 }}>
            Track, review, and contact farmers for all your confirmed and negotiated biomass transactions.
          </p>
        </div>

        <button
          onClick={() => fetchDeals(true)}
          disabled={refreshing || loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 16px',
            background: '#ffffff',
            border: '1px solid var(--gray-200)',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--gray-700)',
            cursor: refreshing ? 'not-allowed' : 'pointer',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.15s ease'
          }}
          onMouseOver={e => e.currentTarget.style.background = '#f9fafb'}
          onMouseOut={e => e.currentTarget.style.background = '#ffffff'}
        >
          <RefreshCw size={15} className={refreshing ? 'spin' : ''} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh Deals'}</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', 
        gap: 14, 
        marginBottom: 24 
      }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 16px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Total Deals</span>
            <Handshake size={16} color="#6b7280" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--gray-900)' }}>{kpiStats.totalDeals}</div>
          <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>All agreements & inquiries</div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #bbf7d0', borderRadius: 12, padding: '14px 16px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#16a34a', textTransform: 'uppercase' }}>Confirmed</span>
            <CheckCircle size={16} color="#16a34a" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#15803d' }}>{kpiStats.confirmed}</div>
          <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>Ready for pickup / delivery</div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #fde047', borderRadius: 12, padding: '14px 16px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#ca8a04', textTransform: 'uppercase' }}>Pending</span>
            <Clock size={16} color="#ca8a04" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#a16207' }}>{kpiStats.pending}</div>
          <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>Under farmer review</div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #bfdbfe', borderRadius: 12, padding: '14px 16px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#2563eb', textTransform: 'uppercase' }}>Biomass Volume</span>
            <Wheat size={16} color="#2563eb" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#1d4ed8' }}>{kpiStats.totalTonnes} <span style={{ fontSize: 14, fontWeight: 500 }}>tonnes</span></div>
          <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>Total committed quantity</div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 16px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Total Value</span>
            <Coins size={16} color="#6b7280" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--gray-900)' }}>{formatINR(kpiStats.totalValue)}</div>
          <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>Estimated transaction value</div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div style={{ 
        background: '#fff', 
        border: '1px solid var(--gray-200)', 
        borderRadius: 14, 
        padding: '16px 18px', 
        marginBottom: 20,
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { key: 'ALL', label: 'All Deals' },
              { key: 'CONFIRMED', label: 'Confirmed' },
              { key: 'PENDING', label: 'Pending' },
              { key: 'COMPLETED', label: 'Completed' },
              { key: 'CANCELLED', label: 'Cancelled' },
            ].map(tab => {
              const isActive = activeTab === tab.key;
              const count = tabCounts[tab.key] || 0;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: isActive ? '#15803d' : '#f3f4f6',
                    color: isActive ? '#ffffff' : '#4b5563',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>{tab.label}</span>
                  <span style={{
                    fontSize: 11,
                    padding: '1px 6px',
                    borderRadius: 12,
                    background: isActive ? 'rgba(255,255,255,0.25)' : '#e5e7eb',
                    color: isActive ? '#ffffff' : '#374151',
                    fontWeight: 700
                  }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Sort Controls */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end', minWidth: 280 }}>
            {/* Search Input */}
            <div style={{ position: 'relative', flex: '1', maxWidth: 280 }}>
              <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
              <input
                type="text"
                placeholder="Search farmer, crop, district..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 32px',
                  borderRadius: 8,
                  border: '1px solid var(--gray-200)',
                  fontSize: 13,
                  outline: 'none',
                  background: '#f9fafb'
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--gray-400)',
                    padding: 2
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ArrowUpDown size={14} color="#6b7280" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--gray-200)',
                  fontSize: 13,
                  color: 'var(--gray-700)',
                  background: '#fff',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="quantity_desc">Highest Quantity</option>
                <option value="value_desc">Highest Value</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🤝</div>
          <div style={{ color: 'var(--gray-600)', fontSize: 15, fontWeight: 500 }}>Loading your deals...</div>
        </div>
      )}

      {/* Error Alert */}
      {error && !loading && (
        <div style={{ 
          background: '#fef2f2', 
          border: '1px solid #fecaca', 
          borderRadius: 12, 
          padding: '16px 20px', 
          color: '#dc2626',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
          <button 
            onClick={() => fetchDeals()}
            style={{ 
              background: '#dc2626', 
              color: '#fff', 
              border: 'none', 
              borderRadius: 6, 
              padding: '6px 12px', 
              fontSize: 12, 
              fontWeight: 600, 
              cursor: 'pointer' 
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredDeals.length === 0 && (
        <div style={{ 
          background: '#fff', 
          border: '1px dashed #d1d5db', 
          borderRadius: 16, 
          padding: '56px 24px', 
          textAlign: 'center' 
        }}>
          <div style={{ fontSize: 48, marginBottom: 14 }}>📋</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--gray-800)', marginBottom: 8 }}>
            No deals found
          </h3>
          <p style={{ color: 'var(--gray-500)', fontSize: 14, maxWidth: 440, margin: '0 auto 20px auto' }}>
            {searchQuery || activeTab !== 'ALL'
              ? 'No deals match your current filter or search criteria. Try selecting another tab or clearing search.'
              : 'You have not registered interest or entered into any stubble deals yet. Discover active farmers to get started!'}
          </p>
          {(searchQuery || activeTab !== 'ALL') ? (
            <button
              onClick={() => { setActiveTab('ALL'); setSearchQuery(''); }}
              style={{
                background: '#15803d',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '9px 18px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Clear Filters
            </button>
          ) : (
            <p style={{ fontSize: 13, color: '#16a34a', fontWeight: 600 }}>
              Go to "Browse All Listings" or "Nearby Listings" to contact farmers.
            </p>
          )}
        </div>
      )}

      {/* Deals Cards List */}
      {!loading && !error && filteredDeals.length > 0 && (
        <div style={{ display: 'grid', gap: 16 }}>
          {filteredDeals.map(deal => {
            const statusInfo = getStatusInfo(deal.status);
            const qty = Number(deal.quantity_tonnes || 0);
            const price = Number(deal.asking_price || 0);
            const totalVal = qty * price;
            const dealDate = deal.created_at 
              ? new Date(deal.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
              : 'N/A';
            const cropName = deal.crop || 'Paddy Straw';
            const residueName = deal.residue_type || 'Baled Straw';
            const farmerName = deal.farmer_name || 'Farmer';
            const farmerPhone = deal.farmer_phone || null;
            const farmerEmail = deal.farmer_email || null;
            const locationStr = [deal.village, deal.district, deal.state].filter(Boolean).join(', ') || 'Punjab';

            return (
              <div
                key={deal.id}
                style={{
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: 14,
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
                  position: 'relative'
                }}
                onMouseOver={e => e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.07)'}
                onMouseOut={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
              >
                {/* Top strip colored by status */}
                <div style={{ height: 4, background: statusInfo.color }} />

                <div style={{ padding: '20px 22px' }}>
                  {/* Card Header: Deal ID, Date, Status */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start', 
                    marginBottom: 16, 
                    flexWrap: 'wrap', 
                    gap: 12 
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <span style={{ 
                        background: '#f3f4f6', 
                        color: 'var(--gray-800)', 
                        padding: '4px 10px', 
                        borderRadius: 6, 
                        fontSize: 13, 
                        fontWeight: 700, 
                        letterSpacing: 0.5 
                      }}>
                        DEAL #{deal.id}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>•</span>
                      <span style={{ fontSize: 13, color: 'var(--gray-600)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={13} color="#6b7280" />
                        Deal Date: <strong>{dealDate}</strong>
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>•</span>
                      <span style={{ fontSize: 13, color: 'var(--gray-600)' }}>
                        Listing #{deal.listing_id}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      background: statusInfo.bg,
                      color: statusInfo.color,
                      border: `1px solid ${statusInfo.border}`,
                      padding: '4px 12px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: 0.3
                    }}>
                      {statusInfo.icon}
                      <span>{statusInfo.label}</span>
                    </div>
                  </div>

                  {/* Main Content: 2-column on desktop (Farmer & Logistics left, Metrics right) */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                    gap: 18, 
                    marginBottom: 16 
                  }}>
                    {/* Farmer Profile & Contact Info */}
                    <div style={{ background: '#f9fafb', borderRadius: 10, padding: '14px 16px', border: '1px solid #f3f4f6' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 }}>
                        Farmer Information
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                        <div style={{ 
                          width: 38, 
                          height: 38, 
                          borderRadius: '50%', 
                          background: '#dcfce7', 
                          color: '#15803d', 
                          fontWeight: 700, 
                          fontSize: 15, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {farmerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-900)' }}>
                            {farmerName}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <MapPin size={12} color="#16a34a" />
                            {locationStr}
                          </div>
                        </div>
                      </div>

                      {/* Contact Badges */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                        {farmerPhone ? (
                          <a
                            href={`tel:${farmerPhone}`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              background: '#ffffff',
                              border: '1px solid #d1d5db',
                              borderRadius: 6,
                              padding: '5px 10px',
                              fontSize: 12,
                              color: '#15803d',
                              fontWeight: 600,
                              textDecoration: 'none'
                            }}
                            title="Click to call farmer"
                          >
                            <Phone size={13} color="#15803d" />
                            <span>{farmerPhone}</span>
                          </a>
                        ) : (
                          <span style={{ fontSize: 12, color: 'var(--gray-400)', fontStyle: 'italic' }}>
                            Phone not listed
                          </span>
                        )}

                        {farmerEmail && (
                          <a
                            href={`mailto:${farmerEmail}`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              background: '#ffffff',
                              border: '1px solid #d1d5db',
                              borderRadius: 6,
                              padding: '5px 10px',
                              fontSize: 12,
                              color: 'var(--gray-700)',
                              fontWeight: 500,
                              textDecoration: 'none'
                            }}
                            title="Send email to farmer"
                          >
                            <Mail size={13} color="#6b7280" />
                            <span>{farmerEmail}</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Deal Specifications (Residue, Quantity, Rate, Total) */}
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(2, 1fr)', 
                      gap: 10 
                    }}>
                      <div style={{ background: '#f0fdf4', borderRadius: 10, padding: '12px 14px', border: '1px solid #dcfce7' }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#16a34a', textTransform: 'uppercase' }}>CROP & RESIDUE</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#14532d', marginTop: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Wheat size={15} color="#16a34a" />
                          <span>{cropName}</span>
                        </div>
                        <div style={{ fontSize: 11, color: '#15803d', marginTop: 1 }}>{residueName}</div>
                      </div>

                      <div style={{ background: '#f9fafb', borderRadius: 10, padding: '12px 14px', border: '1px solid #f3f4f6' }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase' }}>QUANTITY</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-900)', marginTop: 2 }}>
                          {qty} <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--gray-500)' }}>tonnes</span>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 1 }}>Total biomass volume</div>
                      </div>

                      <div style={{ background: '#f9fafb', borderRadius: 10, padding: '12px 14px', border: '1px solid #f3f4f6' }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase' }}>AGREED RATE</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#15803d', marginTop: 2 }}>
                          {formatINR(price)}<span style={{ fontSize: 12, fontWeight: 500, color: 'var(--gray-500)' }}>/t</span>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 1 }}>Asking price / tonne</div>
                      </div>

                      <div style={{ background: '#fefce8', borderRadius: 10, padding: '12px 14px', border: '1px solid #fef08a' }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#854d0e', textTransform: 'uppercase' }}>TOTAL VALUATION</div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: '#713f12', marginTop: 2 }}>
                          {formatINR(totalVal)}
                        </div>
                        <div style={{ fontSize: 11, color: '#854d0e', marginTop: 1 }}>Estimated deal value</div>
                      </div>
                    </div>
                  </div>

                  {/* Buyer Message / Notes snippet */}
                  {deal.message && (
                    <div style={{ 
                      background: '#eff6ff', 
                      borderRadius: 8, 
                      padding: '10px 14px', 
                      marginBottom: 16,
                      borderLeft: '3px solid #3b82f6',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 8
                    }}>
                      <MessageCircle size={15} color="#2563eb" style={{ flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#1e40af', textTransform: 'uppercase', marginBottom: 2 }}>
                          Initial Negotiation Note / Terms
                        </div>
                        <div style={{ fontSize: 13, color: '#1e3a8a', fontStyle: 'italic' }}>
                          "{deal.message}"
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Bar */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    paddingTop: 14, 
                    borderTop: '1px solid #f3f4f6', 
                    flexWrap: 'wrap', 
                    gap: 12 
                  }}>
                    {/* Status hint text */}
                    <div style={{ fontSize: 12, color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <ShieldCheck size={14} color="#16a34a" />
                      <span>{statusInfo.desc}</span>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      {/* Secondary Action: View Deal Details */}
                      <button
                        onClick={() => setSelectedDealForDetails(deal)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '8px 14px',
                          background: '#ffffff',
                          border: '1px solid #d1d5db',
                          borderRadius: 8,
                          fontSize: 13,
                          fontWeight: 600,
                          color: 'var(--gray-700)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseOver={e => e.currentTarget.style.background = '#f9fafb'}
                        onMouseOut={e => e.currentTarget.style.background = '#ffffff'}
                      >
                        <Eye size={15} color="#4b5563" />
                        <span>View Details</span>
                      </button>

                      {/* Primary Action: Contact Farmer */}
                      <button
                        onClick={() => setSelectedDealForContact(deal)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '8px 16px',
                          background: '#15803d',
                          border: 'none',
                          borderRadius: 8,
                          fontSize: 13,
                          fontWeight: 600,
                          color: '#ffffff',
                          cursor: 'pointer',
                          boxShadow: '0 2px 6px rgba(21, 128, 61, 0.25)',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseOver={e => e.currentTarget.style.background = '#166534'}
                        onMouseOut={e => e.currentTarget.style.background = '#15803d'}
                      >
                        <Phone size={14} />
                        <span>Contact Farmer</span>
                      </button>

                      {/* Quick Status Management Dropdown/Buttons if applicable */}
                      {statusInfo.key === 'CONFIRMED' && (
                        <button
                          disabled={updatingId === deal.id}
                          onClick={() => handleStatusChange(deal.id, 'COMPLETED')}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '8px 12px',
                            background: '#dbeafe',
                            border: '1px solid #bfdbfe',
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 600,
                            color: '#1d4ed8',
                            cursor: updatingId === deal.id ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <CheckCircle2 size={13} />
                          <span>Mark Completed</span>
                        </button>
                      )}

                      {statusInfo.key === 'PENDING' && (
                        <button
                          disabled={updatingId === deal.id}
                          onClick={() => {
                            if (window.confirm('Are you sure you want to cancel this deal interest?')) {
                              handleStatusChange(deal.id, 'CANCELLED');
                            }
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '8px 12px',
                            background: '#fee2e2',
                            border: '1px solid #fecaca',
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 600,
                            color: '#b91c1c',
                            cursor: updatingId === deal.id ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <XCircle size={13} />
                          <span>Cancel Deal</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW DEAL DETAILS MODAL */}
      {selectedDealForDetails && (
        <DealDetailsModal
          deal={selectedDealForDetails}
          onClose={() => setSelectedDealForDetails(null)}
          onContactFarmer={() => {
            const d = selectedDealForDetails;
            setSelectedDealForDetails(null);
            setSelectedDealForContact(d);
          }}
          onStatusChange={handleStatusChange}
          updatingId={updatingId}
        />
      )}

      {/* CONTACT FARMER MODAL */}
      {selectedDealForContact && (
        <ContactFarmerModal
          deal={selectedDealForContact}
          onClose={() => setSelectedDealForContact(null)}
          onSuccess={(msg) => showToast(msg)}
        />
      )}
    </div>
  );
}

// -------------------------------------------------------------
// DETAIL MODAL COMPONENT
// -------------------------------------------------------------
function DealDetailsModal({ deal, onClose, onContactFarmer, onStatusChange, updatingId }) {
  const [copied, setCopied] = useState(false);
  const statusInfo = getStatusInfo(deal.status);
  const qty = Number(deal.quantity_tonnes || 0);
  const price = Number(deal.asking_price || 0);
  const totalVal = qty * price;
  const dealDate = deal.created_at 
    ? new Date(deal.created_at).toLocaleString('en-IN', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'N/A';

  const copyDealSummary = () => {
    const summary = `Deal #${deal.id} Summary:
Farmer: ${deal.farmer_name || 'N/A'} (Phone: ${deal.farmer_phone || 'N/A'}, Email: ${deal.farmer_email || 'N/A'})
Crop: ${deal.crop || 'Paddy Straw'} (${deal.residue_type || 'Baled Straw'})
Quantity: ${qty} Tonnes @ ₹${price}/tonne
Total Value: ${formatINR(totalVal)}
Location: ${[deal.village, deal.district, deal.state].filter(Boolean).join(', ')}
Status: ${statusInfo.label}
Date: ${dealDate}`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: 20,
        backdropFilter: 'blur(3px)'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 16,
          maxWidth: 620,
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          position: 'relative'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 18,
            right: 18,
            background: '#f3f4f6',
            border: 'none',
            borderRadius: '50%',
            width: 34,
            height: 34,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--gray-600)',
            transition: 'background 0.15s ease'
          }}
          onMouseOver={e => e.currentTarget.style.background = '#e5e7eb'}
          onMouseOut={e => e.currentTarget.style.background = '#f3f4f6'}
          title="Close"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ padding: '24px 28px 18px 28px', borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ 
              background: '#f0fdf4', 
              color: '#15803d', 
              padding: '3px 10px', 
              borderRadius: 6, 
              fontSize: 12, 
              fontWeight: 700 
            }}>
              DEAL #{deal.id}
            </span>
            <span style={{ fontSize: 13, color: 'var(--gray-500)' }}>
              Listing Ref: #{deal.listing_id}
            </span>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--gray-900)', margin: '0 0 4px 0' }}>
            Biomass Deal Specifications
          </h2>
          <div style={{ fontSize: 13, color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Calendar size={13} />
            <span>Initiated on: {dealDate}</span>
          </div>
        </div>

        {/* Status Alert Banner */}
        <div style={{ 
          background: statusInfo.bg, 
          padding: '14px 28px', 
          borderBottom: `1px solid ${statusInfo.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ color: statusInfo.color }}>{statusInfo.icon}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: statusInfo.color, textTransform: 'uppercase' }}>
                Status: {statusInfo.label}
              </div>
              <div style={{ fontSize: 12, color: statusInfo.color }}>
                {statusInfo.desc}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px 28px' }}>
          
          {/* Section: Farmer Profile */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', marginBottom: 10 }}>
              Farmer Profile & Contact
            </div>
            <div style={{ background: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: 12, padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ 
                  width: 44, 
                  height: 44, 
                  borderRadius: '50%', 
                  background: '#dcfce7', 
                  color: '#15803d', 
                  fontWeight: 700, 
                  fontSize: 18, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  {(deal.farmer_name || 'F').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-900)' }}>
                    {deal.farmer_name || 'Farmer'}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--gray-600)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={13} color="#16a34a" />
                    {[deal.village, deal.district, deal.state].filter(Boolean).join(', ') || 'Punjab'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginTop: 10 }}>
                <div style={{ background: '#fff', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: 11, color: 'var(--gray-500)', fontWeight: 600 }}>PHONE NUMBER</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#15803d', marginTop: 2 }}>
                    {deal.farmer_phone ? (
                      <a href={`tel:${deal.farmer_phone}`} style={{ color: '#15803d', textDecoration: 'none' }}>
                        {deal.farmer_phone}
                      </a>
                    ) : 'Not provided'}
                  </div>
                </div>

                <div style={{ background: '#fff', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: 11, color: 'var(--gray-500)', fontWeight: 600 }}>EMAIL ADDRESS</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-700)', marginTop: 2 }}>
                    {deal.farmer_email ? (
                      <a href={`mailto:${deal.farmer_email}`} style={{ color: 'var(--gray-700)', textDecoration: 'none' }}>
                        {deal.farmer_email}
                      </a>
                    ) : 'Not provided'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Biomass & Financial Metrics */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', marginBottom: 10 }}>
              Transaction & Material Details
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              <div style={{ background: '#f9fafb', padding: '12px 14px', borderRadius: 10, border: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: 11, color: 'var(--gray-500)', fontWeight: 600 }}>CROP / RESIDUE TYPE</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-900)', marginTop: 2 }}>
                  {deal.crop || 'Paddy Straw'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{deal.residue_type || 'Baled'}</div>
              </div>

              <div style={{ background: '#f9fafb', padding: '12px 14px', borderRadius: 10, border: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: 11, color: 'var(--gray-500)', fontWeight: 600 }}>AGREED QUANTITY</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-900)', marginTop: 2 }}>
                  {qty} tonnes
                </div>
                <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>Net stubble tonnage</div>
              </div>

              <div style={{ background: '#f9fafb', padding: '12px 14px', borderRadius: 10, border: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: 11, color: 'var(--gray-500)', fontWeight: 600 }}>RATE PER TONNE</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#15803d', marginTop: 2 }}>
                  {formatINR(price)}
                </div>
                <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>Agreed purchase price</div>
              </div>

              <div style={{ background: '#fefce8', padding: '12px 14px', borderRadius: 10, border: '1px solid #fef08a' }}>
                <div style={{ fontSize: 11, color: '#854d0e', fontWeight: 600 }}>TOTAL VALUE</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#713f12', marginTop: 2 }}>
                  {formatINR(totalVal)}
                </div>
                <div style={{ fontSize: 12, color: '#854d0e' }}>Total agreed settlement</div>
              </div>
            </div>
          </div>

          {/* Section: Buyer Note / Message */}
          {deal.message && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', marginBottom: 8 }}>
                Buyer Negotiation Message
              </div>
              <div style={{ background: '#f0fdf4', padding: '12px 16px', borderRadius: 10, borderLeft: '4px solid #16a34a', fontSize: 13, color: '#166534', fontStyle: 'italic' }}>
                "{deal.message}"
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div style={{ 
          padding: '16px 28px', 
          background: '#f9fafb', 
          borderTop: '1px solid #f3f4f6', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12
        }}>
          <button
            onClick={copyDealSummary}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              background: '#fff',
              border: '1px solid #d1d5db',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--gray-700)',
              cursor: 'pointer'
            }}
          >
            {copied ? <Check size={14} color="#15803d" /> : <Copy size={14} />}
            <span>{copied ? 'Copied Summary!' : 'Copy Summary'}</span>
          </button>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px',
                background: '#fff',
                border: '1px solid #d1d5db',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--gray-700)',
                cursor: 'pointer'
              }}
            >
              Close
            </button>

            <button
              onClick={onContactFarmer}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 18px',
                background: '#15803d',
                border: 'none',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                color: '#fff',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(21, 128, 61, 0.25)'
              }}
            >
              <Phone size={14} />
              <span>Contact Farmer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// CONTACT FARMER MODAL COMPONENT
// -------------------------------------------------------------
function ContactFarmerModal({ deal, onClose, onSuccess }) {
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [customMsg, setCustomMsg] = useState('');
  const [sending, setSending] = useState(false);

  const farmerName = deal.farmer_name || 'Farmer';
  const farmerPhone = deal.farmer_phone || null;
  const farmerEmail = deal.farmer_email || null;

  const copyPhone = () => {
    if (!farmerPhone) return;
    navigator.clipboard.writeText(farmerPhone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2500);
  };

  const copyEmail = () => {
    if (!farmerEmail) return;
    navigator.clipboard.writeText(farmerEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!customMsg.trim()) return;

    setSending(true);
    try {
      await expressInterest({
        listing_id: deal.listing_id,
        message: customMsg.trim()
      });
      onSuccess(`Message sent to ${farmerName}!`);
      onClose();
    } catch (err) {
      alert(`Could not send message: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: 20,
        backdropFilter: 'blur(3px)'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 16,
          maxWidth: 540,
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          position: 'relative'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 18,
            right: 18,
            background: '#f3f4f6',
            border: 'none',
            borderRadius: '50%',
            width: 34,
            height: 34,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--gray-600)',
            transition: 'background 0.15s ease'
          }}
          onMouseOver={e => e.currentTarget.style.background = '#e5e7eb'}
          onMouseOut={e => e.currentTarget.style.background = '#f3f4f6'}
          title="Close"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ padding: '24px 28px 18px 28px', borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ 
              background: '#dcfce7', 
              color: '#15803d', 
              padding: 8, 
              borderRadius: 10, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Phone size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: 19, fontWeight: 700, color: 'var(--gray-900)', margin: 0 }}>
                Contact Farmer
              </h2>
              <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>
                Directly communicate regarding Deal #{deal.id}
              </div>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div style={{ padding: '22px 28px' }}>
          {/* Farmer Contact Card */}
          <div style={{ 
            background: '#f9fafb', 
            borderRadius: 12, 
            padding: '16px', 
            border: '1px solid #e5e7eb',
            marginBottom: 20
          }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 4 }}>
              {farmerName}
            </div>
            <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 14 }}>
              Location: {[deal.village, deal.district, deal.state].filter(Boolean).join(', ') || 'Punjab'}
            </div>

            {/* Direct Phone Action */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              padding: '12px 14px', 
              background: '#fff', 
              borderRadius: 8, 
              border: '1px solid #e5e7eb',
              marginBottom: 10
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ background: '#dcfce7', color: '#15803d', padding: 8, borderRadius: 8 }}>
                  <Phone size={16} />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)' }}>PHONE CALL</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-900)' }}>
                    {farmerPhone || 'Phone number not available'}
                  </div>
                </div>
              </div>

              {farmerPhone && (
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={copyPhone}
                    style={{
                      padding: '6px 10px',
                      background: '#f3f4f6',
                      border: '1px solid #d1d5db',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                    title="Copy phone number"
                  >
                    {copiedPhone ? <Check size={13} color="#15803d" /> : <Copy size={13} />}
                    <span>{copiedPhone ? 'Copied' : 'Copy'}</span>
                  </button>

                  <a
                    href={`tel:${farmerPhone}`}
                    style={{
                      padding: '6px 14px',
                      background: '#15803d',
                      color: '#fff',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <Phone size={13} />
                    <span>Call</span>
                  </a>
                </div>
              )}
            </div>

            {/* Direct Email Action */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              padding: '12px 14px', 
              background: '#fff', 
              borderRadius: 8, 
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ background: '#eff6ff', color: '#2563eb', padding: 8, borderRadius: 8 }}>
                  <Mail size={16} />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)' }}>EMAIL ADDRESS</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-900)' }}>
                    {farmerEmail || 'Email not listed'}
                  </div>
                </div>
              </div>

              {farmerEmail && (
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={copyEmail}
                    style={{
                      padding: '6px 10px',
                      background: '#f3f4f6',
                      border: '1px solid #d1d5db',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                    title="Copy email address"
                  >
                    {copiedEmail ? <Check size={13} color="#15803d" /> : <Copy size={13} />}
                    <span>{copiedEmail ? 'Copied' : 'Copy'}</span>
                  </button>

                  <a
                    href={`mailto:${farmerEmail}`}
                    style={{
                      padding: '6px 14px',
                      background: '#2563eb',
                      color: '#fff',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <Mail size={13} />
                    <span>Email</span>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Quick Message Form */}
          <form onSubmit={handleSendMessage}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-700)', marginBottom: 6 }}>
              Send an In-Platform Message / Note:
            </div>
            <textarea
              rows={3}
              placeholder="e.g., Hi, I want to confirm the pickup timeline for this stubble batch..."
              value={customMsg}
              onChange={e => setCustomMsg(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid var(--gray-300)',
                fontSize: 13,
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
                marginBottom: 12
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '8px 16px',
                  background: '#fff',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--gray-700)',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
              <button
                type="submit"
                disabled={sending || !customMsg.trim()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 18px',
                  background: (!customMsg.trim() || sending) ? '#9ca3af' : '#15803d',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#fff',
                  cursor: (!customMsg.trim() || sending) ? 'not-allowed' : 'pointer'
                }}
              >
                <MessageCircle size={14} />
                <span>{sending ? 'Sending...' : 'Send Message'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
