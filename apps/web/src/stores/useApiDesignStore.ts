import { create } from 'zustand';
import api from '@/lib/api';

export interface ApiEndpoint {
  id: string;
  projectId: string;
  method: string;
  path: string;
  description?: string;
  requestSchema?: any;
  responseSchema?: any;
}

interface ApiDesignState {
  endpoints: ApiEndpoint[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  fetchEndpoints: (projectId: string) => Promise<void>;
  createEndpoint: (projectId: string, data: Partial<ApiEndpoint>) => Promise<void>;
  updateEndpoint: (projectId: string, id: string, data: Partial<ApiEndpoint>) => Promise<void>;
  deleteEndpoint: (projectId: string, id: string) => Promise<void>;
  exportSwagger: (projectId: string) => Promise<any>;
}

export const useApiDesignStore = create<ApiDesignState>((set) => ({
  endpoints: [],
  isLoading: false,
  isSaving: false,
  error: null,

  fetchEndpoints: async (projectId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get(`/projects/${projectId}/api-endpoints`);
      set({ endpoints: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch API endpoints', isLoading: false });
    }
  },

  createEndpoint: async (projectId: string, data: Partial<ApiEndpoint>) => {
    set({ isSaving: true, error: null });
    try {
      const { data: newEndpoint } = await api.post(`/projects/${projectId}/api-endpoints`, data);
      set((state) => ({
        endpoints: [...state.endpoints, newEndpoint],
        isSaving: false,
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to create endpoint', isSaving: false });
    }
  },

  updateEndpoint: async (projectId: string, id: string, data: Partial<ApiEndpoint>) => {
    set({ isSaving: true, error: null });
    try {
      const { data: updatedEndpoint } = await api.patch(`/projects/${projectId}/api-endpoints/${id}`, data);
      set((state) => ({
        endpoints: state.endpoints.map((ep) => (ep.id === id ? updatedEndpoint : ep)),
        isSaving: false,
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to update endpoint', isSaving: false });
    }
  },

  deleteEndpoint: async (projectId: string, id: string) => {
    set({ isSaving: true, error: null });
    try {
      await api.delete(`/projects/${projectId}/api-endpoints/${id}`);
      set((state) => ({
        endpoints: state.endpoints.filter((ep) => ep.id !== id),
        isSaving: false,
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to delete endpoint', isSaving: false });
    }
  },

  exportSwagger: async (projectId: string) => {
    try {
      const { data } = await api.get(`/projects/${projectId}/api-endpoints/export/swagger`);
      return data;
    } catch (err: any) {
      console.error('Failed to export swagger', err);
      throw err;
    }
  },
}));
