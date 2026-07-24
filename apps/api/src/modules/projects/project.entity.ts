export type CanvasType = 'TOPOLOGY' | 'FLOW' | 'UML' | 'ERD' | 'INFRASTRUCTURE';

export interface Project {
  id: string;
  name: string;
  description?: string;
  workspaceId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
