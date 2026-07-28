import { create } from 'zustand';
import { Node, Edge, Viewport } from '@xyflow/react';
import { io, Socket } from 'socket.io-client';
import api from '@/lib/api';

interface CanvasState {
  canvasId: string | null;
  canvasName: string;
  canvasType: string;
  projectId: string | null;
  role: string;
  nodes: Node[];
  edges: Edge[];
  viewport: Viewport;
  isDirty: boolean;
  isSaving: boolean;
  history: { nodes: Node[]; edges: Edge[] }[];
  historyIndex: number;

  setCanvas: (canvas: {
    id: string;
    projectId: string;
    name: string;
    type: string;
    role: string;
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

  // Collaboration
  socket: Socket | null;
  connectSocket: (canvasId: string, user: { id: string; name: string }) => void;
  disconnectSocket: () => void;
  broadcastUpdate: () => void;
  updateFromBroadcast: (nodes: Node[], edges: Edge[]) => void;
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  canvasId: null,
  canvasName: '',
  canvasType: 'TOPOLOGY',
  projectId: null,
  role: 'VIEWER',
  nodes: [],
  edges: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  isDirty: false,
  isSaving: false,
  history: [],
  historyIndex: -1,
  socket: null,

  connectSocket: (canvasId, user) => {
    const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000');
    socket.emit('join-canvas', { canvasId, user });
    
    socket.on('canvas-updated', (data: { nodes: Node[]; edges: Edge[] }) => {
      get().updateFromBroadcast(data.nodes, data.edges);
    });

    set({ socket });
  },

  disconnectSocket: () => {
    const { socket, canvasId } = get();
    if (socket && canvasId) {
      socket.emit('leave-canvas', { canvasId });
      socket.disconnect();
      set({ socket: null });
    }
  },

  broadcastUpdate: () => {
    const { socket, canvasId, nodes, edges } = get();
    if (socket && canvasId) {
      socket.emit('canvas-update', { canvasId, nodes, edges });
    }
  },

  updateFromBroadcast: (nodes, edges) => {
    // We set nodes and edges without triggering another broadcast
    set({ nodes, edges });
  },

  setCanvas: (canvas) => {
    set({
      canvasId: canvas.id,
      projectId: canvas.projectId,
      canvasName: canvas.name,
      canvasType: canvas.type,
      role: canvas.role,
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
    const { canvasId, projectId, nodes, edges, viewport } = get();
    if (!canvasId || !projectId) return;
    set({ isSaving: true });
    try {
      await api.patch(`/projects/${projectId}/canvas/${canvasId}`, {
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
    get().disconnectSocket();
    set({
      canvasId: null,
      projectId: null,
      canvasName: '',
      nodes: [],
      edges: [],
      isDirty: false,
      history: [],
      historyIndex: -1,
    });
  },
}));
