/**
 * NetGuard AI REST API Client.
 * Communicates with the FastAPI backend service.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      let errorMsg = `HTTP Error ${response.status}`;
      try {
        const errJson = await response.json();
        errorMsg = errJson.detail || errJson.message || errorMsg;
      } catch (_) {}
      throw new Error(errorMsg);
    }
    return await response.json();
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  getHealth: () => request('/api/health'),
  getStats: () => request('/api/stats'),
  getAlerts: (limit = 50, offset = 0, category = null) => {
    let url = `/api/alerts?limit=${limit}&offset=${offset}`;
    if (category) url += `&category=${encodeURIComponent(category)}`;
    return request(url);
  },
  getAlertDetail: (alertId) => request(`/api/alerts/${encodeURIComponent(alertId)}`),
  getThreats: () => request('/api/threats'),
  getReplayStatus: () => request('/api/replay/status'),
  startReplay: (speed = 1.0) => request('/api/replay/start', {
    method: 'POST',
    body: JSON.stringify({ speed }),
  }),
  stopReplay: () => request('/api/replay/stop', { method: 'POST' }),
  injectAttack: (attackType, burstCount = 25) => request('/api/replay/attack', {
    method: 'POST',
    body: JSON.stringify({ attack_type: attackType, burst_count: burstCount }),
  }),
  resetReplay: () => request('/api/replay/reset', { method: 'POST' }),
  getModelPerformance: () => request('/api/models/performance'),
};

export default api;
