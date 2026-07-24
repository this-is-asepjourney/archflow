'use client';

import { X, Info } from 'lucide-react';
import { Node } from '@xyflow/react';
import { useState } from 'react';

interface PropertiesPanelProps {
  node: Node | null;
  onClose: () => void;
  onUpdate: (id: string, data: Record<string, any>) => void;
}

export function PropertiesPanel({ node, onClose, onUpdate }: PropertiesPanelProps) {
  if (!node) return null;

  const data = node.data as Record<string, any>;

  const handleChange = (key: string, value: string) => {
    onUpdate(node.id, { ...data, [key]: value });
  };

  return (
    <div
      className="animate-slide-in"
      style={{
        width: 260,
        height: '100%',
        background: 'hsl(var(--surface))',
        borderLeft: '1px solid hsl(var(--border-subtle))',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1rem',
          borderBottom: '1px solid hsl(var(--border-subtle))',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Info size={14} style={{ color: 'hsl(var(--primary-glow))' }} />
          <span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>Properties</span>
        </div>
        <button onClick={onClose} className="btn btn-ghost btn-icon btn-sm">
          <X size={14} />
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
        {/* Node ID */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.6875rem', color: 'hsl(var(--foreground-subtle))', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
            Node ID
          </div>
          <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'hsl(var(--foreground-muted))', background: 'hsl(var(--surface-2))', padding: '0.375rem 0.5rem', borderRadius: 6, border: '1px solid hsl(var(--border-subtle))' }}>
            {node.id.slice(0, 16)}...
          </div>
        </div>

        <div className="divider" />

        {/* Label */}
        <Field
          label="Label"
          value={data.label || ''}
          onChange={(v) => handleChange('label', v)}
          placeholder="Node label"
        />

        {/* Category */}
        <Field
          label="Category"
          value={data.category || ''}
          onChange={(v) => handleChange('category', v)}
          placeholder="e.g. network, compute"
        />

        {/* Description */}
        <Field
          label="Description"
          value={data.description || ''}
          onChange={(v) => handleChange('description', v)}
          placeholder="Optional description"
          multiline
        />

        <div className="divider" />

        <div style={{ marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--foreground-subtle))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Network
        </div>

        {/* IP */}
        <Field
          label="IP Address"
          value={data.ip || ''}
          onChange={(v) => handleChange('ip', v)}
          placeholder="192.168.1.1"
          mono
        />

        {/* Port */}
        <Field
          label="Port"
          value={data.port || ''}
          onChange={(v) => handleChange('port', v)}
          placeholder="8080"
          mono
        />

        {/* Environment */}
        <Field
          label="Environment"
          value={data.environment || ''}
          onChange={(v) => handleChange('environment', v)}
          placeholder="production / staging"
        />
      </div>

      {/* Position info */}
      <div
        style={{
          padding: '0.75rem 1rem',
          borderTop: '1px solid hsl(var(--border-subtle))',
          fontSize: '0.6875rem',
          color: 'hsl(var(--foreground-subtle))',
          display: 'flex',
          gap: '1rem',
        }}
      >
        <span>x: {Math.round(node.position.x)}</span>
        <span>y: {Math.round(node.position.y)}</span>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  multiline,
  mono,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  mono?: boolean;
}) {
  return (
    <div style={{ marginBottom: '0.875rem' }}>
      <label
        style={{
          display: 'block',
          fontSize: '0.75rem',
          color: 'hsl(var(--foreground-muted))',
          marginBottom: '0.3rem',
        }}
      >
        {label}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="input"
          style={{ resize: 'vertical', fontFamily: mono ? 'monospace' : 'inherit', fontSize: '0.8125rem' }}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="input"
          style={{ fontFamily: mono ? 'monospace' : 'inherit', fontSize: '0.8125rem' }}
        />
      )}
    </div>
  );
}
