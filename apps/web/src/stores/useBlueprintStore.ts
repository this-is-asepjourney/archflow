import { create } from 'zustand';
import api from '@/lib/api';

interface Blueprint {
  id: string;
  projectId: string;
  businessRequirements: string;
  functionalRequirements: string;
  nonFunctionalRequirements: string;
  architectureDecisions: string;
  technicalNotes: string;
  risks: string;
  milestones: string;
  deploymentPlan: string;
  securityPlan: string;
  testingPlan: string;
  maintenancePlan: string;
  updatedAt: string;
}

interface BlueprintState {
  blueprint: Blueprint | null;
  isLoading: boolean;
  error: string | null;
  isSaving: boolean;
  fetchBlueprint: (projectId: string) => Promise<void>;
  updateBlueprint: (projectId: string, data: Partial<Blueprint>) => Promise<void>;
}

export const useBlueprintStore = create<BlueprintState>((set) => ({
  blueprint: null,
  isLoading: false,
  error: null,
  isSaving: false,

  fetchBlueprint: async (projectId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/projects/${projectId}/blueprint`);
      set({ blueprint: response.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch blueprint', isLoading: false });
    }
  },

  updateBlueprint: async (projectId: string, data: Partial<Blueprint>) => {
    set({ isSaving: true, error: null });
    try {
      const response = await api.patch(`/projects/${projectId}/blueprint`, data);
      set({ blueprint: response.data, isSaving: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to update blueprint', isSaving: false });
    }
  },
}));
