'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  useRequirementStore,
  Requirement,
  RequirementType,
  RequirementStatus,
  RequirementPriority,
} from '@/stores/useRequirementStore';
import { NodeLinkPicker } from '@/components/requirements/NodeLinkPicker';
import { Plus, Trash2, Edit3, Loader2, Link2 } from 'lucide-react';

type FilterType = 'ALL' | RequirementType;

const TYPE_FILTERS: { label: string; value: FilterType }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Business', value: 'BUSINESS' },
  { label: 'Functional', value: 'FUNCTIONAL' },
  { label: 'Non-Functional', value: 'NON_FUNCTIONAL' },
];

const emptyForm = () => ({
  title: '',
  description: '',
  type: 'FUNCTIONAL' as RequirementType,
  priority: 'MEDIUM' as RequirementPriority,
  linkedNodeIds: [] as string[],
});

export default function RequirementsPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { requirements, isLoading, error, fetchRequirements, createRequirement, updateRequirement, deleteRequirement } =
    useRequirementStore();

  const [filter, setFilter] = useState<FilterType>('ALL');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());

  useEffect(() => {
    fetchRequirements(projectId);
  }, [projectId, fetchRequirements]);

  const filtered =
    filter === 'ALL' ? requirements : requirements.filter((r) => r.type === filter);

  const openEdit = (req: Requirement) => {
    setEditingId(req.id);
    setForm({
      title: req.title,
      description: req.description,
      type: req.type,
      priority: req.priority,
      linkedNodeIds: req.linkedNodeIds || [],
    });
    setIsAdding(false);
  };

  const closeForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setForm(emptyForm());
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    if (editingId) {
      await updateRequirement(projectId, editingId, form);
    } else {
      await createRequirement(projectId, form);
    }
    closeForm();
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

  const showForm = isAdding || editingId;

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
            Manage Business, Functional, and Non-Functional requirements with canvas linking.
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => { closeForm(); setIsAdding(true); }}>
          <Plus size={16} />
          Add Requirement
        </button>
      </div>

      {error && (
        <div className="card" style={{ padding: '0.75rem 1rem', marginBottom: '1rem', borderColor: 'hsl(var(--danger))', color: 'hsl(var(--danger))' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {TYPE_FILTERS.map((f) => (
          <button
            key={f.value}
            className={`btn btn-sm ${filter === f.value ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="glass" style={{ padding: '1.5rem', borderRadius: 12, marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>
            {editingId ? 'Edit Requirement' : 'New Requirement'}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="text-muted text-sm font-medium mb-1 block">Title</label>
              <input className="input" autoFocus value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="text-muted text-sm font-medium mb-1 block">Description</label>
              <textarea className="input" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label className="text-muted text-sm font-medium mb-1 block">Type</label>
                <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as RequirementType })}>
                  <option value="BUSINESS">Business</option>
                  <option value="FUNCTIONAL">Functional</option>
                  <option value="NON_FUNCTIONAL">Non-Functional</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label className="text-muted text-sm font-medium mb-1 block">Priority</label>
                <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as RequirementPriority })}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
            </div>
            <NodeLinkPicker
              projectId={projectId}
              linkedNodeIds={form.linkedNodeIds}
              onChange={(linkedNodeIds) => setForm({ ...form, linkedNodeIds })}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button className="btn btn-ghost btn-sm" onClick={closeForm}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}

      {filtered.length === 0 && !showForm ? (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center', borderStyle: 'dashed' }}>
          <p style={{ color: 'hsl(var(--foreground-muted))' }}>No requirements found.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map((req) => (
            <div key={req.id} className="card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <span className={`badge ${getStatusBadgeClass(req.status)}`} style={{ fontSize: '0.65rem' }}>
                    {req.status.replace('_', ' ')}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--foreground-muted))' }}>
                    {req.type.replace('_', ' ')}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: getPriorityColor(req.priority) }}>
                    {req.priority}
                  </span>
                  {req.linkedNodeIds?.length > 0 && (
                    <span style={{ fontSize: '0.75rem', color: 'hsl(var(--accent))', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Link2 size={12} />
                      {req.linkedNodeIds.length} linked
                    </span>
                  )}
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
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => openEdit(req)} title="Edit">
                    <Edit3 size={14} />
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'hsl(var(--danger))' }}
                    onClick={() => { if (confirm('Delete requirement?')) deleteRequirement(projectId, req.id); }}
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
