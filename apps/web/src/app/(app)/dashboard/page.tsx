'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Plus,
  FolderOpen,
  Network,
  Trash2,
  Edit3,
  Search,
  Building2,
} from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/useAuthStore';

interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  ownerId: string;
  members: { userId: string; role: string }[];
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  workspaceId: string;
  createdAt: string;
}



export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('templateId');
  const { user, initialize } = useAuthStore();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [showNewWorkspace, setShowNewWorkspace] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Edit states
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);
  const [editWorkspaceName, setEditWorkspaceName] = useState('');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editProjectName, setEditProjectName] = useState('');
  const [editProjectDesc, setEditProjectDesc] = useState('');
  
  // Delete prompt state
  const [deletePrompt, setDeletePrompt] = useState<{ type: 'workspace' | 'project', id: string, name: string } | null>(null);

  const fetchProjects = async (workspaceId: string) => {
    try {
      const { data } = await api.get(`/projects?workspaceId=${workspaceId}`);
      setProjects(data);
    } catch {
      setProjects([]);
    }
  };

  const fetchWorkspaces = async () => {
    try {
      const { data } = await api.get('/workspaces');
      setWorkspaces(data);
      if (data.length > 0) {
        setActiveWorkspace(data[0]);
        fetchProjects(data[0].id);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (templateId) {
      setTimeout(() => setShowNewProject(true), 0);
    }
  }, [templateId]);

  useEffect(() => {
    fetchWorkspaces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  const handleSelectWorkspace = (ws: Workspace) => {
    setActiveWorkspace(ws);
    fetchProjects(ws.id);
  };

  const handleUpdateWorkspace = async () => {
    if (!editingWorkspace || !editWorkspaceName.trim()) return;
    try {
      const { data } = await api.patch(`/workspaces/${editingWorkspace.id}`, {
        name: editWorkspaceName,
      });
      setWorkspaces((prev) => prev.map(w => w.id === data.id ? data : w));
      if (activeWorkspace?.id === data.id) {
        setActiveWorkspace(data);
      }
      setEditingWorkspace(null);
    } catch {}
  };

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) return;
    try {
      const { data } = await api.post('/workspaces', { name: newWorkspaceName });
      setWorkspaces((prev) => [...prev, data]);
      setActiveWorkspace(data);
      setProjects([]);
      setNewWorkspaceName('');
      setShowNewWorkspace(false);
    } catch {}
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim() || !activeWorkspace) return;
    try {
      const { data } = await api.post('/projects', {
        name: newProjectName,
        description: newProjectDesc,
        workspaceId: activeWorkspace.id,
        templateId: templateId || undefined,
      });
      setProjects((prev) => [...prev, data]);
      setNewProjectName('');
      setNewProjectDesc('');
      setShowNewProject(false);
      
      // Clear templateId from URL after creation
      if (templateId) {
        router.replace('/dashboard');
      }
      
      router.push(`/projects/${data.id}`);
    } catch {}
  };

  const handleUpdateProject = async () => {
    if (!editingProject || !editProjectName.trim()) return;
    try {
      const { data } = await api.patch(`/projects/${editingProject.id}`, {
        name: editProjectName,
        description: editProjectDesc,
      });
      setProjects((prev) => prev.map(p => p.id === data.id ? data : p));
      setEditingProject(null);
    } catch {}
  };

  const executeDelete = async () => {
    if (!deletePrompt) return;
    try {
      if (deletePrompt.type === 'project') {
        await api.delete(`/projects/${deletePrompt.id}`);
        setProjects((prev) => prev.filter((p) => p.id !== deletePrompt.id));
      } else {
        await api.delete(`/workspaces/${deletePrompt.id}`);
        setWorkspaces((prev) => prev.filter((w) => w.id !== deletePrompt.id));
        if (activeWorkspace?.id === deletePrompt.id) {
          setActiveWorkspace(null);
          setProjects([]);
        }
      }
    } catch {}
    setDeletePrompt(null);
  };

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>
          {greeting()}, {user?.name?.split(' ')[0] ?? 'there'} 👋
        </h1>
        <p style={{ color: 'hsl(var(--foreground-muted))' }}>
          Manage your architecture projects and workspaces.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Workspace Sidebar */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--foreground-subtle))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Workspaces
            </span>
            <button
              onClick={() => setShowNewWorkspace(true)}
              className="btn btn-ghost btn-icon btn-sm"
              title="New workspace"
            >
              <Plus size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {loading ? (
              [...Array(2)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 40, borderRadius: 8 }} />
              ))
            ) : workspaces.length === 0 ? (
              <button
                onClick={() => setShowNewWorkspace(true)}
                className="btn btn-ghost"
                style={{ justifyContent: 'flex-start', color: 'hsl(var(--foreground-muted))' }}
              >
                <Plus size={16} /> Create workspace
              </button>
            ) : (
              workspaces.map((ws) => (
                <div key={ws.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {editingWorkspace?.id === ws.id ? (
                    <div className="glass" style={{ padding: '0.75rem', borderRadius: 8 }}>
                      <input
                        autoFocus
                        className="input"
                        value={editWorkspaceName}
                        onChange={(e) => setEditWorkspaceName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleUpdateWorkspace()}
                        style={{ marginBottom: '0.5rem' }}
                      />
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={handleUpdateWorkspace}>Save</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setEditingWorkspace(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.625rem 0.75rem',
                        borderRadius: 8,
                        background: activeWorkspace?.id === ws.id ? 'hsl(var(--primary) / 0.1)' : 'transparent',
                        border: activeWorkspace?.id === ws.id ? '1px solid hsl(var(--primary) / 0.2)' : '1px solid transparent',
                        color: activeWorkspace?.id === ws.id ? 'hsl(var(--primary-glow))' : 'hsl(var(--foreground-muted))',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onClick={() => handleSelectWorkspace(ws)}
                      className="group"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', overflow: 'hidden' }}>
                        <Building2 size={16} style={{ flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.875rem', fontWeight: activeWorkspace?.id === ws.id ? 500 : 400 }}>
                          {ws.name}
                        </span>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingWorkspace(ws); setEditWorkspaceName(ws.name); }}
                          className="p-1 hover:text-primary transition-colors"
                          title="Edit Workspace"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeletePrompt({ type: 'workspace', id: ws.id, name: ws.name }); }}
                          className="p-1 hover:text-destructive transition-colors"
                          title="Delete Workspace"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {showNewWorkspace && (
            <div
              className="glass"
              style={{ padding: '1rem', borderRadius: 10, marginTop: '0.75rem' }}
            >
              <input
                autoFocus
                className="input"
                placeholder="Workspace name"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateWorkspace()}
                style={{ marginBottom: '0.5rem' }}
              />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={handleCreateWorkspace}>
                  Create
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowNewWorkspace(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Projects Area */}
        <div>
          {activeWorkspace ? (
            <>
              {/* Toolbar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--foreground-subtle))' }} />
                  <input
                    className="input"
                    placeholder="Search projects..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ paddingLeft: '2rem' }}
                  />
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowNewProject(true)}
                >
                  <Plus size={16} />
                  New Project
                </button>
              </div>

              {/* New Project Form */}
              {showNewProject && (
                <div
                  className="glass animate-fade-in"
                  style={{ padding: '1.25rem', borderRadius: 12, marginBottom: '1.5rem' }}
                >
                  <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>
                    {templateId ? 'New Project from Template' : 'New Project'}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <input
                      autoFocus
                      className="input"
                      placeholder="Project name *"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                    />
                    <input
                      className="input"
                      placeholder="Description (optional)"
                      value={newProjectDesc}
                      onChange={(e) => setNewProjectDesc(e.target.value)}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setShowNewProject(false)}>
                        Cancel
                      </button>
                      <button className="btn btn-primary btn-sm" onClick={handleCreateProject}>
                        Create Project
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Edit Project Form */}
              {editingProject && (
                <div
                  className="glass animate-fade-in"
                  style={{ padding: '1.25rem', borderRadius: 12, marginBottom: '1.5rem', border: '1px solid hsl(var(--primary) / 0.5)' }}
                >
                  <h3 style={{ fontWeight: 600, marginBottom: '1rem', color: 'hsl(var(--primary-glow))' }}>
                    Edit Project
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <input
                      autoFocus
                      className="input"
                      placeholder="Project name *"
                      value={editProjectName}
                      onChange={(e) => setEditProjectName(e.target.value)}
                    />
                    <input
                      className="input"
                      placeholder="Description (optional)"
                      value={editProjectDesc}
                      onChange={(e) => setEditProjectDesc(e.target.value)}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditingProject(null)}>
                        Cancel
                      </button>
                      <button className="btn btn-primary btn-sm" onClick={handleUpdateProject}>
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Projects Grid */}
              {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="skeleton" style={{ height: 140, borderRadius: 12 }} />
                  ))}
                </div>
              ) : filteredProjects.length === 0 ? (
                <div
                  className="card"
                  style={{
                    padding: '4rem 2rem',
                    textAlign: 'center',
                    borderStyle: 'dashed',
                  }}
                >
                  <FolderOpen size={40} style={{ color: 'hsl(var(--foreground-subtle))', margin: '0 auto 1rem' }} />
                  <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>No projects yet</h3>
                  <p style={{ color: 'hsl(var(--foreground-muted))', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                    Create your first architecture project in this workspace.
                  </p>
                  <button className="btn btn-primary" onClick={() => setShowNewProject(true)}>
                    <Plus size={16} /> Create Project
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                  {filteredProjects.map((project) => (
                    <div
                      key={project.id}
                      className="card card-interactive animate-fade-in"
                      style={{ padding: '1.25rem', position: 'relative' }}
                      onClick={() => router.push(`/projects/${project.id}`)}
                    >
                      {/* Icon */}
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 10,
                          background: 'hsl(var(--primary) / 0.12)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '1rem',
                          border: '1px solid hsl(var(--primary) / 0.2)',
                        }}
                      >
                        <Network size={20} color="hsl(var(--primary-glow))" />
                      </div>

                      <h3 style={{ fontWeight: 600, marginBottom: '0.375rem', fontSize: '0.9375rem' }}>
                        {project.name}
                      </h3>
                      {project.description && (
                        <p style={{ fontSize: '0.8125rem', color: 'hsl(var(--foreground-muted))', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                          {project.description}
                        </p>
                      )}
                      <div style={{ fontSize: '0.75rem', color: 'hsl(var(--foreground-subtle))' }}>
                        {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>

                      {/* Actions */}
                      <div
                        style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: '0.25rem' }}
                      >
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingProject(project); setEditProjectName(project.name); setEditProjectDesc(project.description || ''); }}
                          className="btn btn-ghost btn-icon btn-sm hover:text-primary transition-colors"
                          style={{ color: 'hsl(var(--foreground-subtle))' }}
                          title="Edit Project"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeletePrompt({ type: 'project', id: project.id, name: project.name }); }}
                          className="btn btn-ghost btn-icon btn-sm hover:text-destructive transition-colors"
                          style={{ color: 'hsl(var(--foreground-subtle))' }}
                          title="Delete Project"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div
              className="card"
              style={{ padding: '4rem 2rem', textAlign: 'center', borderStyle: 'dashed' }}
            >
              <Building2 size={40} style={{ color: 'hsl(var(--foreground-subtle))', margin: '0 auto 1rem' }} />
              <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>No workspace selected</h3>
              <p style={{ color: 'hsl(var(--foreground-muted))', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                Create or select a workspace to get started.
              </p>
              <button className="btn btn-primary" onClick={() => setShowNewWorkspace(true)}>
                <Plus size={16} /> Create Workspace
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deletePrompt && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
        }}>
          <div className="glass animate-fade-in" style={{
            width: '100%', maxWidth: '400px', padding: '1.5rem', borderRadius: '12px', border: '1px solid hsl(var(--destructive) / 0.5)'
          }}>
            <h3 style={{ fontWeight: 600, fontSize: '1.125rem', marginBottom: '0.5rem', color: 'hsl(var(--destructive))' }}>
              Delete {deletePrompt.type === 'workspace' ? 'Workspace' : 'Project'}
            </h3>
            <p style={{ color: 'hsl(var(--foreground-muted))', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Are you sure you want to delete the {deletePrompt.type} <strong style={{ color: 'hsl(var(--foreground))' }}>{deletePrompt.name}</strong>?
              <br/><br/>
              {deletePrompt.type === 'workspace' 
                ? 'This will permanently delete this workspace and ALL projects inside it. This action cannot be undone.' 
                : 'This action is permanent and cannot be undone.'}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setDeletePrompt(null)}>
                Cancel
              </button>
              <button className="btn" style={{ background: 'hsl(var(--destructive))', color: '#fff', border: 'none' }} onClick={executeDelete}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
