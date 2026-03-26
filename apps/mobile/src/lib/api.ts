import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('auth_token');
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  register: (data: { email: string; password: string; name: string }) =>
    api.post('/api/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/api/auth/login', data),
  me: () => api.get('/api/auth/me'),
};

// Wardrobe
export const wardrobeApi = {
  getAll: (params?: any) => api.get('/api/wardrobe', { params }),
  upload: (imageUri: string, notes?: string) => {
    const form = new FormData();
    form.append('image', { uri: imageUri, type: 'image/jpeg', name: 'garment.jpg' } as any);
    if (notes) form.append('notes', notes);
    return api.post('/api/wardrobe', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  update: (id: string, data: any) => api.patch(`/api/wardrobe/${id}`, data),
  delete: (id: string) => api.delete(`/api/wardrobe/${id}`),
};

// Outfits
export const outfitApi = {
  getAll: () => api.get('/api/outfits'),
  analyze: (imageUri: string) => {
    const form = new FormData();
    form.append('image', { uri: imageUri, type: 'image/jpeg', name: 'outfit.jpg' } as any);
    return api.post('/api/outfits/analyze', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (id: string) => api.delete(`/api/outfits/${id}`),
};
