// BerryIO API Service
// Auto-detect backend host:
// - Stored custom URL in localStorage (if configured)
// - Vite environment variable VITE_API_BASE_URL
// - On Mobile / Capacitor APK: default to this PC's Wi-Fi IP (override in About)
// - On PC Browser: connect to localhost / current hostname:8000

export const KNOWN_LAN_IPS = [
  '10.1.51.42',    // Current PC Wi-Fi IP
  '172.20.90.108', // Phone Hotspot IP
  '192.168.137.1', // PC Mobile Hotspot IP
];

export const NATIVE_API_CANDIDATES = [
  'http://10.1.51.42:8000',
  'http://172.20.90.108:8000',
  'http://192.168.137.1:8000',
  'http://10.0.2.2:8000',
  'http://localhost:8000',
  'http://127.0.0.1:8000',
];
export const DEFAULT_NATIVE_API_URL = NATIVE_API_CANDIDATES[0];

export function isNativeApp() {
  return (
    window.Capacitor?.isNativePlatform?.() ||
    window.location.protocol === 'capacitor:' ||
    (window.location.hostname === 'localhost' && (window.location.port === '' || window.location.port === '80' || window.location.port === '443'))
  );
}

export function getCandidateUrls() {
  const urls = new Set();

  // 1. Saved custom URL
  const custom = localStorage.getItem('berryio_api_url');
  if (custom && custom.trim()) {
    urls.add(custom.trim().replace(/\/+$/, ''));
  }

  // 2. Vite env var
  if (import.meta.env.VITE_API_BASE_URL) {
    urls.add(import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, ''));
  }

  // 3. Current window hostname if accessible
  if (typeof window !== 'undefined' && window.location?.hostname) {
    const host = window.location.hostname;
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      urls.add(`http://${host}:8000`);
    }
  }

  // 4. Known LAN & Hotspot IPs
  for (const ip of KNOWN_LAN_IPS) {
    urls.add(`http://${ip}:8000`);
  }

  // 5. Emulator & local loopbacks
  urls.add('http://10.0.2.2:8000');
  urls.add('http://localhost:8000');
  urls.add('http://127.0.0.1:8000');

  return Array.from(urls);
}

export function getEffectiveApiUrl() {
  const customUrl = localStorage.getItem('berryio_api_url');
  if (customUrl) return customUrl.replace(/\/+$/, '');

  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '');
  }

  // On browser pointing to a remote host (e.g. phone browser accessing PC at 10.1.51.42:5173)
  if (typeof window !== 'undefined' && window.location?.hostname) {
    const host = window.location.hostname;
    if (host && host !== 'localhost' && host !== '127.0.0.1' && host !== '') {
      return `http://${host}:8000`;
    }
  }

  if (isNativeApp()) {
    return DEFAULT_NATIVE_API_URL;
  }

  return 'http://localhost:8000';
}

export function needsBackendSetup() {
  return false;
}

export let API_BASE_URL = getEffectiveApiUrl();

export function setCustomApiUrl(url) {
  if (url && url.trim()) {
    const formatted = url.trim().replace(/\/+$/, '');
    localStorage.setItem('berryio_api_url', formatted);
    API_BASE_URL = formatted;
  } else {
    localStorage.removeItem('berryio_api_url');
    API_BASE_URL = getEffectiveApiUrl();
  }
}

async function pingUrl(url, timeoutMs = 2500) {
  if (!url) return false;
  const cleanUrl = url.replace(/\/+$/, '');
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${cleanUrl}/api/model-info`, {
      method: 'GET',
      signal: controller.signal,
      cache: 'no-store'
    });
    clearTimeout(timeoutId);
    return res.ok;
  } catch {
    clearTimeout(timeoutId);
    return false;
  }
}

export async function autoDetectBackend(specificUrl = null) {
  if (specificUrl && specificUrl.trim()) {
    const clean = specificUrl.trim().replace(/\/+$/, '');
    const ok = await pingUrl(clean, 3000);
    if (ok) {
      API_BASE_URL = clean;
      localStorage.setItem('berryio_api_url', clean);
      return clean;
    }
    return null;
  }

  const candidates = getCandidateUrls();
  const checks = candidates.map(async (url) => {
    const ok = await pingUrl(url, 2500);
    if (ok) return url;
    throw new Error(`Failed to reach ${url}`);
  });

  try {
    const workingUrl = await Promise.any(checks);
    if (workingUrl) {
      API_BASE_URL = workingUrl;
      localStorage.setItem('berryio_api_url', workingUrl);
      return workingUrl;
    }
  } catch {
    // All candidates failed
  }
  return null;
}

export async function initApiConnection() {
  const current = getEffectiveApiUrl();
  const ok = await pingUrl(current, 1800);
  if (ok) {
    API_BASE_URL = current;
    return true;
  }
  const detected = await autoDetectBackend();
  return Boolean(detected);
}

export async function testApiConnection(targetUrl) {
  if (targetUrl && targetUrl.trim()) {
    const clean = targetUrl.trim().replace(/\/+$/, '');
    const ok = await pingUrl(clean, 3000);
    if (ok) {
      API_BASE_URL = clean;
      localStorage.setItem('berryio_api_url', clean);
      return true;
    }
    return false;
  }
  const detected = await autoDetectBackend();
  return Boolean(detected);
}

export async function fetchNetworkInfo() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/network-info`);
    if (res.ok) return await res.json();
  } catch (e) {
    return null;
  }
}

// ---- Authentication API ----

export async function apiLogin(username, password) {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Login failed');
  // Persist session in localStorage
  localStorage.setItem('berryio_user', JSON.stringify(data.user));
  localStorage.setItem('berryio_token', data.token);
  return data;
}

export async function apiRegister(username, password, name, role, avatar) {
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, name, role, avatar })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Registration failed');
  localStorage.setItem('berryio_user', JSON.stringify(data.user));
  localStorage.setItem('berryio_token', data.token);
  return data;
}

export function apiLogout() {
  localStorage.removeItem('berryio_user');
  localStorage.removeItem('berryio_token');
}

export function getCurrentUser() {
  const userStr = localStorage.getItem('berryio_user');
  const token = localStorage.getItem('berryio_token');
  
  if (!userStr || !token) {
    // Set default farmer user if none exists
    const defaultUser = {
      username: 'farmer_default',
      name: 'Farmer',
      role: 'Farmer',
      avatar: '🌿'
    };
    localStorage.setItem('berryio_user', JSON.stringify(defaultUser));
    localStorage.setItem('berryio_token', 'default:token');
    return { ...defaultUser, token: 'default:token' };
  }
  
  try {
    return { ...JSON.parse(userStr), token };
  } catch {
    // Fallback to default user if parse fails
    const defaultUser = {
      username: 'farmer_default',
      name: 'Farmer',
      role: 'Farmer',
      avatar: '🌿'
    };
    localStorage.setItem('berryio_user', JSON.stringify(defaultUser));
    localStorage.setItem('berryio_token', 'default:token');
    return { ...defaultUser, token: 'default:token' };
  }
}

export async function fetchDemoUsers() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/demo-users`);
    if (res.ok) {
      const data = await res.json();
      return data.users || [];
    }
  } catch (e) {
    // Default demo users as fallback
    return [
      { username: 'john', name: 'Farmer John', role: 'Orchard Grower', avatar: '👨‍🌾', token: 'john:demo' },
      { username: 'sarah', name: 'Dr. Sarah Agri', role: 'Plant Pathologist', avatar: '👩‍🔬', token: 'sarah:demo' }
    ];
  }
}

export function quickLoginAs(demoUser) {
  const userObj = {
    username: demoUser.username,
    name: demoUser.name,
    role: demoUser.role,
    avatar: demoUser.avatar
  };
  localStorage.setItem('berryio_user', JSON.stringify(userObj));
  localStorage.setItem('berryio_token', demoUser.token);
  return userObj;
}

// ---- Prediction API ----

export async function predictLeafImage(imageBlobOrFile, force = false, username = null) {
  const formData = new FormData();
  formData.append('file', imageBlobOrFile, 'leaf_scan.jpg');
  formData.append('force', force ? 'true' : 'false');

  if (username) formData.append('username', username);

  const token = localStorage.getItem('berryio_token');
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const response = await fetch(`${API_BASE_URL}/api/predict`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }

    const json = await response.json();
    return json;
  } catch (error) {
    console.error('[BerryIO Client] Direct API call failed:', error);
    throw error;
  }
}

// ---- User-Isolated History API ----

export async function fetchScanHistory(username = null) {
  const token = localStorage.getItem('berryio_token');
  const activeUser = username || getCurrentUser()?.username;

  const url = activeUser
    ? `${API_BASE_URL}/api/history?username=${encodeURIComponent(activeUser)}`
    : `${API_BASE_URL}/api/history`;

  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(url, { headers });
    if (res.ok) {
      const data = await res.json();
      return data.history || [];
    }
  } catch (e) {
    console.warn('[BerryIO] Could not fetch server history, reading local storage.');
  }

  // Fallback to localStorage
  const local = localStorage.getItem('berryio_history');
  const all = local ? JSON.parse(local) : [];
  return activeUser ? all.filter(item => item.username === activeUser) : all;
}

export async function deleteScanHistory(username = null) {
  const token = localStorage.getItem('berryio_token');
  const activeUser = username || getCurrentUser()?.username;

  const url = activeUser
    ? `${API_BASE_URL}/api/history?username=${encodeURIComponent(activeUser)}`
    : `${API_BASE_URL}/api/history`;

  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    await fetch(url, { method: 'DELETE', headers });
  } catch (e) {
    console.warn('[BerryIO] Server delete failed, clearing local storage.');
  }
  localStorage.removeItem('berryio_history');
}

export async function fetchModelInfo() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/model-info`);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    return {
      app_name: "BerryIO AI",
      model_type: "Colab PyTorch / Intelligent Agricultural Engine",
      device: "cpu",
      classes: ["Leaf Rust", "Disease Free leaves", "Leaf spot", "Powdery Mildew", "Bacterial Blight"]
    };
  }
}
