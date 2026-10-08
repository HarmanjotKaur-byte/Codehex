import { useState, useEffect, useCallback } from 'react';
import { Bell, MessageSquare, RefreshCw, CheckCircle, Clock, XCircle, Info, Package, Phone } from 'lucide-react';
import { getMyInterests, getMyContacts } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

export default function BuyerActivity() {
  const { t, language } = useLanguage();
  const [interests, setInterests] = useState([]);
  const [contacts,  setContacts]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [tab,       setTab]       = useState('interests');

  const statusBadge = (status) => {
    const label = t(`status.${status}`) || status;
    const isGreen = status === 'INTERESTED' || status === 'ACCEPTED' || status === 'AVAILABLE' || status === 'VERIFIED';
    const isRed = status === 'REJECTED' || status === 'CANCELLED';
    const cls = isGreen ? 'chip chip-green' : isRed ? 'chip chip-red' : 'chip';
    const icon = isGreen ? <CheckCircle size={12} /> : isRed ? <XCircle size={12} /> : null;
    return (
      <span className={cls} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        {icon}{label}
      </span>
    );
  };

  const fmtDate = (d) => {
    if (!d) return '—';
    try {
      const localeMap = { en: 'en-IN', hi: 'hi-IN', pa: 'pa-IN' };
      return new Date(d).toLocaleString(localeMap[language] || 'en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    } catch (_) {
      return String(d);
    }
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [intData, contactData] = await Promise.all([
        getMyInterests(),
        getMyContacts(),
      ]);
      setInterests(Array.isArray(intData) ? intData : []);
      setContacts(Array.isArray(contactData) ? contactData : []);
    } catch (err) {
      setError(err.message || t('errors.serverError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => { fetchAll(); }, [tab, fetchAll]);

  const activeInterests = interests.filter(i => i.status === 'INTERESTED').length;
  const unreadContacts  = contacts.filter(c => !c.is_read).length;

  return (
    <div>
      <div className="page-header">
        <h2>🔔 {t('buyer.myInterestsTitle')}</h2>
        <p>{t('buyer.myInterestsSubtitle')}</p>
      </div>

      {/* Summary cards */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: 'var(--green-100)', color: 'var(--green-700)' }}>
            <Package size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">{t('buyer.myInterestsTitle')}</span>
            <span className="stat-value">{interests.length}</span>
            <span className="stat-sub">{activeInterests} {t('status.PENDING')}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: '#fef3c7', color: '#b45309' }}>
            <MessageSquare size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">{t('farmer.contactRequests')}</span>
            <span className="stat-value">{contacts.length}</span>
            <span className="stat-sub">{unreadContacts > 0 ? `${unreadContacts} unread` : t('common.all')}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: 'var(--blue-100)', color: 'var(--blue-600)' }}>
            <Bell size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">{t('common.all')}</span>
            <span className="stat-value">{interests.length + contacts.length}</span>
            <span className="stat-sub">{t('common.active')}</span>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { id: 'interests', label: `📬 ${t('buyer.activeInterestsTab')} (${interests.length})` },
          { id: 'contacts',  label: `💬 ${t('farmer.contactRequests')} (${contacts.length})` },
        ].map(tb => (
          <button
            key={tb.id}
            onClick={() => setTab(tb.id)}
            className={`btn ${tab === tb.id ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.85rem', padding: '8px 14px' }}
          >
            {tb.label}
          </button>
        ))}
        <button
          onClick={fetchAll}
          className="btn btn-secondary"
          style={{ marginLeft: 'auto', fontSize: '0.82rem', padding: '8px 12px' }}
          disabled={loading}
        >
          <RefreshCw size={14} /> {t('common.refresh')}
        </button>
      </div>

      {error && (
        <div className="info-banner" style={{ marginBottom: 16 }}>
          <Info size={16} /><span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--gray-400)' }}>
          {t('common.loading')}
        </div>
      ) : (
        <>
          {tab === 'interests' && (
            <div className="card">
              <div className="card-title" style={{ marginBottom: 4 }}>{t('buyer.myInterestsTitle')}</div>
              <div className="card-subtitle" style={{ marginBottom: 16 }}>
                {t('buyer.myInterestsSubtitle')}
              </div>

              {interests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--gray-400)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: 12 }}>📭</div>
                  <p>{t('buyer.noListingsFound')}</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="metrics-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>{t('roles.FARMER')}</th>
                        <th>{t('common.phone')}</th>
                        <th>{t('common.location')}</th>
                        <th>{t('common.quantity')}</th>
                        <th>{t('common.pricePerTonne')}</th>
                        <th>{t('buyer.yourOffer')}</th>
                        <th>{t('common.status')}</th>
                        <th>{t('common.date')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {interests.map(i => (
                        <tr key={i.id}>
                          <td><strong>#{i.listing_id}</strong></td>
                          <td><strong>{i.farmer_name || '—'}</strong></td>
                          <td>
                            {i.farmer_phone ? (
                              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.82rem' }}>
                                <Phone size={12} color="var(--green-700)" />
                                {i.farmer_phone}
                              </span>
                            ) : (
                              <span style={{ color: 'var(--gray-400)', fontSize: '0.8rem' }}>—</span>
                            )}
                          </td>
                          <td style={{ fontSize: '0.85rem' }}>
                            {i.district || '—'}{i.state ? `, ${i.state}` : ''}
                          </td>
                          <td><strong>{i.quantity_tonnes} {t('common.tonnesAbbr')}</strong></td>
                          <td>₹{i.asking_price?.toLocaleString()}/{t('common.tonnesAbbr')}</td>
                          <td style={{ maxWidth: 200 }}>
                            <span style={{ fontSize: '0.82rem', color: 'var(--gray-600)', wordBreak: 'break-word' }}>
                              {i.message || '—'}
                            </span>
                          </td>
                          <td>{statusBadge(i.status)}</td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--gray-500)', whiteSpace: 'nowrap' }}>
                            <Clock size={12} style={{ verticalAlign: 'middle', marginRight: 3 }} />
                            {fmtDate(i.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {tab === 'contacts' && (
            <div className="card">
              <div className="card-title" style={{ marginBottom: 4 }}>{t('farmer.contactRequests')}</div>
              <div className="card-subtitle" style={{ marginBottom: 16 }}>
                {t('buyer.myInterestsSubtitle')}
              </div>

              {contacts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--gray-400)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: 12 }}>💬</div>
                  <p>{t('common.noData')}</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="metrics-table">
                    <thead>
                      <tr>
                        <th>{t('roles.FARMER')}</th>
                        <th>{t('common.location')}</th>
                        <th>{t('common.quantity')}</th>
                        <th>{t('farmer.yourMessage')}</th>
                        <th>{t('common.date')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contacts.map(c => (
                        <tr key={c.id}>
                          <td><strong>{c.farmer_name || `Farmer #${c.farmer_id}`}</strong></td>
                          <td>{c.farmer_district || '—'}</td>
                          <td>{c.stubble_qty ? `${c.stubble_qty} ${t('common.tonnesAbbr')}` : '—'}</td>
                          <td style={{ maxWidth: 260 }}>
                            <span style={{ fontSize: '0.82rem', color: 'var(--gray-700)', wordBreak: 'break-word' }}>
                              {c.message}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{fmtDate(c.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
