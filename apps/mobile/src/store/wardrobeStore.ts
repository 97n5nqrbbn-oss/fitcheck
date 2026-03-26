import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../lib/api';

export interface Garment {
  id: string;
  name: string;
  category: string;
  color: string;
  brand?: string;
  imageUrl: string;
  tags: string[];
  timesWorn: number;
  lastWorn?: string;
  createdAt: string;
}

interface WardrobeState {
  garments: Garment[];
  isLoading: boolean;
  isUploading: boolean;
  error: string | null;
  selectedCategory: string | null;
  fetchGarments: () => Promise<void>;
  addGarment: (imageUri: string, data: Partial<Garment>) => Promise<void>;
  updateGarment: (id: string, data: Partial<Garment>) => Promise<void>;
  deleteGarment: (id: string) => Promise<void>;
  setSelectedCategory: (category: string | null) => void;
  clearError: () => void;
}

export const useWardrobeStore = create<WardrobeState>()(
  persist(
    (set, get) => ({
      garments: [],
      isLoading: false,
      isUploading: false,
      error: null,
      selectedCategory: null,

      fetchGarments: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.get('/wardrobe');
          set({ garments: response.data, isLoading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to fetch wardrobe',
            isLoading: false,
          });
        }
      },

      addGarment: async (imageUri: string, data: Partial<Garment>) => {
        set({ isUploading: true, error: null });
        try {
          const formData = new FormData();
          const filename = imageUri.split('/').pop() || 'garment.jpg';
          const match = /\.([\w]+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : 'image/jpeg';
          formData.append('image', { uri: imageUri, name: filename, type } as any);
          Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined) formData.append(key, String(value));
          });

          const response = await api.post('/wardrobe', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });

          set((state) => ({
            garments: [response.data, ...state.garments],
            isUploading: false,
          }));
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to add garment',
            isUploading: false,
          });
        }
      },

      updateGarment: async (id: string, data: Partial<Garment>) => {
        try {
          const response = await api.put(`/wardrobe/${id}`, data);
          set((state) => ({
            garments: state.garments.map((g) =>
              g.id === id ? { ...g, ...response.data } : g
            ),
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to update garment' });
        }
      },

      deleteGarment: async (id: string) => {
        try {
          await api.delete(`/wardrobe/${id}`);
          set((state) => ({
            garments: state.garments.filter((g) => g.id !== id),
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to delete garment' });
        }
      },

      setSelectedCategory: (category: string | null) =>
        set({ selectedCategory: category }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'wardrobe-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ garments: state.garments }),
    }
  )
);
