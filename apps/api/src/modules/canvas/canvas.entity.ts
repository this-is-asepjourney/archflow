export type CanvasType =
  'TOPOLOGY' | 'FLOW' | 'UML' | 'ERD' | 'INFRASTRUCTURE' | 'CICD' | 'SEQUENCE';

export interface NodePosition {
  x: number;
  y: number;
}

export interface CanvasNode {
  id: string;
  type: string;
  position: NodePosition;
  data: Record<string, any>;
  style?: Record<string, any>;
}

export interface CanvasEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  label?: string;
  animated?: boolean;
  style?: Record<string, any>;
  data?: Record<string, any>;
}

export interface Canvas {
  id: string;
  projectId: string;
  name: string;
  type: CanvasType;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  viewport: { x: number; y: number; zoom: number };
  createdAt: Date;
  updatedAt: Date;
}
