import { useState, useEffect } from 'react';
import { 
  Bell, Send, RefreshCw, Clock, CheckCircle, XCircle, 
  AlertCircle, MapPin, Phone, Mail, MessageSquare, Eye, 
  User, ExternalLink, Wheat, Calendar, X, Check, ShieldCheck
} from 'lucide-react';
import { getMyContacts, getMyInterests, updateContactStatus, expressInterest } from '../../services/api.js';

// Status Badge Component
function StatusBadge({ status }) {
  const s = (status || '').toUpperCase();
  const configs = {
    INTERESTED: { bg: '#dcfce7', color: '#15803d', border: '#bbf7d0', icon: <CheckCircle size={12} />, label: 'Interested' },
    PENDING:    { bg: '#fef9c3', color: '#a16207', border: '#fde047', icon: <Clock size={12} />, label: 'Pending' },
    ACCEPTED:   { bg: '#dcfce7', color: '#15803d', border: '#86efac', icon: <CheckCircle size={12} />, label: 'Accepted' },
    CONFIRMED:  { bg: '#dcfce7', color: '#15803d', border: '#86efac', icon: <CheckCircle size={12} />, label: 'Confirmed' },
    REJECTED:   { bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5', icon: <XCircle size={12} />, label: 'Rejected' },
    CANCELLED:  { bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5', icon: <XCircle size={12} />, label: 'Cancelled' },
    VIEWED:     { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe', icon: <AlertCircle size={12} />, label: 'Viewed' },
  };
  const cfg = configs[s] || configs.INTERESTED;
  return (
    <span style={{ 
      display: 'inline-flex', 
      alignItems: 'center', 
      gap: 5, 
      background: cfg.bg, 
      color: cfg.color, 
      border: `1px solid ${cfg.border}`,
      padding: '4px 10px', 
      borderRadius: 20, 
      fontSize: 12, 
      fontWeight: 600,
      whiteSpace: 'nowrap'
    }}>
      {cfg.icon} <span>{cfg.label}</span>
    </span>
  );
}

// Format friendly date
function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }) + ', ' + d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export default function BuyerMyActivity() {
  // Tabs: 'inquiries' = Feature 1 (Seller Inquiries & Interests)
  //       'sent'      = Feature 2 (Sent Contact Requests)
  const [activeTab, setActiveTab] = useState('inquiries');

  // Feature 1: Inquiries received from farmers/sellers
  const [receivedInquiries, setReceivedInquiries] = useState([]);
  
  // Feature 2: Contact requests sent by this buyer to farmers
  const [sentRequests, setSentRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Modals state
  const [selectedListing, setSelectedListing] = useState(null);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [contactTarget, setContactTarget] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Fetch both datasets concurrently
  const fetchActivity = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const [contactsData, interestsData] = await Promise.all([
        getMyContacts(),
        getMyInterests()
      ]);
      setReceivedInquiries(Array.isArray(contactsData) ? contactsData : []);
      setSentRequests(Array.isArray(interestsData) ? interestsData : []);
    } catch (err) {
      console.error('Failed to load marketplace activity:', err);
      setError(err.message || 'Failed to fetch activity data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, []);

  // Compute stats
  const pendingInquiriesCount = receivedInquiries.filter(
    i => (i.status || '').toUpperCase() === 'INTERESTED' || (i.status || '').toUpperCase() === 'PENDING'
  ).length;

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
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 24 }}>🔔</span>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--gray-900)', margin: 0 }}>
            Marketplace Activity
          </h1>
        </div>
        <p style={{ color: 'var(--gray-600)', margin: 0, fontSize: 14 }}>
          Track your received seller inquiries and sent contact requests in real time.
        </p>
      </div>

      {/* Top Activity Cards (Visual style from reference image) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 18,
        marginBottom: 24
      }}>
        {/* Card 1: Seller / Farmer Inquiries & Interests */}
        <div 
          onClick={() => setActiveTab('inquiries')}
          style={{
            background: '#ffffff',
            border: activeTab === 'inquiries' ? '2px solid #15803d' : '1px solid #e5e7eb',
            borderRadius: 14,
            padding: '20px 22px',
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            gap: 18
          }}
          onMouseOver={e => e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)'}
          onMouseOut={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
        >
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: '#dcfce7',
            color: '#15803d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Bell size={24} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              SELLER / FARMER INQUIRIES & INTERESTS
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--gray-900)', marginTop: 2, lineHeight: 1 }}>
              {receivedInquiries.length}
            </div>
            <div style={{ fontSize: 12, color: '#16a34a', fontWeight: 600, marginTop: 6 }}>
              {pendingInquiriesCount} Pending
            </div>
          </div>
        </div>

        {/* Card 2: Sent Contact Requests */}
        <div 
          onClick={() => setActiveTab('sent')}
          style={{
            background: '#ffffff',
            border: activeTab === 'sent' ? '2px solid #15803d' : '1px solid #e5e7eb',
            borderRadius: 14,
            padding: '20px 22px',
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            gap: 18
          }}
          onMouseOver={e => e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)'}
          onMouseOut={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
        >
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: '#fef3c7',
            color: '#b45309',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Send size={22} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              SENT CONTACT REQUESTS
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--gray-900)', marginTop: 2, lineHeight: 1 }}>
              {sentRequests.length}
            </div>
            <div style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 500, marginTop: 6 }}>
              Contact Request Sent ✓
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Bar & Refresh Button */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 18,
        flexWrap: 'wrap',
        gap: 12
      }}>
        {/* Pills */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('inquiries')}
            style={{
              padding: '9px 16px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              border: activeTab === 'inquiries' ? 'none' : '1px solid #e5e7eb',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: activeTab === 'inquiries' ? '#15803d' : '#ffffff',
              color: activeTab === 'inquiries' ? '#ffffff' : '#374151',
              boxShadow: activeTab === 'inquiries' ? '0 2px 6px rgba(21, 128, 61, 0.25)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <span>📊</span>
            <span>Seller Inquiries & Interests ({receivedInquiries.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('sent')}
            style={{
              padding: '9px 16px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              border: activeTab === 'sent' ? 'none' : '1px solid #e5e7eb',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: activeTab === 'sent' ? '#15803d' : '#ffffff',
              color: activeTab === 'sent' ? '#ffffff' : '#374151',
              boxShadow: activeTab === 'sent' ? '0 2px 6px rgba(21, 128, 61, 0.25)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <span>💬</span>
            <span>Sent Contact Requests ({sentRequests.length})</span>
          </button>
        </div>

        {/* Refresh Button */}
        <button
          onClick={() => fetchActivity(true)}
          disabled={refreshing || loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            padding: '8px 16px',
            background: '#ffffff',
            border: '1px solid #d1d5db',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--gray-700)',
            cursor: refreshing ? 'not-allowed' : 'pointer',
            boxShadow: 'var(--shadow-sm)',
            transition: 'background 0.15s ease'
          }}
          onMouseOver={e => e.currentTarget.style.background = '#f9fafb'}
          onMouseOut={e => e.currentTarget.style.background = '#ffffff'}
        >
          <RefreshCw size={14} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 0', background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
          <div style={{ color: 'var(--gray-600)', fontSize: 15, fontWeight: 500 }}>Loading activity data...</div>
        </div>
      )}

      {/* Error Banner */}
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
            onClick={() => fetchActivity()}
            style={{
              background: '#dc2626',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '6px 14px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FEATURE 1: SELLER / FARMER INQUIRIES & INTERESTS TABLE                    */}
      {/* ========================================================================= */}
      {!loading && !error && activeTab === 'inquiries' && (
        <div style={{
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: 14,
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)'
        }}>
          {/* Section Header */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6' }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--gray-900)', margin: '0 0 4px 0' }}>
              Seller / Farmer Inquiries & Interests
            </h2>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--gray-500)' }}>
              Farmers who discovered your profile and reached out with their stubble listings.
            </p>
          </div>

          {receivedInquiries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '56px 24px' }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>📬</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-800)', marginBottom: 6 }}>
                No seller inquiries received yet
              </h3>
              <p style={{ color: 'var(--gray-500)', fontSize: 13, maxWidth: 440, margin: '0 auto' }}>
                When farmers search for buyers matching their parcel and contact your company, their inquiries and messages will appear right here.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 920 }}>
                <thead>
                  <tr style={{ background: '#f0fdf4', borderBottom: '1px solid #dcfce7' }}>
                    <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#15803d', textTransform: 'uppercase' }}>Farmer / Seller</th>
                    <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#15803d', textTransform: 'uppercase' }}>Listing / Residue</th>
                    <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#15803d', textTransform: 'uppercase' }}>Quantity</th>
                    <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#15803d', textTransform: 'uppercase' }}>Price</th>
                    <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#15803d', textTransform: 'uppercase' }}>Location</th>
                    <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#15803d', textTransform: 'uppercase', width: '22%' }}>Farmer's Message</th>
                    <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#15803d', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#15803d', textTransform: 'uppercase' }}>Date</th>
                    <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#15803d', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {receivedInquiries.map((inquiry, idx) => (
                    <tr 
                      key={inquiry.id || idx}
                      style={{ 
                        borderBottom: '1px solid #f3f4f6', 
                        transition: 'background 0.15s ease' 
                      }}
                      onMouseOver={e => e.currentTarget.style.background = '#fafafa'}
                      onMouseOut={e => e.currentTarget.style.background = '#ffffff'}
                    >
                      {/* Farmer / Seller */}
                      <td style={{ padding: '16px 18px', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--gray-900)' }}>
                          {inquiry.farmer_name || 'Farmer'}
                        </div>
                        {inquiry.farmer_phone && (
                          <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>
                            {inquiry.farmer_phone}
                          </div>
                        )}
                      </td>

                      {/* Listing / Residue */}
                      <td style={{ padding: '16px 18px', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: '#15803d' }}>
                          {inquiry.listing_id ? `Listing #${inquiry.listing_id}` : 'General Stubble'}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--gray-600)', marginTop: 1 }}>
                          {inquiry.crop || 'Paddy Straw'} ({inquiry.residue_type || 'Baled'})
                        </div>
                      </td>

                      {/* Quantity */}
                      <td style={{ padding: '16px 18px', verticalAlign: 'top' }}>
                        <strong style={{ fontSize: 13, color: 'var(--gray-900)' }}>
                          {inquiry.stubble_qty ? `${inquiry.stubble_qty} t` : 'N/A'}
                        </strong>
                      </td>

                      {/* Price */}
                      <td style={{ padding: '16px 18px', verticalAlign: 'top' }}>
                        <strong style={{ fontSize: 13, color: '#15803d' }}>
                          {inquiry.price ? `₹${Number(inquiry.price).toLocaleString('en-IN')}/t` : 'Negotiable'}
                        </strong>
                      </td>

                      {/* Location */}
                      <td style={{ padding: '16px 18px', verticalAlign: 'top' }}>
                        <div style={{ fontSize: 13, color: 'var(--gray-700)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={12} color="#16a34a" />
                          <span>{inquiry.farmer_location || `${inquiry.district || 'Ludhiana'}, ${inquiry.state || 'Punjab'}`}</span>
                        </div>
                      </td>

                      {/* Farmer's Message */}
                      <td style={{ padding: '16px 18px', verticalAlign: 'top' }}>
                        <div style={{
                          background: '#f9fafb',
                          border: '1px solid #f3f4f6',
                          borderRadius: 8,
                          padding: '8px 12px',
                          fontSize: 12,
                          color: '#374151',
                          lineHeight: 1.45,
                          fontStyle: 'italic'
                        }}>
                          "{inquiry.message || 'I have stubble available and would like to connect.'}"
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '16px 18px', verticalAlign: 'top' }}>
                        <StatusBadge status={inquiry.status || 'INTERESTED'} />
                      </td>

                      {/* Date */}
                      <td style={{ padding: '16px 18px', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                        <div style={{ fontSize: 12, color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={12} />
                          <span>{formatDate(inquiry.created_at)}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '16px 18px', verticalAlign: 'top', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                          <button
                            onClick={() => setSelectedListing({
                              id: inquiry.listing_id || inquiry.id,
                              crop: inquiry.crop || 'Paddy Straw',
                              residue_type: inquiry.residue_type || 'Baled Straw',
                              quantity_tonnes: inquiry.stubble_qty,
                              asking_price_per_tonne: inquiry.price,
                              district: inquiry.district,
                              state: inquiry.state,
                              farmer_name: inquiry.farmer_name
                            })}
                            style={{
                              padding: '5px 10px',
                              background: '#f3f4f6',
                              border: '1px solid #d1d5db',
                              borderRadius: 6,
                              fontSize: 11,
                              fontWeight: 600,
                              color: 'var(--gray-700)',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            <Eye size={12} />
                            <span>View Listing</span>
                          </button>

                          <button
                            onClick={() => setSelectedFarmer({
                              name: inquiry.farmer_name,
                              phone: inquiry.farmer_phone,
                              email: inquiry.farmer_email,
                              location: inquiry.farmer_location || `${inquiry.district}, ${inquiry.state}`
                            })}
                            style={{
                              padding: '5px 10px',
                              background: '#ffffff',
                              border: '1px solid #d1d5db',
                              borderRadius: 6,
                              fontSize: 11,
                              fontWeight: 600,
                              color: '#15803d',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            <User size={12} />
                            <span>View Farmer</span>
                          </button>

                          <button
                            onClick={() => setContactTarget({
                              name: inquiry.farmer_name,
                              phone: inquiry.farmer_phone,
                              email: inquiry.farmer_email,
                              listing_id: inquiry.listing_id
                            })}
                            style={{
                              padding: '5px 12px',
                              background: '#15803d',
                              border: 'none',
                              borderRadius: 6,
                              fontSize: 11,
                              fontWeight: 600,
                              color: '#ffffff',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            <Phone size={12} />
                            <span>Contact Farmer</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* FEATURE 2: SENT CONTACT REQUESTS TABLE                                    */}
      {/* ========================================================================= */}
      {!loading && !error && activeTab === 'sent' && (
        <div style={{
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: 14,
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)'
        }}>
          {/* Section Header */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6' }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--gray-900)', margin: '0 0 4px 0' }}>
              Sent Contact Requests
            </h2>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--gray-500)' }}>
              Inquiries and messages you have sent to farmers regarding their stubble listings.
            </p>
          </div>

          {sentRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '56px 24px' }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>📤</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-800)', marginBottom: 6 }}>
                No contact requests sent yet
              </h3>
              <p style={{ color: 'var(--gray-500)', fontSize: 13, maxWidth: 440, margin: '0 auto' }}>
                When you browse stubble listings and click "Contact Seller", all your sent requests will be logged here.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 920 }}>
                <thead>
                  <tr style={{ background: '#f0fdf4', borderBottom: '1px solid #dcfce7' }}>
                    <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#15803d', textTransform: 'uppercase' }}>Farmer / Seller</th>
                    <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#15803d', textTransform: 'uppercase' }}>Listing</th>
                    <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#15803d', textTransform: 'uppercase' }}>Quantity & Rate</th>
                    <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#15803d', textTransform: 'uppercase' }}>Location</th>
                    <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#15803d', textTransform: 'uppercase', width: '24%' }}>Contact Request / Message</th>
                    <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#15803d', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#15803d', textTransform: 'uppercase' }}>Date</th>
                    <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#15803d', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sentRequests.map((req, idx) => (
                    <tr 
                      key={req.id || idx}
                      style={{ 
                        borderBottom: '1px solid #f3f4f6', 
                        transition: 'background 0.15s ease' 
                      }}
                      onMouseOver={e => e.currentTarget.style.background = '#fafafa'}
                      onMouseOut={e => e.currentTarget.style.background = '#ffffff'}
                    >
                      {/* Farmer / Seller */}
                      <td style={{ padding: '16px 18px', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--gray-900)' }}>
                          {req.farmer_name || 'Farmer'}
                        </div>
                        {req.farmer_phone && (
                          <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>
                            {req.farmer_phone}
                          </div>
                        )}
                      </td>

                      {/* Listing */}
                      <td style={{ padding: '16px 18px', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: '#15803d' }}>
                          Listing #{req.listing_id}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--gray-600)', marginTop: 1 }}>
                          {req.crop || 'Paddy Straw'}
                        </div>
                      </td>

                      {/* Quantity & Rate */}
                      <td style={{ padding: '16px 18px', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--gray-900)' }}>
                          {req.quantity_tonnes} tonnes
                        </div>
                        <div style={{ fontSize: 12, color: '#15803d', marginTop: 1 }}>
                          ₹{Number(req.asking_price || 0).toLocaleString('en-IN')}/t
                        </div>
                      </td>

                      {/* Location */}
                      <td style={{ padding: '16px 18px', verticalAlign: 'top' }}>
                        <div style={{ fontSize: 13, color: 'var(--gray-700)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={12} color="#16a34a" />
                          <span>{[req.village, req.district, req.state].filter(Boolean).join(', ') || 'Punjab'}</span>
                        </div>
                      </td>

                      {/* Contact Request / Message */}
                      <td style={{ padding: '16px 18px', verticalAlign: 'top' }}>
                        <div style={{
                          background: '#f0fdf4',
                          border: '1px solid #dcfce7',
                          borderRadius: 8,
                          padding: '8px 12px',
                          fontSize: 12,
                          color: '#166534',
                          lineHeight: 1.45,
                          fontStyle: 'italic'
                        }}>
                          "{req.message || 'I am interested in purchasing this stubble batch.'}"
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '16px 18px', verticalAlign: 'top' }}>
                        <StatusBadge status={req.status || 'PENDING'} />
                      </td>

                      {/* Date */}
                      <td style={{ padding: '16px 18px', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                        <div style={{ fontSize: 12, color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={12} />
                          <span>{formatDate(req.created_at)}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '16px 18px', verticalAlign: 'top', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                          <button
                            onClick={() => setSelectedListing({
                              id: req.listing_id,
                              crop: req.crop || 'Paddy Straw',
                              residue_type: req.residue_type || 'Baled Straw',
                              quantity_tonnes: req.quantity_tonnes,
                              asking_price_per_tonne: req.asking_price,
                              district: req.district,
                              state: req.state,
                              village: req.village,
                              farmer_name: req.farmer_name
                            })}
                            style={{
                              padding: '5px 10px',
                              background: '#f3f4f6',
                              border: '1px solid #d1d5db',
                              borderRadius: 6,
                              fontSize: 11,
                              fontWeight: 600,
                              color: 'var(--gray-700)',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            <Eye size={12} />
                            <span>View Listing</span>
                          </button>

                          <button
                            onClick={() => setSelectedFarmer({
                              name: req.farmer_name,
                              phone: req.farmer_phone,
                              email: req.farmer_email,
                              location: `${req.district || 'Ludhiana'}, ${req.state || 'Punjab'}`
                            })}
                            style={{
                              padding: '5px 10px',
                              background: '#ffffff',
                              border: '1px solid #d1d5db',
                              borderRadius: 6,
                              fontSize: 11,
                              fontWeight: 600,
                              color: '#15803d',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            <User size={12} />
                            <span>View Farmer</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: VIEW LISTING DETAILS                                             */}
      {/* ========================================================================= */}
      {selectedListing && (
        <div 
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 20,
            backdropFilter: 'blur(3px)'
          }}
          onClick={() => setSelectedListing(null)}
        >
          <div 
            style={{
              background: '#fff',
              borderRadius: 14,
              maxWidth: 520,
              width: '100%',
              padding: '24px',
              position: 'relative',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedListing(null)}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: '#f3f4f6',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                LISTING #{selectedListing.id}
              </span>
            </div>

            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 16 }}>
              {selectedListing.crop || 'Paddy Straw'} ({selectedListing.residue_type || 'Baled Straw'})
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div style={{ background: '#f9fafb', padding: '10px 12px', borderRadius: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--gray-500)', fontWeight: 600, display: 'block' }}>AVAILABLE QUANTITY</span>
                <strong style={{ fontSize: 15, color: 'var(--gray-900)' }}>{selectedListing.quantity_tonnes} tonnes</strong>
              </div>

              <div style={{ background: '#f9fafb', padding: '10px 12px', borderRadius: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--gray-500)', fontWeight: 600, display: 'block' }}>ASKING RATE</span>
                <strong style={{ fontSize: 15, color: '#15803d' }}>
                  {selectedListing.asking_price_per_tonne ? `₹${Number(selectedListing.asking_price_per_tonne).toLocaleString('en-IN')}/t` : 'Negotiable'}
                </strong>
              </div>
            </div>

            <div style={{ background: '#f9fafb', padding: '12px', borderRadius: 8, marginBottom: 18, fontSize: 13 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--gray-700)' }}>
                <MapPin size={14} color="#16a34a" />
                <span>{[selectedListing.village, selectedListing.district, selectedListing.state].filter(Boolean).join(', ') || 'Punjab'}</span>
              </div>
              {selectedListing.farmer_name && (
                <div style={{ marginTop: 6, color: 'var(--gray-600)', fontSize: 12 }}>
                  Listed by: <strong>{selectedListing.farmer_name}</strong>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedListing(null)}
                style={{
                  padding: '8px 18px',
                  background: '#15803d',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: VIEW FARMER / PROFILE                                            */}
      {/* ========================================================================= */}
      {selectedFarmer && (
        <div 
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 20,
            backdropFilter: 'blur(3px)'
          }}
          onClick={() => setSelectedFarmer(null)}
        >
          <div 
            style={{
              background: '#fff',
              borderRadius: 14,
              maxWidth: 480,
              width: '100%',
              padding: '24px',
              position: 'relative',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedFarmer(null)}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: '#f3f4f6',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 46,
                height: 46,
                borderRadius: '50%',
                background: '#dcfce7',
                color: '#15803d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                fontWeight: 700
              }}>
                {(selectedFarmer.name || 'F').charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--gray-900)', margin: 0 }}>
                  {selectedFarmer.name || 'Farmer'}
                </h3>
                <div style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>
                  Verified Agricultural Producer
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gap: 10, marginBottom: 20 }}>
              <div style={{ background: '#f9fafb', padding: '10px 14px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                <MapPin size={16} color="#6b7280" />
                <span style={{ fontSize: 13, color: 'var(--gray-800)' }}>{selectedFarmer.location || 'Punjab'}</span>
              </div>

              {selectedFarmer.phone && (
                <div style={{ background: '#f9fafb', padding: '10px 14px', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Phone size={16} color="#15803d" />
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-900)' }}>{selectedFarmer.phone}</span>
                  </div>
                  <a
                    href={`tel:${selectedFarmer.phone}`}
                    style={{
                      padding: '4px 10px',
                      background: '#15803d',
                      color: '#fff',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 600,
                      textDecoration: 'none'
                    }}
                  >
                    Call
                  </a>
                </div>
              )}

              {selectedFarmer.email && (
                <div style={{ background: '#f9fafb', padding: '10px 14px', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Mail size={16} color="#6b7280" />
                    <span style={{ fontSize: 13, color: 'var(--gray-800)' }}>{selectedFarmer.email}</span>
                  </div>
                  <a
                    href={`mailto:${selectedFarmer.email}`}
                    style={{
                      padding: '4px 10px',
                      background: '#f3f4f6',
                      color: 'var(--gray-700)',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 600,
                      textDecoration: 'none'
                    }}
                  >
                    Email
                  </a>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedFarmer(null)}
                style={{
                  padding: '8px 18px',
                  background: '#f3f4f6',
                  color: 'var(--gray-700)',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CONTACT FARMER                                                   */}
      {/* ========================================================================= */}
      {contactTarget && (
        <ContactFarmerModal
          target={contactTarget}
          onClose={() => setContactTarget(null)}
          onSuccess={(msg) => showToast(msg)}
        />
      )}

    </div>
  );
}

// -------------------------------------------------------------
// CONTACT FARMER QUICK MODAL
// -------------------------------------------------------------
function ContactFarmerModal({ target, onClose, onSuccess }) {
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!msg.trim()) return;

    setSending(true);
    try {
      if (target.listing_id) {
        await expressInterest({
          listing_id: target.listing_id,
          message: msg.trim()
        });
      }
      onSuccess(`Message sent to ${target.name}!`);
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
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.5)',
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
          background: '#fff',
          borderRadius: 14,
          maxWidth: 480,
          width: '100%',
          padding: '24px',
          position: 'relative',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: '#f3f4f6',
            border: 'none',
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <X size={16} />
        </button>

        <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 4 }}>
          Contact Farmer
        </h3>
        <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 16 }}>
          Reach out to <strong>{target.name}</strong> directly.
        </p>

        {target.phone && (
          <div style={{ 
            background: '#f0fdf4', 
            border: '1px solid #bbf7d0', 
            borderRadius: 8, 
            padding: '12px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: 16
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Phone size={16} color="#15803d" />
              <strong style={{ fontSize: 14, color: '#14532d' }}>{target.phone}</strong>
            </div>
            <a
              href={`tel:${target.phone}`}
              style={{
                padding: '5px 12px',
                background: '#15803d',
                color: '#fff',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              Call Now
            </a>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 6 }}>
            Send a Message:
          </label>
          <textarea
            rows={3}
            placeholder="Type your message or delivery inquiry..."
            value={msg}
            onChange={e => setMsg(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: 8,
              border: '1px solid var(--gray-300)',
              fontSize: 13,
              outline: 'none',
              resize: 'vertical',
              fontFamily: 'inherit',
              marginBottom: 16
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
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending || !msg.trim()}
              style={{
                padding: '8px 18px',
                background: (!msg.trim() || sending) ? '#9ca3af' : '#15803d',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: (!msg.trim() || sending) ? 'not-allowed' : 'pointer'
              }}
            >
              {sending ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
