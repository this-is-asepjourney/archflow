'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Search } from 'lucide-react';
import { getPaletteForType } from '@/lib/palette';
import { DeviceIcon } from './nodes/DeviceIcon';
import { Network, Server, Cloud, Database, Cpu, Wrench, Activity, Smartphone, Folders, Type, Box } from 'lucide-react';

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

export function NodePalette({ canvasType, onDragStart }: NodePaletteProps) {
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const PALETTE = getPaletteForType(canvasType);

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
        {filtered.map((group) => {
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
                  {group.items.map((item: Record<string, unknown> & { label: string; type: string; category: string; nodeType?: string; defaultData?: Record<string, unknown> & { shape?: string } }) => (
                    <div
                      key={item.label}
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
                        <DeviceIcon type={item.label} size={16} color={`#${color}`} />
                      </div>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
