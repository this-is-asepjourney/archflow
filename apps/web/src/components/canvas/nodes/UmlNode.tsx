'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from '@xyflow/react';

export interface UmlAttribute {
  id: string;
  visibility: '+' | '-' | '#' | '~';
  name: string;
  type: string;
  isStatic: boolean;
}

export interface UmlMethod {
  id: string;
  visibility: '+' | '-' | '#' | '~';
  name: string;
  returnType: string;
  params: string;
  isStatic: boolean;
  isAbstract: boolean;
}

export interface UmlNodeData {
  label: string;
  stereotype?: string; // e.g. '<<interface>>', '<<abstract>>'
  attributes?: UmlAttribute[];
  methods?: UmlMethod[];
  [key: string]: unknown;
}

const visibilityColor = (v: string) => {
  switch (v) {
    case '+': return 'hsl(142 71% 45%)';
    case '-': return 'hsl(0 84% 60%)';
    case '#': return 'hsl(38 92% 50%)';
    default: return 'hsl(var(--foreground-muted))';
  }
};

const UmlNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as UmlNodeData;
  const attrs: UmlAttribute[] = nodeData.attributes || [];
  const methods: UmlMethod[] = nodeData.methods || [];
  
  const color = '252 87% 67%'; // UML Purple

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
          type={type as any}
          position={Position.Top}
          id={`top-${type}`}
          className={`transition-opacity duration-200 ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
          style={{ background: `hsl(${color})`, border: '2px solid hsl(var(--surface))', width: 12, height: 12, left: type === 'target' ? '40%' : '60%' }}
        />
      ))}
      {['target', 'source'].map((type, idx) => (
        <Handle
          key={`bottom-${idx}`}
          type={type as any}
          position={Position.Bottom}
          id={`bottom-${type}`}
          className={`transition-opacity duration-200 ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
          style={{ background: `hsl(${color})`, border: '2px solid hsl(var(--surface))', width: 12, height: 12, left: type === 'target' ? '40%' : '60%' }}
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
        {/* Class header */}
        <div
          style={{
            background: `linear-gradient(135deg, hsl(${color} / 0.2), hsl(${color} / 0.05))`,
            borderBottom: `1px solid hsl(${color} / 0.3)`,
            padding: '0.75rem 1rem',
            textAlign: 'center',
            boxShadow: `inset 0 1px 2px hsl(0 0% 100% / 0.1)`,
          }}
        >
          {nodeData.stereotype && (
            <div
              style={{
                color: `hsl(${color} / 0.9)`,
                fontSize: '0.65rem',
                marginBottom: 4,
                fontStyle: 'italic',
                fontWeight: 600,
                letterSpacing: '0.02em',
              }}
            >
              {nodeData.stereotype}
            </div>
          )}
          <div
            style={{
              color: 'hsl(var(--foreground))',
              fontWeight: 700,
              fontSize: '0.9375rem',
              fontFamily: 'Inter, sans-serif',
              fontStyle: nodeData.stereotype?.includes('abstract') ? 'italic' : 'normal',
              letterSpacing: '-0.01em',
            }}
          >
            {nodeData.label}
          </div>
        </div>

        {/* Attributes section */}
        <div style={{ borderBottom: '1px solid hsl(var(--border) / 0.3)', padding: '0.25rem 0' }}>
          {attrs.length === 0 ? (
            <div style={{ padding: '0.5rem 1rem', color: 'hsl(var(--foreground-muted))', fontStyle: 'italic' }}>
              — attributes —
            </div>
          ) : (
            attrs.map((a) => (
              <div
                key={a.id}
                style={{
                  display: 'flex',
                  gap: '0.375rem',
                  padding: '0.25rem 1rem',
                  borderBottom: '1px solid hsl(var(--border) / 0.2)',
                }}
              >
                <span style={{ color: visibilityColor(a.visibility), fontWeight: 800, width: 12, textAlign: 'center' }}>{a.visibility}</span>
                <span
                  style={{
                    color: 'hsl(var(--foreground))',
                    textDecoration: a.isStatic ? 'underline' : 'none',
                    fontWeight: 500,
                  }}
                >
                  {a.name}
                </span>
                {a.type && (
                  <span style={{ color: 'hsl(192 100% 65%)', opacity: 0.9 }}>: {a.type}</span>
                )}
              </div>
            ))
          )}
        </div>

        {/* Methods section */}
        <div style={{ padding: '0.25rem 0' }}>
          {methods.length === 0 ? (
            <div style={{ padding: '0.5rem 1rem', color: 'hsl(var(--foreground-muted))', fontStyle: 'italic' }}>
              — methods —
            </div>
          ) : (
            methods.map((m) => (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  gap: '0.375rem',
                  padding: '0.25rem 1rem',
                  borderBottom: '1px solid hsl(var(--border) / 0.2)',
                }}
              >
                <span style={{ color: visibilityColor(m.visibility), fontWeight: 800, width: 12, textAlign: 'center' }}>{m.visibility}</span>
                <span
                  style={{
                    color: 'hsl(var(--foreground))',
                    textDecoration: m.isStatic ? 'underline' : 'none',
                    fontStyle: m.isAbstract ? 'italic' : 'normal',
                    fontWeight: 500,
                    flex: 1,
                  }}
                >
                  {m.name}({m.params})
                </span>
                {m.returnType && (
                  <span style={{ color: 'hsl(192 100% 65%)', opacity: 0.9 }}>: {m.returnType}</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
});

UmlNode.displayName = 'UmlNode';
export default UmlNode;
