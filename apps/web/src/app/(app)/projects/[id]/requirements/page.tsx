'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useRequirementStore, RequirementType, RequirementStatus, RequirementPriority } from '@/stores/useRequirementStore';
import { Plus, Trash2, Edit3, Loader2 } from 'lucide-react';

export default function RequirementsPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { requirements, isLoading, fetchRequirements, createRequirement, updateRequirement, deleteRequirement } = useRequirementStore();

  const [isAdding, setIsAdding] = useState(false);
  const [newReq, setNewReq] = useState({ title: '', description: '', type: 'FUNCTIONAL' as RequirementType, priority: 'MEDIUM' as RequirementPriority });

  useEffect(() => {
    fetchRequirements(projectId);
  }, [projectId, fetchRequirements]);

  const handleCreate = async () => {
    if (!newReq.title.trim()) return;
    await createRequirement(projectId, newReq);
    setIsAdding(false);
    setNewReq({ title: '', description: '', type: 'FUNCTIONAL', priority: 'MEDIUM' });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'badge-secondary';
      case 'IN_PROGRESS': return 'badge-warning';
      case 'REVIEW': return 'badge-accent';
      case 'APPROVED': return 'badge-primary';
      case 'DONE': return 'badge-success';
      default: return 'badge-secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'hsl(var(--success))';
      case 'MEDIUM': return 'hsl(var(--warning))';
      case 'HIGH': return 'hsl(var(--accent))';
      case 'CRITICAL': return 'hsl(var(--danger))';
      default: return 'hsl(var(--foreground-muted))';
    }
  };

  if (isLoading && requirements.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <Loader2 className="animate-spin text-muted" size={24} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Requirements</h2>
          <p style={{ color: 'hsl(var(--foreground-muted))', fontSize: '0.875rem' }}>
            Manage Business, Functional, and Non-Functional requirements.
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setIsAdding(true)}>
          <Plus size={16} />
          Add Requirement
        </button>
      </div>

      {isAdding && (
        <div className="glass" style={{ padding: '1.5rem', borderRadius: 12, marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>New Requirement</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="text-muted text-sm font-medium mb-1 block">Title</label>
              <input className="input" autoFocus value={newReq.title} onChange={(e) => setNewReq({ ...newReq, title: e.target.value })} />
            </div>
            <div>
              <label className="text-muted text-sm font-medium mb-1 block">Description</label>
              <textarea className="input" rows={2} value={newReq.description} onChange={(e) => setNewReq({ ...newReq, description: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label className="text-muted text-sm font-medium mb-1 block">Type</label>
                <select className="input" value={newReq.type} onChange={(e) => setNewReq({ ...newReq, type: e.target.value as RequirementType })}>
                  <option value="BUSINESS">Business</option>
                  <option value="FUNCTIONAL">Functional</option>
                  <option value="NON_FUNCTIONAL">Non-Functional</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label className="text-muted text-sm font-medium mb-1 block">Priority</label>
                <select className="input" value={newReq.priority} onChange={(e) => setNewReq({ ...newReq, priority: e.target.value as RequirementPriority })}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setIsAdding(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleCreate}>Save</button>
            </div>
          </div>
        </div>
      )}

      {requirements.length === 0 && !isAdding ? (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center', borderStyle: 'dashed' }}>
          <p style={{ color: 'hsl(var(--foreground-muted))' }}>No requirements added yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {requirements.map((req) => (
            <div key={req.id} className="card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <span className={`badge ${getStatusBadgeClass(req.status)}`} style={{ fontSize: '0.65rem' }}>
                    {req.status.replace('_', ' ')}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--foreground-muted))' }}>
                    {req.type.replace('_', ' ')}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: getPriorityColor(req.priority) }}>
                    {req.priority}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, marginBottom: '0.25rem' }}>{req.title}</h3>
                {req.description && (
                  <p style={{ fontSize: '0.875rem', color: 'hsl(var(--foreground-muted))' }}>{req.description}</p>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <select
                  className="input"
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', height: 'auto' }}
                  value={req.status}
                  onChange={(e) => updateRequirement(projectId, req.id, { status: e.target.value as RequirementStatus })}
                >
                  <option value="DRAFT">Draft</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="REVIEW">Review</option>
                  <option value="APPROVED">Approved</option>
                  <option value="DONE">Done</option>
                </select>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'hsl(var(--danger))', justifyContent: 'center' }}
                  onClick={() => { if(confirm('Delete requirement?')) deleteRequirement(projectId, req.id); }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
