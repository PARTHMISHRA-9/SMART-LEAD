const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '';
const DEFAULT_TIMEOUT = 12000;

export class ApiError extends Error {
  constructor(message, status) { super(message); this.status = status; }
}

async function request(path, options = {}, retries = 1) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);
  try {
    const response = await fetch(`${API_BASE}${path}`, { ...options, signal: controller.signal, headers: { 'Content-Type': 'application/json', ...(options.headers || {}) } });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new ApiError(payload.error || `Request failed (${response.status})`, response.status);
    return payload;
  } catch (error) {
    if (retries > 0 && !(error instanceof ApiError && error.status < 500)) return request(path, options, retries - 1);
    throw error instanceof ApiError ? error : new ApiError(error.name === 'AbortError' ? 'Request timed out. Please retry.' : 'Unable to reach the API.');
  } finally { clearTimeout(timeout); }
}

export const api = {
  metrics: () => request('/api/metrics'),
  vacancies: strategy => request(`/api/vacancies?strategy=${encodeURIComponent(strategy)}`),
  warRoom: () => request('/api/war-room'),
  radar: () => request('/api/vacancy-radar'),
  timeline: () => request('/api/timeline'),
  setReferenceDate: date => request('/api/config/reference-date', { method: 'POST', body: JSON.stringify({ date }) }),
  launchMission: (siteId, strategy) => request(`/api/recovery-missions/${encodeURIComponent(siteId)}/launch`, { method: 'POST', body: JSON.stringify({ strategy }) }),
  customerProfile: customerId => request(`/api/customers/${encodeURIComponent(customerId)}/profile`),
  pitch: body => request('/api/pitch/generate', { method: 'POST', body: JSON.stringify(body) })
};
