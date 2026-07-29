'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from '@xyflow/react';

export interface ErdColumn {
  id: string;
  name: string;
  type: string;
  isPk: boolean;
  isFk: boolean;
  isNullable: boolean;
  isUnique: boolean;
}

export interface ErdNodeData {
  label: string;
  tableName?: string;
  columns?: ErdColumn[];
  [key: string]: unknown;
}

const ErdNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as ErdNodeData;
  const tableName = nodeData.tableName || nodeData.label || 'Table';
  const columns: ErdColumn[] = nodeData.columns || [];
  
  const color = '38 92% 50%'; // ERD Orange

  return (
    <div className="group">
      <NodeResizer
        isVisible={selected}
        minWidth={200}
        minHeight={80}
        handleStyle={{ borderRadius: '50%', width: 8, height: 8, border: `2px solid hsl(${color})`, background: 'hsl(var(--surface))' }}
      />
      
      {['target', 'source'].map((type, idx) => (
        <Handle
          key={`top-${idx}`}
          type={type as 'source' | 'target'}
          position={Position.Top}
          id={`top-${type}`}
          className={`transition-opacity duration-200 ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
          style={{
            background: `hsl(${color})`,
            border: '2px solid hsl(var(--surface))',
            width: 12,
            height: 12,
            left: type === 'target' ? '40%' : '60%',
          }}
        />
      ))}
      
      {['target', 'source'].map((type, idx) => (
        <Handle
          key={`bottom-${idx}`}
          type={type as 'source' | 'target'}
          position={Position.Bottom}
          id={`bottom-${type}`}
          className={`transition-opacity duration-200 ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
          style={{
            background: `hsl(${color})`,
            border: '2px solid hsl(var(--surface))',
            width: 12,
            height: 12,
            left: type === 'target' ? '40%' : '60%',
          }}
        />
      ))}

      <Handle
        type="target"
        position={Position.Left}
        id="left-target"
        className={`transition-opacity duration-200 ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
        style={{ background: `hsl(${color})`, border: '2px solid hsl(var(--surface))', width: 12, height: 12 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        className={`transition-opacity duration-200 ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
        style={{ background: `hsl(${color})`, border: '2px solid hsl(var(--surface))', width: 12, height: 12 }}
      />

      <div
        style={{
          background: 'hsl(var(--surface-2) / 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: `1px solid ${selected ? `hsl(${color})` : `hsl(var(--border) / 0.8)`}`,
          borderRadius: 12,
          minWidth: 220,
          overflow: 'hidden',
          fontSize: '0.75rem',
          fontFamily: 'monospace',
          boxShadow: selected
            ? `0 0 0 1px hsl(${color} / 0.5) inset, 0 8px 32px hsl(${color} / 0.25)`
            : '0 4px 16px hsl(0 0% 0% / 0.4), inset 0 1px 1px hsl(0 0% 100% / 0.05)',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: selected ? 'scale(1.02)' : 'scale(1)',
        }}
      >
        {/* Table header */}
        <div
          style={{
            background: `linear-gradient(135deg, hsl(${color} / 0.2), hsl(${color} / 0.05))`,
            borderBottom: `1px solid hsl(${color} / 0.3)`,
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: `inset 0 1px 2px hsl(0 0% 100% / 0.1)`,
          }}
        >
          <span style={{ color: `hsl(${color})`, fontWeight: 800, fontSize: '0.65rem', letterSpacing: '0.05em' }}>
            TABLE
          </span>
          <span
            style={{
              color: 'hsl(var(--foreground))',
              fontWeight: 600,
              fontSize: '0.9rem',
              fontFamily: 'Inter, sans-serif',
              letterSpacing: '-0.01em',
            }}
          >
            {tableName}
          </span>
        </div>

        {/* Columns */}
        {columns.length === 0 ? (
          <div
            style={{
              padding: '1rem',
              color: 'hsl(var(--foreground-muted))',
              textAlign: 'center',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.8rem',
              fontStyle: 'italic',
            }}
          >
            No columns yet — edit in panel
          </div>
        ) : (
          <div style={{ padding: '0.25rem 0' }}>
            {columns.map((col) => (
              <div
                key={col.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.35rem 1rem',
                  borderBottom: '1px solid hsl(var(--border) / 0.3)',
                  backgroundColor: col.isPk ? `hsl(${color} / 0.08)` : 'transparent',
                }}
              >
                {/* PK/FK badges */}
                <div style={{ display: 'flex', gap: '0.25rem', width: 32 }}>
                  {col.isPk && (
                    <span
                      style={{
                        fontSize: '0.55rem',
                        fontWeight: 800,
                        color: `hsl(${color})`,
                        background: `hsl(${color} / 0.15)`,
                        border: `1px solid hsl(${color} / 0.3)`,
                        borderRadius: 3,
                        padding: '1px 3px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      PK
                    </span>
                  )}
                  {col.isFk && (
                    <span
                      style={{
                        fontSize: '0.55rem',
                        fontWeight: 800,
                        color: 'hsl(192 100% 60%)',
                        background: 'hsl(192 100% 60% / 0.15)',
                        border: '1px solid hsl(192 100% 60% / 0.3)',
                        borderRadius: 3,
                        padding: '1px 3px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      FK
                    </span>
                  )}
                </div>
                
                <span
                  style={{
                    flex: 1,
                    color: 'hsl(var(--foreground))',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontWeight: col.isPk ? 600 : 400,
                  }}
                >
                  {col.name}
                </span>
                
                <span
                  style={{
                    color: 'hsl(192 100% 65%)',
                    fontSize: '0.7rem',
                    flexShrink: 0,
                    opacity: 0.9,
                  }}
                >
                  {col.type}
                </span>
                
                {col.isNullable && (
                  <span style={{ color: 'hsl(var(--foreground-muted))', fontSize: '0.7rem', fontWeight: 600, width: '8px', textAlign: 'center' }}>?</span>
                )}
                {!col.isNullable && (
                  <span style={{ width: '8px' }}></span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

ErdNode.displayName = 'ErdNode';
export default ErdNode;
