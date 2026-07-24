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
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,

  initialize: () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('archflow_token');
    const userStr = localStorage.getItem('archflow_user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ user, token, isAuthenticated: true });
      } catch {
        localStorage.removeItem('archflow_token');
        localStorage.removeItem('archflow_user');
      }
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      const { user, access_token } = data;
      localStorage.setItem('archflow_token', access_token);
      localStorage.setItem('archflow_user', JSON.stringify(user));
      set({ user, token: access_token, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      const { user, access_token } = data;
      localStorage.setItem('archflow_token', access_token);
      localStorage.setItem('archflow_user', JSON.stringify(user));
      set({ user, token: access_token, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('archflow_token');
    localStorage.removeItem('archflow_user');
    set({ user: null, token: null, isAuthenticated: false });
    window.location.href = '/login';
  },
}));
