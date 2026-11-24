import { create } from 'zustand';
import api from '@/lib/api';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasInitialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null, // Note: keeping token state null as it's in httpOnly cookie now, or we can just leave it for backward compatibility
  isLoading: false,
  isAuthenticated: false,
  hasInitialized: false,

  initialize: async () => {
    if (typeof window === 'undefined') return;
    set({ isLoading: true });
    try {
      const { data } = await api.get('/auth/me');
      set({
        user: data,
        isAuthenticated: true,
        isLoading: false,
        hasInitialized: true,
      });
    } catch {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        hasInitialized: true,
      });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
        hasInitialized: true,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
        hasInitialized: true,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // ignore
    }
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    window.location.href = '/login';
  },
}));
