import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../lib/api';

export interface OutfitAnalysis {
  id: string;
  imageUrl: string;
  confidenceScore: number;
  styleRating: number;
  feedback: string;
  suggestions: string[];
  tags: string[];
  occasion: string;
  season: string;
  createdAt: string;
}

interface OutfitState {
  outfits: OutfitAnalysis[];
  currentAnalysis: OutfitAnalysis | null;
  isAnalyzing: boolean;
  isLoading: boolean;
  error: string | null;
  analyzeOutfit: (imageUri: string) => Promise<void>;
  fetchOutfits: () => Promise<void>;
  deleteOutfit: (id: string) => Promise<void>;
  clearCurrentAnalysis: () => void;
  clearError: () => void;
}

export const useOutfitStore = create<OutfitState>()(
  persist(
    (set, get) => ({
      outfits: [],
      currentAnalysis: null,
      isAnalyzing: false,
      isLoading: false,
      error: null,

      analyzeOutfit: async (imageUri: string) => {
        set({ isAnalyzing: true, error: null });
        try {
          const formData = new FormData();
          const filename = imageUri.split('/').pop() || 'outfit.jpg';
          const match = /\.([\w]+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : 'image/jpeg';
          formData.append('image', { uri: imageUri, name: filename, type } as any);

          const response = await api.post('/outfits/analyze', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });

          const analysis = response.data;
          set((state) => ({
            currentAnalysis: analysis,
            outfits: [analysis, ...state.outfits],
            isAnalyzing: false,
          }));
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to analyze outfit',
            isAnalyzing: false,
          });
        }
      },

      fetchOutfits: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.get('/outfits');
          set({ outfits: response.data, isLoading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to fetch outfits',
            isLoading: false,
          });
        }
      },

      deleteOutfit: async (id: string) => {
        try {
          await api.delete(`/outfits/${id}`);
          set((state) => ({
            outfits: state.outfits.filter((o) => o.id !== id),
            currentAnalysis:
              state.currentAnalysis?.id === id ? null : state.currentAnalysis,
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to delete outfit' });
        }
      },

      clearCurrentAnalysis: () => set({ currentAnalysis: null }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'outfit-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ outfits: state.outfits }),
    }
  )
);
