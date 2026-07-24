import { create } from 'zustand';
import api from '@/lib/api';

export type RequirementType = 'BUSINESS' | 'FUNCTIONAL' | 'NON_FUNCTIONAL';
export type RequirementStatus = 'DRAFT' | 'IN_PROGRESS' | 'REVIEW' | 'APPROVED' | 'DONE';
export type RequirementPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Requirement {
  id: string;
  projectId: string;
  title: string;
  description: string;
  type: RequirementType;
  status: RequirementStatus;
  priority: RequirementPriority;
  linkedNodeIds: string[];
  createdAt: string;
  updatedAt: string;
}

interface RequirementState {
  requirements: Requirement[];
  isLoading: boolean;
  error: string | null;
  fetchRequirements: (projectId: string) => Promise<void>;
  createRequirement: (projectId: string, data: Partial<Requirement>) => Promise<void>;
  updateRequirement: (projectId: string, id: string, data: Partial<Requirement>) => Promise<void>;
  deleteRequirement: (projectId: string, id: string) => Promise<void>;
}

export const useRequirementStore = create<RequirementState>((set, get) => ({
  requirements: [],
  isLoading: false,
  error: null,

  fetchRequirements: async (projectId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/projects/${projectId}/requirements`);
      set({ requirements: response.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch requirements', isLoading: false });
    }
  },

  createRequirement: async (projectId: string, data: Partial<Requirement>) => {
    try {
      const response = await api.post(`/projects/${projectId}/requirements`, data);
      set({ requirements: [...get().requirements, response.data] });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to create requirement' });
    }
  },

  updateRequirement: async (projectId: string, id: string, data: Partial<Requirement>) => {
    try {
      const response = await api.patch(`/projects/${projectId}/requirements/${id}`, data);
      set({
        requirements: get().requirements.map((r) => (r.id === id ? response.data : r)),
      });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to update requirement' });
    }
  },

  deleteRequirement: async (projectId: string, id: string) => {
    try {
      await api.delete(`/projects/${projectId}/requirements/${id}`);
      set({
        requirements: get().requirements.filter((r) => r.id !== id),
      });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to delete requirement' });
    }
  },
}));
