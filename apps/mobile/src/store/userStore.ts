import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../lib/api';
import { User } from '../types';

interface UserStats {
  totalOutfits: number;
  totalGarments: number;
  averageConfidenceScore: number;
}

interface UserState {
  profile: User | null;
  stats: UserStats | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  fetchStats: () => Promise<void>;
  updateProfile: (data: Partial<Pick<User, 'displayName' | 'username' | 'bio'>>) => Promise<void>;
  updateAvatar: (imageUri: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: null,
      stats: null,
      isLoading: false,
      isUpdating: false,
      error: null,

      fetchProfile: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.get('/users/me');
          set({ profile: response.data, isLoading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to fetch profile',
            isLoading: false,
          });
        }
      },

      fetchStats: async () => {
        try {
          const response = await api.get('/users/me/stats');
          set({ stats: response.data });
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to fetch stats' });
        }
      },

      updateProfile: async (data) => {
        set({ isUpdating: true, error: null });
        try {
          const response = await api.put('/users/me', data);
          set((state) => ({
            profile: state.profile ? { ...state.profile, ...response.data } : response.data,
            isUpdating: false,
          }));
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to update profile',
            isUpdating: false,
          });
        }
      },

      updateAvatar: async (imageUri: string) => {
        set({ isUpdating: true, error: null });
        try {
          const formData = new FormData();
          const filename = imageUri.split('/').pop() || 'avatar.jpg';
          const match = /\.([\w]+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : 'image/jpeg';
          formData.append('avatar', { uri: imageUri, name: filename, type } as any);

          const response = await api.put('/users/me/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });

          set((state) => ({
            profile: state.profile
              ? { ...state.profile, avatarUrl: response.data.avatarUrl }
              : null,
            isUpdating: false,
          }));
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to update avatar',
            isUpdating: false,
          });
        }
      },

      clearError: () => set({ error: null }),
      reset: () => set({ profile: null, stats: null, error: null }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ profile: state.profile }),
    }
  )
);
