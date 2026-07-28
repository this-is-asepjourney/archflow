export type RequirementType = 'BUSINESS' | 'FUNCTIONAL' | 'NON_FUNCTIONAL';
export type RequirementStatus =
  'DRAFT' | 'IN_PROGRESS' | 'REVIEW' | 'APPROVED' | 'DONE';
export type RequirementPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Requirement {
  id: string;
  projectId: string;
  title: string;
  description: string;
  type: RequirementType;
  status: RequirementStatus;
  priority: RequirementPriority;
  linkedNodeIds: string[]; // references canvas nodes
  createdAt: string;
  updatedAt: string;
}
