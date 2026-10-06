const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('paralipay_token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      msg = err.detail || JSON.stringify(err);
    } catch (_) {}
    throw new Error(msg);
  }
  return res.json();
}

// -----------------------------------------------------------------------------
// System & Health
// -----------------------------------------------------------------------------
export const getHealth = () => apiFetch('/api/health');

// -----------------------------------------------------------------------------
// Authentication
// -----------------------------------------------------------------------------
export const registerUser = (data) =>
  apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify(data) });

export const loginUser = (data) =>
  apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify(data) });

export const getCurrentUser = () => apiFetch('/api/auth/me');

export const logoutUser = () => apiFetch('/api/auth/logout', { method: 'POST' });

// -----------------------------------------------------------------------------
// Super Admin & Verification
// -----------------------------------------------------------------------------
export const getSuperAdminStats = () => apiFetch('/api/admin/stats');

export const getVerifications = (status = null) => {
  const q = status ? `?status_filter=${status}` : '';
  return apiFetch(`/api/admin/verifications${q}`);
};

export const approveVerification = (userId) =>
  apiFetch(`/api/admin/verifications/${userId}/approve`, { method: 'POST' });

export const rejectVerification = (userId, reason) =>
  apiFetch(`/api/admin/verifications/${userId}/reject`, {
    method: 'POST',
    body: JSON.stringify({ rejection_reason: reason }),
  });

// -----------------------------------------------------------------------------
// Marketplace Listings & Interests
// -----------------------------------------------------------------------------
export const createListing = (data) =>
  apiFetch('/api/listings', { method: 'POST', body: JSON.stringify(data) });

export const getListings = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/api/listings${query ? `?${query}` : ''}`);
};

export const getMyListings = () => apiFetch('/api/listings/my');

export const updateListing = (id, data) =>
  apiFetch(`/api/listings/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

export const expressInterest = (data) =>
  apiFetch('/api/interests', { method: 'POST', body: JSON.stringify(data) });

export const getMyInterests = () => apiFetch('/api/interests/my');

// -----------------------------------------------------------------------------
// ML Predictions & Matching (Preserved)
// -----------------------------------------------------------------------------
export const predictStubble = (data) =>
  apiFetch('/api/stubble/predict', { method: 'POST', body: JSON.stringify(data) });

export const predictRisk = (data) =>
  apiFetch('/api/risk/predict', { method: 'POST', body: JSON.stringify(data) });

export const matchBuyers = (data) =>
  apiFetch('/api/buyers/match', { method: 'POST', body: JSON.stringify(data) });

export const getBuyers = () => apiFetch('/api/buyers');
