const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

function getAuthHeader() {
  const token = localStorage.getItem('paralipay_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      if (Array.isArray(err.detail)) {
        // Pydantic validation errors: [{loc, msg, type}, ...]
        msg = err.detail.map(e => {
          const field = e.loc ? e.loc.slice(1).join(' → ') : '';
          return field ? `${field}: ${e.msg}` : e.msg;
        }).join(' | ');
      } else {
        msg = err.detail || JSON.stringify(err);
      }
    } catch (_) {}
    throw new Error(msg);
  }
  return res.json();
}

// System & Health
export const getHealth = () => apiFetch('/api/health');

// ML Endpoints (Preserved)
export const predictStubble = (data) =>
  apiFetch('/api/stubble/predict', { method: 'POST', body: JSON.stringify(data) });

export const predictRisk = (data) =>
  apiFetch('/api/risk/predict', { method: 'POST', body: JSON.stringify(data) });

export const matchBuyers = (data) =>
  apiFetch('/api/buyers/match', { method: 'POST', body: JSON.stringify(data) });

export const getBuyers = () => apiFetch('/api/buyers');

// Auth Endpoints
export const login = (data) =>
  apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify(data) });

export const register = (data) =>
  apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify(data) });

export const getMe = () => apiFetch('/api/auth/me');

export const logout = () =>
  apiFetch('/api/auth/logout', { method: 'POST' });

// Super Admin & Verification Endpoints
export const getAdminStats = () => apiFetch('/api/admin/stats');

export const getVerifications = (status) =>
  apiFetch(`/api/admin/verifications${status ? `?status_filter=${status}` : ''}`);

export const approveVerification = (userId) =>
  apiFetch(`/api/admin/verifications/${userId}/approve`, { method: 'POST' });

export const rejectVerification = (userId, reason) =>
  apiFetch(`/api/admin/verifications/${userId}/reject`, {
    method: 'POST',
    body: JSON.stringify({ rejection_reason: reason }),
  });

// Stubble Listings Marketplace
export const getListings = (params = {}) => {
  const query = new URLSearchParams();
  if (params.district) query.append('district', params.district);
  if (params.max_price) query.append('max_price', params.max_price);
  if (params.min_qty) query.append('min_qty', params.min_qty);
  const qStr = query.toString();
  return apiFetch(`/api/listings${qStr ? `?${qStr}` : ''}`);
};

export const createListing = (data) =>
  apiFetch('/api/listings', { method: 'POST', body: JSON.stringify(data) });

export const getMyListings = () => apiFetch('/api/listings/my');

export const updateListing = (id, data) =>
  apiFetch(`/api/listings/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

// Buyer Interests
export const expressInterest = (data) =>
  apiFetch('/api/interests', { method: 'POST', body: JSON.stringify(data) });

export const getMyInterests = () => apiFetch('/api/interests/my');

export const updateInterestStatus = (id, status) =>
  apiFetch(`/api/interests/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });

// Farmer Activity — who expressed interest in my listings
export const getFarmerListingInterests = () => apiFetch('/api/listings/my/interests');

// Contacts — farmer contacts buyer on-site
export const contactBuyer = (data) =>
  apiFetch('/api/contacts', { method: 'POST', body: JSON.stringify(data) });

export const getMyContacts = () => apiFetch('/api/contacts/my');
export const updateContactStatus = (id, status) =>
  apiFetch(`/api/contacts/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });

// Buyer Permanent Registration & Verification
export const getBuyerProfile = () => apiFetch('/api/buyer/profile');
export const registerBuyerInterest = (data) =>
  apiFetch('/api/buyer/register-interest', { method: 'POST', body: JSON.stringify(data) });
export const deleteBuyerProfile = () =>
  apiFetch('/api/buyer/profile', { method: 'DELETE' });
