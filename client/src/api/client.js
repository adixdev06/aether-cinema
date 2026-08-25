import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT or Guest ID
api.interceptors.request.use(config => {
  const token = localStorage.getItem('aether_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  let guestId = localStorage.getItem('aether_guest_id');
  if (!guestId) {
    guestId = 'guest_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('aether_guest_id', guestId);
  }
  config.headers['x-guest-id'] = guestId;

  return config;
}, error => Promise.reject(error));

export default api;
