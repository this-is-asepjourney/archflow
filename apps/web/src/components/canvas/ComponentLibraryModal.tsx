import React, { useState, useEffect, useCallback } from 'react';
import { X, Upload, Library, Globe, Trash2 } from 'lucide-react';
import { UploadComponentModal } from './UploadComponentModal';
import { api, getComponents } from '@/lib/api';

interface ComponentLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId?: string;
  onUploadSuccess?: () => void;
}

interface ComponentItem {
  id: string;
  name: string;
  category: string;
  typeKey: string;
  iconUrl?: string;
  description?: string;
  vendor?: string;
  visibility: string;
  propertiesSchema?: any;
}

export function ComponentLibraryModal({
  isOpen,
  onClose,
  workspaceId,
  onUploadSuccess,
}: ComponentLibraryModalProps) {
  const [activeTab, setActiveTab] = useState<'my_components' | 'workspace' | 'marketplace'>('my_components');
  const [components, setComponents] = useState<ComponentItem[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchComponents = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getComponents(workspaceId);
      setComponents(res.data);
    } catch (err) {
      console.error('Failed to fetch components:', err);
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    if (isOpen) {
      fetchComponents();
    }
  }, [isOpen, fetchComponents]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this custom component?')) return;
    try {
      await api.delete(`/components/${id}`);
      fetchComponents();
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      console.error('Failed to delete component:', err);
      alert('Failed to delete component. You might not have permission.');
    }
  };

  if (!isOpen) return null;

  let filteredComponents = components;
  if (activeTab === 'marketplace') {
    filteredComponents = components.filter(c => c.visibility === 'public');
  } else if (activeTab === 'workspace') {
    filteredComponents = components.filter(c => c.visibility === 'workspace' || c.visibility === 'public');
  } else {
    // My components
    filteredComponents = components;
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'hsl(var(--surface))',
          width: '90%',
          maxWidth: 900,
          height: '80vh',
          borderRadius: '0.75rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid hsl(var(--border))',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid hsl(var(--border))',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'hsl(var(--surface-2) / 0.5)',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Library size={20} className="text-primary-glow" /> Component Library
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'hsl(var(--foreground-muted))',
              cursor: 'pointer',
              padding: '0.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '0.25rem',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'hsl(var(--surface-3))')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Sidebar */}
          <div style={{ width: 220, borderRight: '1px solid hsl(var(--border))', background: 'hsl(var(--surface-2) / 0.3)', padding: '1rem', display: 'flex', flexDirection: 'column' }}>
            <button
              className="btn btn-primary"
              style={{ width: '100%', marginBottom: '1.5rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
              onClick={() => setIsUploadModalOpen(true)}
            >
              <Upload size={16} /> Upload Component
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {[
                { id: 'my_components', label: 'My Components', icon: <Library size={16} /> },
                { id: 'workspace', label: 'Workspace', icon: <Library size={16} /> },
                { id: 'marketplace', label: 'Marketplace', icon: <Globe size={16} /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'my_components' | 'workspace' | 'marketplace')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.625rem 0.75rem',
                    borderRadius: '0.375rem',
                    border: 'none',
                    background: activeTab === tab.id ? 'hsl(var(--primary) / 0.1)' : 'transparent',
                    color: activeTab === tab.id ? 'hsl(var(--primary))' : 'hsl(var(--foreground-muted))',
                    cursor: 'pointer',
                    fontWeight: activeTab === tab.id ? 600 : 500,
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.background = 'hsl(var(--surface-3) / 0.5)';
                      e.currentTarget.style.color = 'hsl(var(--foreground))';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'hsl(var(--foreground-muted))';
                    }
                  }}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
            {isLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', color: 'hsl(var(--foreground-muted))' }}>
                Loading components...
              </div>
            ) : filteredComponents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'hsl(var(--foreground-muted))', background: 'hsl(var(--surface-2) / 0.3)', borderRadius: '0.5rem', border: '1px dashed hsl(var(--border))' }}>
                <Library size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <h3>No components found</h3>
                <p>Upload a new custom component to see it here.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
                {filteredComponents.map((comp) => (
                  <div
                    key={comp.id}
                    style={{
                      background: 'hsl(var(--surface-2))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      position: 'relative',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: '0.375rem',
                          background: 'hsl(var(--surface-3))',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          overflow: 'hidden',
                        }}
                      >
                        {comp.iconUrl ? (
                          <img src={comp.iconUrl} alt={comp.name} style={{ width: 32, height: 32, objectFit: 'contain' }} />
                        ) : (
                          <span style={{ fontSize: '1.5rem' }}>📦</span>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ margin: '0 0 0.25rem 0', fontWeight: 600, fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {comp.name}
                        </h4>
                        <div style={{ fontSize: '0.75rem', color: 'hsl(var(--foreground-muted))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {comp.category}
                        </div>
                      </div>
                    </div>
                    {comp.description && (
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'hsl(var(--foreground-muted))', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {comp.description}
                      </p>
                    )}
                    <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid hsl(var(--border) / 0.5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.4rem', borderRadius: '0.25rem', background: 'hsl(var(--surface-3))', color: 'hsl(var(--foreground-muted))' }}>
                        {comp.visibility}
                      </span>
                      <button
                        onClick={() => handleDelete(comp.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'hsl(0 84% 60%)',
                          cursor: 'pointer',
                          padding: '0.25rem',
                          borderRadius: '0.25rem',
                        }}
                        title="Delete Component"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <UploadComponentModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        workspaceId={workspaceId}
        onSuccess={() => {
          setIsUploadModalOpen(false);
          fetchComponents();
          if (onUploadSuccess) onUploadSuccess();
        }}
      />
    </div>
  );
}
