import backendApi from './backendAxios';

// ── Product APIs ──────────────────────────────────────────────────────────────

export const getProducts = ({ search = '', category = '', page = 0, size = 20 } = {}) => {
  const params = new URLSearchParams();
  if (search)   params.append('search', search);
  if (category) params.append('category', category);
  params.append('page', page);
  params.append('size', size);
  return backendApi.get(`/products?${params}`);
};

export const getProduct = (id) => backendApi.get(`/products/${id}`);

export const getProductsByCategory = (category, { search = '', page = 0, size = 20 } = {}) => {
  const params = new URLSearchParams({ page, size });
  if (search) params.append('search', search);
  return backendApi.get(`/products/category/${encodeURIComponent(category)}?${params}`);
};

export const searchProducts = (q, { page = 0, size = 20 } = {}) =>
  backendApi.get(`/products/search?q=${encodeURIComponent(q)}&page=${page}&size=${size}`);

export const getCategories = () => backendApi.get('/products/categories');

// ── Listing / ReMatch APIs ────────────────────────────────────────────────────

export const createListing = (formData) =>
  backendApi.post('/rematch/listings', formData);

export const predictPrice = (payload) =>
  backendApi.post('/rematch/price-prediction', payload);

// ── Recommendation APIs ───────────────────────────────────────────────────────

export const getRecommendations = (userId) =>
  backendApi.get(`/recommendations/${userId}`);

export const generateRecommendations = (userId) =>
  backendApi.post(`/recommendations/${userId}/generate`);

export const dismissRecommendation = (id) =>
  backendApi.patch(`/recommendations/${id}/status`, '"DISMISSED"', {
    headers: { 'Content-Type': 'application/json' },
  });

export const getNearbyUsers = (productId) =>
  backendApi.get(`/recommendations/nearby-users/${productId}`);

export const recordBrowse = (userId, category) =>
  backendApi.post(`/recommendations/browse?userId=${userId}&category=${encodeURIComponent(category)}`);

export const recordPurchase = (userId, category) =>
  backendApi.post(`/recommendations/purchase?userId=${userId}&category=${encodeURIComponent(category)}`);

export const explainRecommendation = (id) =>
  backendApi.get(`/recommendations/${id}/explain`);
