// User types
export interface User {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
}

// Garment types
export type GarmentCategory =
  | 'tops'
  | 'bottoms'
  | 'dresses'
  | 'outerwear'
  | 'shoes'
  | 'accessories'
  | 'activewear'
  | 'other';

export interface Garment {
  id: string;
  userId: string;
  name: string;
  category: GarmentCategory;
  color: string;
  brand?: string;
  imageUrl: string;
  tags: string[];
  timesWorn: number;
  lastWorn?: string;
  createdAt: string;
  updatedAt: string;
}

// Outfit analysis types
export interface OutfitAnalysis {
  id: string;
  userId: string;
  imageUrl: string;
  confidenceScore: number;
  styleRating: number;
  colorHarmony: number;
  fitScore: number;
  feedback: string;
  suggestions: string[];
  tags: string[];
  occasion: string;
  season: string;
  garmentIds?: string[];
  createdAt: string;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Auth types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  username: string;
  displayName?: string;
}

// Navigation types
export type RootStackParamList = {
  '(auth)': undefined;
  '(tabs)': undefined;
};

export type AuthStackParamList = {
  login: undefined;
  register: undefined;
};

export type TabParamList = {
  index: undefined;
  wardrobe: undefined;
  history: undefined;
  profile: undefined;
};

// UI types
export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
}
