'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Search } from 'lucide-react';
import { getPaletteForType } from '@/lib/palette';
import { DeviceIcon } from './nodes/DeviceIcon';
import { Network, Server, Cloud, Database, Cpu, Wrench, Activity, Smartphone, Folders, Type, Box, Library } from 'lucide-react';
import { ComponentLibraryModal } from './ComponentLibraryModal';
import { UploadComponentModal } from './UploadComponentModal';
import { api } from '@/lib/api';
import { useParams } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';

interface NodePaletteProps {
  canvasType?: string;
  onDragStart: (event: React.DragEvent, nodeData: Record<string, unknown>) => void;
}

const categoryColors: Record<string, string> = {
  // Topology
  network: '252 87% 67%',
  compute: '142 71% 45%',
  cloud: '192 100% 60%',
  data: '38 92% 50%',
  iot: '280 80% 65%',
  app: '210 80% 60%',
  observability: '0 84% 60%',
  endpoint: '215 20% 60%',
  // ERD
  erd: '38 92% 50%',
  // UML
  'uml-class': '252 87% 67%',
  'uml-usecase': '192 100% 60%',
  // Flow
  'flow-basic': '210 80% 60%',
  'flow-swim': '252 87% 67%',
  'flow-cicd': '142 71% 45%',
};

const categoryIcons: Record<string, React.ReactNode> = {
  network: <Network size={16} />, compute: <Server size={16} />, cloud: <Cloud size={16} />, data: <Database size={16} />,
  iot: <Cpu size={16} />, app: <Wrench size={16} />, observability: <Activity size={16} />, endpoint: <Smartphone size={16} />,
  erd: <Database size={16} />,
  'uml-class': <Folders size={16} />, 'uml-usecase': <Type size={16} />,
  'flow-basic': <Box size={16} />, 'flow-swim': <Box size={16} />, 'flow-cicd': <Box size={16} />,
};

const diagramTypeLabel: Record<string, string> = {
  TOPOLOGY: 'Infrastructure',
  ERD: 'ERD — Database',
  UML: 'UML — Classes',
  FLOW: 'Flow Diagram',
  CICD: 'CI/CD Pipeline',
  SEQUENCE: 'Sequence',
};

interface ComponentItem {
  [key: string]: unknown;
  id: string;
  name: string;
  category: string;
  typeKey: string;
  iconUrl?: string;
  description?: string;
  vendor?: string;
  visibility: string;
  propertiesSchema?: unknown;
  createdById?: string;
}

interface PaletteItem {
  label: string;
  type: string;
  category: string;
  nodeType?: string;
  defaultData?: Record<string, unknown> & { shape?: string; iconUrl?: string; custom?: boolean; id?: string; createdById?: string };
}

interface PaletteGroup {
  category: string;
  label: string;
  items: PaletteItem[];
}

export function NodePalette({ canvasType, onDragStart }: NodePaletteProps) {
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const PALETTE = getPaletteForType(canvasType);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [customComponents, setCustomComponents] = useState<ComponentItem[]>([]);
  const params = useParams();
  const projectId = params?.id as string;
  const [workspaceId, setWorkspaceId] = useState<string | undefined>();
  const [editingComponent, setEditingComponent] = useState<ComponentItem | null>(null);
  const { user } = useAuthStore();

  // Fetch project details to get workspaceId, then fetch components
  useEffect(() => {
    if (!projectId) return;
    api.get(`/projects/${projectId}`)
      .then(res => {
        const wId = res.data.workspaceId;
        setWorkspaceId(wId);
        return api.get(`/components?workspaceId=${wId}`);
      })
      .then(res => setCustomComponents(res.data))
      .catch(err => console.error('Failed to load custom components', err));
  }, [projectId]);

  const toggleCategory = (cat: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const filtered = search
    ? PALETTE.map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          item.label.toLowerCase().includes(search.toLowerCase()),
        ),
      })).filter((g) => g.items.length > 0)
    : PALETTE;

  // Append custom components to the filtered groups
  const finalFiltered: PaletteGroup[] = [...filtered] as PaletteGroup[];
  customComponents.forEach(comp => {
    // If searching, filter custom components
    if (search && !comp.name.toLowerCase().includes(search.toLowerCase())) return;

    let group = finalFiltered.find(g => g.category === comp.category);
    if (!group) {
      group = { category: comp.category, label: comp.category.charAt(0).toUpperCase() + comp.category.slice(1), items: [] };
      finalFiltered.push(group);
    }
    
    // Convert to palette item format
    group.items.push({
      label: comp.name,
      type: 'custom',
      category: comp.category,
      nodeType: comp.typeKey,
      defaultData: {
        id: comp.id,
        createdById: comp.createdById,
        iconUrl: comp.iconUrl,
        custom: true,
        propertiesSchema: comp.propertiesSchema,
        description: comp.description,
        vendor: comp.vendor,
        visibility: comp.visibility,
        name: comp.name,
        typeKey: comp.typeKey,
        category: comp.category,
      }
    });
  });

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this custom component?')) {
      try {
        await api.delete(`/components/${id}`);
        // Refetch components
        api.get(`/components?workspaceId=${workspaceId}`).then(res => setCustomComponents(res.data));
      } catch (err) {
        console.error(err);
        alert('Failed to delete component');
      }
    }
  };

  const handleEdit = (item: PaletteItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const compId = item.defaultData?.id;
    const fullComp = customComponents.find((c) => c.id === compId);
    if (fullComp) {
      setEditingComponent(fullComp);
    }
  };

  return (
    <div
      style={{
        width: 240,
        height: '100%',
        background: 'hsl(var(--surface) / 0.5)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRight: '1px solid hsl(var(--border) / 0.5)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        boxShadow: '1px 0 12px hsl(0 0% 0% / 0.1)',
        zIndex: 40,
      }}
    >
      <style>{`
        .component-item .component-actions {
          display: none;
        }
        .component-item:hover .component-actions {
          display: flex !important;
        }
      `}</style>
      {/* Header */}
      <div
        style={{
          padding: '1rem',
          borderBottom: '1px solid hsl(var(--border) / 0.5)',
          flexShrink: 0,
          background: 'hsl(var(--surface-2) / 0.3)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'hsl(var(--foreground))', letterSpacing: '-0.01em' }}>
            Components
          </div>
          {canvasType && (
            <div style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              color: 'hsl(var(--primary))',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              padding: '0.2rem 0.4rem',
              background: 'hsl(var(--primary) / 0.1)',
              borderRadius: '0.25rem',
              border: '1px solid hsl(var(--primary) / 0.2)',
            }}>
              {diagramTypeLabel[canvasType] || canvasType}
            </div>
          )}
        </div>
        <div style={{ position: 'relative' }}>
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'hsl(var(--foreground-muted))',
            }}
          />
          <input
            className="input"
            placeholder="Search nodes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ 
              fontSize: '0.8125rem', 
              padding: '0.4rem 0.75rem 0.4rem 2rem',
              background: 'hsl(var(--surface-3) / 0.5)',
              border: '1px solid hsl(var(--border))',
              boxShadow: 'inset 0 1px 2px hsl(0 0% 0% / 0.2)',
              borderRadius: '0.5rem',
            }}
          />
        </div>
      </div>

      {/* Categories */}
      <div 
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}
      >
        {finalFiltered.map((group) => {
          const isCollapsed = collapsed.has(group.category);
          const color = categoryColors[group.category] || '252 87% 67%';
          return (
            <div key={group.category} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {/* Category header */}
              <button
                onClick={() => toggleCategory(group.category)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '0.375rem',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'hsl(var(--foreground-muted))',
                  transition: 'color 0.2s ease, background 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'hsl(var(--foreground))';
                  e.currentTarget.style.background = 'hsl(var(--surface-2) / 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'hsl(var(--foreground-muted))';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <span style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  width: 20, 
                  height: 20, 
                  fontSize: '0.9rem',
                  background: `hsl(${color} / 0.15)`,
                  borderRadius: '0.25rem',
                  border: `1px solid hsl(${color} / 0.3)`
                }}>
                  {categoryIcons[group.category] || '📦'}
                </span>
                <span style={{ 
                  flex: 1, 
                  textAlign: 'left', 
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}>
                  {group.label}
                </span>
                <span style={{ color: 'inherit', opacity: 0.6 }}>
                  {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                </span>
              </button>

              {/* Items */}
              {!isCollapsed && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingLeft: '0.25rem' }}>
                  {group.items.map((item: PaletteItem, idx) => (
                    <div
                      className="component-item"
                      key={`${item.label}-${idx}`}
                      draggable
                      onDragStart={(e) =>
                        onDragStart(e, {
                          type: item.type,
                          data: {
                            label: item.label,
                            category: item.category,
                            nodeType: item.nodeType || item.label.toLowerCase().replace(/\s+/g, '-'),
                            shape: item.defaultData?.shape,
                            ...(item.defaultData || {}),
                          },
                        })
                      }
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.625rem',
                        padding: '0.4rem 0.625rem',
                        borderRadius: '0.375rem',
                        cursor: 'grab',
                        border: '1px solid transparent',
                        fontSize: '0.8125rem',
                        fontWeight: 500,
                        color: 'hsl(var(--foreground-muted))',
                        transition: 'all 0.15s ease',
                        userSelect: 'none',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = `hsl(${color} / 0.08)`;
                        e.currentTarget.style.borderColor = `hsl(${color} / 0.2)`;
                        e.currentTarget.style.color = 'hsl(var(--foreground))';
                        e.currentTarget.style.transform = 'translateX(2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.borderColor = 'transparent';
                        e.currentTarget.style.color = 'hsl(var(--foreground-muted))';
                        e.currentTarget.style.transform = 'none';
                      }}
                    >
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: `hsl(${color})`,
                        }}
                      >
                        {item.defaultData?.iconUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.defaultData.iconUrl} alt={item.label} style={{ width: 16, height: 16, objectFit: 'contain' }} />
                        ) : (
                          <DeviceIcon type={item.label} size={16} color={`#${color}`} />
                        )}
                      </div>
                      <span style={{ flex: 1 }}>{item.label}</span>
                      
                      {/* Actions for custom components */}
                      {item.defaultData?.custom && item.defaultData?.createdById === user?.id && (
                        <div className="component-actions" style={{ display: 'none', gap: '0.25rem' }}>
                          <button
                            onClick={(e) => handleEdit(item, e)}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 2, color: 'hsl(var(--foreground-muted))' }}
                            title="Edit Component"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
                          </button>
                          <button
                            onClick={(e) => {
                              if (item.defaultData?.id) {
                                handleDelete(item.defaultData.id, e);
                              }
                            }}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 2, color: 'hsl(var(--destructive))' }}
                            title="Delete Component"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Footer / Component Library Button */}
      <div style={{ padding: '1rem', borderTop: '1px solid hsl(var(--border) / 0.5)', background: 'hsl(var(--surface-2) / 0.3)', flexShrink: 0 }}>
        <button 
          className="btn btn-secondary" 
          style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }}
          onClick={() => setIsLibraryOpen(true)}
        >
          <Library size={16} /> Component Library
        </button>
      </div>

      <ComponentLibraryModal 
        isOpen={isLibraryOpen} 
        onClose={() => setIsLibraryOpen(false)} 
        workspaceId={workspaceId}
        onUploadSuccess={() => {
          // Refetch components
          if (workspaceId) {
            api.get(`/components?workspaceId=${workspaceId}`)
              .then(res => setCustomComponents(res.data));
          }
        }}
      />

      {editingComponent && (
        <UploadComponentModal
          isOpen={true}
          onClose={() => setEditingComponent(null)}
          workspaceId={workspaceId as string}
          initialData={editingComponent}
          onSuccess={() => {
            setEditingComponent(null);
            if (workspaceId) {
              api.get(`/components?workspaceId=${workspaceId}`)
                .then(res => setCustomComponents(res.data));
            }
          }}
        />
      )}
    </div>
  );
}
