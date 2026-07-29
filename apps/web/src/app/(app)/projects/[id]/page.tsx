'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Network, Workflow, Database, GitBranch, Cloud, ArrowLeft } from 'lucide-react';
import api from '@/lib/api';

interface Canvas {
  id: string;
  name: string;
  type: string;
  nodes: Record<string, unknown>[];
  edges: Record<string, unknown>[];
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  workspaceId: string;
}

const CANVAS_TYPES = [
  { value: 'TOPOLOGY', label: 'Topology', icon: Network, color: '252 87% 67%', desc: 'Network & infrastructure diagram' },
  { value: 'FLOW', label: 'Flow', icon: Workflow, color: '192 100% 60%', desc: 'Business process & application flow' },
  { value: 'ERD', label: 'ERD', icon: Database, color: '142 71% 45%', desc: 'Database entity-relationship diagram' },
  { value: 'UML', label: 'UML', icon: GitBranch, color: '38 92% 50%', desc: 'UML class, sequence, use case...' },
  { value: 'INFRASTRUCTURE', label: 'Infrastructure', icon: Cloud, color: '210 80% 60%', desc: 'Cloud & container architecture' },
  { value: 'CICD', label: 'CI/CD', icon: Workflow, color: '142 71% 45%', desc: 'DevOps pipeline & deployment flow' },
];

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [canvases, setCanvases] = useState<Canvas[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewCanvas, setShowNewCanvas] = useState(false);
  const [newCanvasName, setNewCanvasName] = useState('');
  const [newCanvasType, setNewCanvasType] = useState('TOPOLOGY');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const fetchProject = async () => {
      try {
        const { data } = await api.get(`/projects/${projectId}`);
        if (mounted) setProject(data);
      } catch {
        router.push('/dashboard');
      }
    };

    const fetchCanvases = async () => {
      if (mounted) setLoading(true);
      try {
        const { data } = await api.get(`/projects/${projectId}/canvas`);
        if (mounted) setCanvases(data);
      } catch {
        if (mounted) setCanvases([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProject();
    fetchCanvases();
    
    return () => { mounted = false; };
  }, [projectId, router]);

  const handleCreateCanvas = async () => {
    const finalName = newCanvasName.trim() || 'Untitled Canvas';
    setIsCreating(true);
    try {
      const { data } = await api.post(`/projects/${projectId}/canvas`, {
        name: finalName,
        type: newCanvasType,
      });
      setCanvases((prev) => [...prev, data]);
      setNewCanvasName('');
      setShowNewCanvas(false);
      router.push(`/projects/${projectId}/canvas/${data.id}`);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      alert('Error creating canvas: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsCreating(false);
    }
  };

  const getTypeInfo = (type: string) => CANVAS_TYPES.find((t) => t.value === type) || CANVAS_TYPES[0];

  return (
    <div className="animate-fade-in">
      {/* Back + Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link href="/dashboard" className="btn btn-ghost btn-icon btn-sm">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{project?.name ?? '...'}</h1>
          {project?.description && (
            <p style={{ color: 'hsl(var(--foreground-muted))', fontSize: '0.875rem', marginTop: '0.125rem' }}>
              {project.description}
            </p>
          )}
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <button className="btn btn-primary" onClick={() => setShowNewCanvas(true)}>
            <Plus size={16} />
            New Canvas
          </button>
        </div>
      </div>

      {/* New Canvas Dialog */}
      {showNewCanvas && (
        <div
          className="glass animate-fade-in"
          style={{ padding: '1.5rem', borderRadius: 12, marginBottom: '2rem' }}
        >
          <h3 style={{ fontWeight: 600, marginBottom: '1.25rem' }}>Create Canvas</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'hsl(var(--foreground-muted))', marginBottom: '0.375rem' }}>
                Canvas name
              </label>
              <input
                autoFocus
                className="input"
                placeholder="e.g. Production Architecture"
                value={newCanvasName}
                onChange={(e) => setNewCanvasName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateCanvas()}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'hsl(var(--foreground-muted))', marginBottom: '0.5rem' }}>
                Canvas type
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.5rem' }}>
                {CANVAS_TYPES.map((ct) => (
                  <button
                    key={ct.value}
                    onClick={() => setNewCanvasType(ct.value)}
                    style={{
                      padding: '0.75rem',
                      borderRadius: 8,
                      border: newCanvasType === ct.value
                        ? `1px solid hsl(${ct.color} / 0.5)`
                        : '1px solid hsl(var(--border))',
                      background: newCanvasType === ct.value
                        ? `hsl(${ct.color} / 0.1)`
                        : 'hsl(var(--surface-2))',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <ct.icon
                      size={18}
                      color={`hsl(${ct.color})`}
                      style={{ marginBottom: '0.375rem' }}
                    />
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'hsl(var(--foreground))' }}>
                      {ct.label}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'hsl(var(--foreground-subtle))', lineHeight: 1.3 }}>
                      {ct.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowNewCanvas(false)} disabled={isCreating}>
                Cancel
              </button>
              <button className="btn btn-primary btn-sm" onClick={handleCreateCanvas} disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create Canvas'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Canvas List */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 130, borderRadius: 12 }} />
          ))}
        </div>
      ) : canvases.length === 0 ? (
        <div
          className="card"
          style={{ padding: '4rem 2rem', textAlign: 'center', borderStyle: 'dashed' }}
        >
          <Network size={40} style={{ color: 'hsl(var(--foreground-subtle))', margin: '0 auto 1rem' }} />
          <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>No canvases yet</h3>
          <p style={{ color: 'hsl(var(--foreground-muted))', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Create your first canvas to start designing your architecture.
          </p>
          <button className="btn btn-primary" onClick={() => setShowNewCanvas(true)}>
            <Plus size={16} /> Create Canvas
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          {canvases.map((canvas) => {
            const typeInfo = getTypeInfo(canvas.type);
            return (
              <div
                key={canvas.id}
                className="card card-interactive"
                style={{ padding: '1.25rem' }}
                onClick={() => router.push(`/projects/${projectId}/canvas/${canvas.id}`)}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: `hsl(${typeInfo.color} / 0.12)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '0.875rem',
                    border: `1px solid hsl(${typeInfo.color} / 0.2)`,
                  }}
                >
                  <typeInfo.icon size={20} color={`hsl(${typeInfo.color})`} />
                </div>
                <h3 style={{ fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.9375rem' }}>
                  {canvas.name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <span className="badge badge-primary" style={{ fontSize: '0.6875rem' }}>
                    {typeInfo.label}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'hsl(var(--foreground-subtle))' }}>
                    {canvas.nodes?.length ?? 0} nodes
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'hsl(var(--foreground-subtle))', marginTop: '0.5rem' }}>
                  {new Date(canvas.createdAt).toLocaleDateString()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
