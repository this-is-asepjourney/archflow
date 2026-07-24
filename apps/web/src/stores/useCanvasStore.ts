import { create } from 'zustand';
import { Node, Edge, Viewport } from '@xyflow/react';
import api from '@/lib/api';

interface CanvasState {
  canvasId: string | null;
  canvasName: string;
  canvasType: string;
  nodes: Node[];
  edges: Edge[];
  viewport: Viewport;
  isDirty: boolean;
  isSaving: boolean;
  history: { nodes: Node[]; edges: Edge[] }[];
  historyIndex: number;

  setCanvas: (canvas: {
    id: string;
    name: string;
    type: string;
    nodes: Node[];
    edges: Edge[];
    viewport: Viewport;
  }) => void;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setViewport: (viewport: Viewport) => void;
  saveCanvas: () => Promise<void>;
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;
  reset: () => void;
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  canvasId: null,
  canvasName: '',
  canvasType: 'TOPOLOGY',
  nodes: [],
  edges: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  isDirty: false,
  isSaving: false,
  history: [],
  historyIndex: -1,

  setCanvas: (canvas) => {
    set({
      canvasId: canvas.id,
      canvasName: canvas.name,
      canvasType: canvas.type,
      nodes: canvas.nodes as Node[],
      edges: canvas.edges as Edge[],
      viewport: canvas.viewport,
      isDirty: false,
      history: [{ nodes: canvas.nodes as Node[], edges: canvas.edges as Edge[] }],
      historyIndex: 0,
    });
  },

  setNodes: (nodes) => {
    set({ nodes, isDirty: true });
  },

  setEdges: (edges) => {
    set({ edges, isDirty: true });
  },

  setViewport: (viewport) => {
    set({ viewport });
  },

  pushHistory: () => {
    const { nodes, edges, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes: [...nodes], edges: [...edges] });
    // Keep only last 50 states
    if (newHistory.length > 50) newHistory.shift();
    set({ history: newHistory, historyIndex: newHistory.length - 1 });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex <= 0) return;
    const prev = history[historyIndex - 1];
    set({
      nodes: prev.nodes,
      edges: prev.edges,
      historyIndex: historyIndex - 1,
      isDirty: true,
    });
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;
    const next = history[historyIndex + 1];
    set({
      nodes: next.nodes,
      edges: next.edges,
      historyIndex: historyIndex + 1,
      isDirty: true,
    });
  },

  saveCanvas: async () => {
    const { canvasId, nodes, edges, viewport } = get();
    if (!canvasId) return;
    set({ isSaving: true });
    try {
      await api.patch(`/projects/placeholder/canvas/${canvasId}`, {
        nodes,
        edges,
        viewport,
      });
      set({ isDirty: false, isSaving: false });
    } catch {
      set({ isSaving: false });
    }
  },

  reset: () => {
    set({
      canvasId: null,
      canvasName: '',
      nodes: [],
      edges: [],
      isDirty: false,
      history: [],
      historyIndex: -1,
    });
  },
}));
