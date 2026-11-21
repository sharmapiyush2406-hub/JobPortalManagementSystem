/**
 * API Service for Job Portal Management System
 * Communicates with Core Java Servlet Backend using RESTful JSON.
 * Configured with credentials: 'include' for HttpSession JSESSIONID cookies.
 */

const BASE_URL = '/api';

async function request(endpoint, options = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include', // Essential for sending and receiving session cookies
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
      const error = new Error(errorMsg);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Could not connect to Java Backend Server. Please ensure Tomcat or DevServer is running on port 8080.');
    }
    throw err;
  }
}

// ==========================================
// AUTHENTICATION APIs
// ==========================================
export const authAPI = {
  register: (payload) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  login: (payload) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  logout: () => request('/auth/logout', {
    method: 'POST',
  }),

  getMe: () => request('/auth/me', {
    method: 'GET',
  }),
};

// ==========================================
// JOBS APIs
// ==========================================
export const jobAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.title) query.append('title', params.title);
    if (params.search) query.append('search', params.search);
    if (params.location) query.append('location', params.location);
    if (params.jobType && params.jobType !== 'All') query.append('jobType', params.jobType);

    const queryString = query.toString();
    return request(`/jobs${queryString ? `?${queryString}` : ''}`, { method: 'GET' });
  },

  getById: (id) => request(`/jobs/${id}`, { method: 'GET' }),

  create: (payload) => request('/jobs', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  update: (id, payload) => request(`/jobs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),

  delete: (id) => request(`/jobs/${id}`, {
    method: 'DELETE',
  }),
};

// ==========================================
// APPLICATIONS APIs
// ==========================================
export const applicationAPI = {
  apply: (jobId) => request('/applications', {
    method: 'POST',
    body: JSON.stringify({ jobId }),
  }),

  getMyApplications: () => request('/applications/my', { method: 'GET' }),

  getAll: () => request('/applications', { method: 'GET' }),

  updateStatus: (appId, status) => request(`/applications/${appId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),
};

// ==========================================
// CANDIDATE APIs
// ==========================================
export const candidateAPI = {
  getProfile: () => request('/candidate/profile', { method: 'GET' }),

  updateProfile: (payload) => request('/candidate/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),

  getDashboard: () => request('/candidate/dashboard', { method: 'GET' }),
};

// ==========================================
// ADMIN APIs
// ==========================================
export const adminAPI = {
  getDashboard: () => request('/admin/dashboard', { method: 'GET' }),

  getCandidates: (search) => {
    const q = search ? `?search=${encodeURIComponent(search)}` : '';
    return request(`/admin/candidates${q}`, { method: 'GET' });
  },

  getApplications: (status) => {
    const q = (status && status !== 'All') ? `?status=${encodeURIComponent(status)}` : '';
    return request(`/admin/applications${q}`, { method: 'GET' });
  },
};
