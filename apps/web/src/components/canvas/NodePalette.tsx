'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Search } from 'lucide-react';
import { TOPOLOGY_PALETTE } from '@/lib/palette';

interface NodePaletteProps {
  onDragStart: (event: React.DragEvent, nodeData: any) => void;
}

const categoryColors: Record<string, string> = {
  network: '252 87% 67%',
  compute: '142 71% 45%',
  cloud: '192 100% 60%',
  data: '38 92% 50%',
  iot: '280 80% 65%',
  app: '210 80% 60%',
  observability: '0 84% 60%',
  endpoint: '215 20% 60%',
};

const categoryIcons: Record<string, string> = {
  network: '🌐',
  compute: '🖥️',
  cloud: '☁️',
  data: '🗄️',
  iot: '📡',
  app: '🔧',
  observability: '📊',
  endpoint: '💻',
};

export function NodePalette({ onDragStart }: NodePaletteProps) {
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const toggleCategory = (cat: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const filtered = search
    ? TOPOLOGY_PALETTE.map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          item.label.toLowerCase().includes(search.toLowerCase()),
        ),
      })).filter((g) => g.items.length > 0)
    : TOPOLOGY_PALETTE;

  return (
    <div
      style={{
        width: 220,
        height: '100%',
        background: 'hsl(var(--surface))',
        borderRight: '1px solid hsl(var(--border-subtle))',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '0.75rem',
          borderBottom: '1px solid hsl(var(--border-subtle))',
          flexShrink: 0,
        }}
      >
        <div style={{ fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.5rem', color: 'hsl(var(--foreground))' }}>
          Components
        </div>
        <div style={{ position: 'relative' }}>
          <Search
            size={13}
            style={{
              position: 'absolute',
              left: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'hsl(var(--foreground-subtle))',
            }}
          />
          <input
            className="input"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ fontSize: '0.8125rem', padding: '0.375rem 0.5rem 0.375rem 1.75rem' }}
          />
        </div>
      </div>

      {/* Categories */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
        {filtered.map((group) => {
          const isCollapsed = collapsed.has(group.category);
          const color = categoryColors[group.category] || '252 87% 67%';
          return (
            <div key={group.category} style={{ marginBottom: '0.25rem' }}>
              {/* Category header */}
              <button
                onClick={() => toggleCategory(group.category)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  width: '100%',
                  padding: '0.375rem 0.5rem',
                  borderRadius: 6,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'hsl(var(--foreground-muted))',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                <span>{categoryIcons[group.category]}</span>
                <span style={{ flex: 1, textAlign: 'left' }}>{group.label}</span>
                {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
              </button>

              {/* Items */}
              {!isCollapsed && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingLeft: '0.25rem' }}>
                  {group.items.map((item) => (
                    <div
                      key={item.label}
                      draggable
                      onDragStart={(e) =>
                        onDragStart(e, { type: item.type, data: { label: item.label, category: item.category } })
                      }
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.375rem 0.5rem',
                        borderRadius: 6,
                        cursor: 'grab',
                        border: '1px solid transparent',
                        fontSize: '0.8125rem',
                        color: 'hsl(var(--foreground-muted))',
                        transition: 'all 0.15s ease',
                        userSelect: 'none',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = `hsl(${color} / 0.08)`;
                        e.currentTarget.style.borderColor = `hsl(${color} / 0.2)`;
                        e.currentTarget.style.color = 'hsl(var(--foreground))';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.borderColor = 'transparent';
                        e.currentTarget.style.color = 'hsl(var(--foreground-muted))';
                      }}
                    >
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: `hsl(${color})`,
                          flexShrink: 0,
                        }}
                      />
                      {item.label}
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
