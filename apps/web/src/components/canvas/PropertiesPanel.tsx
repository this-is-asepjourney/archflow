'use client';

import { X, Info, Plus, Trash2 } from 'lucide-react';
import { Node } from '@xyflow/react';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface PropertiesPanelProps {
  node: Node | null;
  onClose: () => void;
  onUpdate: (id: string, data: Record<string, any>) => void;
}

export function PropertiesPanel({ node, onClose, onUpdate }: PropertiesPanelProps) {
  if (!node) return null;

  const data = node.data as Record<string, any>;
  const nodeType = node.type;

  const handleChange = (key: string, value: any) => {
    onUpdate(node.id, { ...data, [key]: value });
  };

  return (
    <div
      className="animate-slide-in"
      style={{
        width: 280,
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
          <span style={{
            fontSize: '0.65rem',
            background: 'hsl(var(--surface-2))',
            border: '1px solid hsl(var(--border-subtle))',
            borderRadius: 4,
            padding: '0.1rem 0.375rem',
            color: 'hsl(var(--foreground-muted))',
            textTransform: 'uppercase',
          }}>
            {nodeType}
          </span>
        </div>
        <button onClick={onClose} className="btn btn-ghost btn-icon btn-sm">
          <X size={14} />
        </button>
      </div>

      {/* Content — scrollable */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
        {/* Node ID */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.6875rem', color: 'hsl(var(--foreground-subtle))', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
            Node ID
          </div>
          <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'hsl(var(--foreground-muted))', background: 'hsl(var(--surface-2))', padding: '0.375rem 0.5rem', borderRadius: 6, border: '1px solid hsl(var(--border-subtle))' }}>
            {node.id.slice(0, 20)}...
          </div>
        </div>

        <div className="divider" />

        {/* Render panel based on node type */}
        {nodeType === 'erd' && (
          <ErdPanel data={data} onChange={handleChange} />
        )}
        {nodeType === 'uml' && (
          <UmlPanel data={data} onChange={handleChange} />
        )}
        {nodeType === 'flow' && (
          <FlowPanel data={data} onChange={handleChange} />
        )}
        {nodeType === 'topology' && (
          <TopologyPanel data={data} onChange={handleChange} />
        )}
        {!['erd', 'uml', 'flow', 'topology'].includes(nodeType || '') && (
          <TopologyPanel data={data} onChange={handleChange} />
        )}
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

// ─── Topology Panel ────────────────────────────────────────────────────────────
function TopologyPanel({ data, onChange }: { data: Record<string, any>; onChange: (k: string, v: any) => void }) {
  const category = data.category || 'default';

  return (
    <>
      <Field label="Label" value={data.label || ''} onChange={(v) => onChange('label', v)} placeholder="Node label" />
      <Field label="Description" value={data.description || ''} onChange={(v) => onChange('description', v)} placeholder="Optional description" multiline />
      <div className="divider" />
      
      {/* Dynamic Fields by Category */}
      {category === 'compute' && (
        <>
          <SectionTitle>Compute Specs</SectionTitle>
          <Field label="IP Address" value={data.ip || ''} onChange={(v) => onChange('ip', v)} placeholder="192.168.1.100" mono />
          <Field label="OS" value={data.os || ''} onChange={(v) => onChange('os', v)} placeholder="Ubuntu 22.04" />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div style={{ flex: 1 }}><Field label="CPU (Cores)" value={data.cpu || ''} onChange={(v) => onChange('cpu', v)} placeholder="4" mono /></div>
            <div style={{ flex: 1 }}><Field label="RAM (GB)" value={data.ram || ''} onChange={(v) => onChange('ram', v)} placeholder="16" mono /></div>
          </div>
        </>
      )}

      {category === 'network' && (
        <>
          <SectionTitle>Network Configuration</SectionTitle>
          <Field label="IP Address" value={data.ip || ''} onChange={(v) => onChange('ip', v)} placeholder="192.168.1.1" mono />
          <Field label="Subnet Mask" value={data.subnet || ''} onChange={(v) => onChange('subnet', v)} placeholder="255.255.255.0" mono />
          <Field label="Gateway" value={data.gateway || ''} onChange={(v) => onChange('gateway', v)} placeholder="192.168.1.254" mono />
        </>
      )}

      {category === 'data' && (
        <>
          <SectionTitle>Database Configuration</SectionTitle>
          <Field label="Engine" value={data.engine || ''} onChange={(v) => onChange('engine', v)} placeholder="PostgreSQL 15" />
          <Field label="Host / IP" value={data.ip || ''} onChange={(v) => onChange('ip', v)} placeholder="10.0.0.50" mono />
          <Field label="Port" value={data.port || ''} onChange={(v) => onChange('port', v)} placeholder="5432" mono />
          <Field label="Database Name" value={data.dbname || ''} onChange={(v) => onChange('dbname', v)} placeholder="main_db" />
        </>
      )}

      {category === 'cloud' && (
        <>
          <SectionTitle>Cloud Configuration</SectionTitle>
          <Field label="Provider" value={data.provider || ''} onChange={(v) => onChange('provider', v)} placeholder="AWS / GCP" />
          <Field label="Region" value={data.region || ''} onChange={(v) => onChange('region', v)} placeholder="us-east-1" mono />
          <Field label="Instance Type" value={data.instanceType || ''} onChange={(v) => onChange('instanceType', v)} placeholder="t3.medium" mono />
        </>
      )}

      {['app', 'observability', 'endpoint', 'iot', 'default'].includes(category) && (
        <>
          <SectionTitle>Configuration</SectionTitle>
          <Field label="IP / Endpoint" value={data.ip || ''} onChange={(v) => onChange('ip', v)} placeholder="192.168.1.1" mono />
          <Field label="Port" value={data.port || ''} onChange={(v) => onChange('port', v)} placeholder="8080" mono />
          <Field label="Environment" value={data.environment || ''} onChange={(v) => onChange('environment', v)} placeholder="production / staging" />
        </>
      )}
    </>
  );
}

// ─── ERD Panel ────────────────────────────────────────────────────────────────
function ErdPanel({ data, onChange }: { data: Record<string, any>; onChange: (k: string, v: any) => void }) {
  const columns: any[] = data.columns || [];

  const addColumn = () => {
    const newCol = { id: uuidv4(), name: 'column', type: 'VARCHAR', isPk: false, isFk: false, isNullable: true, isUnique: false };
    onChange('columns', [...columns, newCol]);
  };

  const updateColumn = (idx: number, field: string, value: any) => {
    const updated = columns.map((c, i) => i === idx ? { ...c, [field]: value } : c);
    onChange('columns', updated);
  };

  const removeColumn = (idx: number) => {
    onChange('columns', columns.filter((_, i) => i !== idx));
  };

  return (
    <>
      <Field label="Table Name" value={data.tableName || data.label || ''} onChange={(v) => { onChange('tableName', v); onChange('label', v); }} placeholder="table_name" mono />
      <div className="divider" />
      <SectionTitle>Columns</SectionTitle>
      {columns.map((col, idx) => (
        <div key={col.id} style={{ background: 'hsl(var(--surface-2))', borderRadius: 6, border: '1px solid hsl(var(--border-subtle))', padding: '0.5rem', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.375rem' }}>
            <input className="input" style={{ flex: 2, fontSize: '0.8rem', fontFamily: 'monospace' }} placeholder="col_name" value={col.name} onChange={(e) => updateColumn(idx, 'name', e.target.value)} />
            <input className="input" style={{ flex: 1, fontSize: '0.8rem', fontFamily: 'monospace' }} placeholder="type" value={col.type} onChange={(e) => updateColumn(idx, 'type', e.target.value)} />
            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => removeColumn(idx)} style={{ color: 'hsl(var(--danger))', flexShrink: 0 }}>
              <Trash2 size={12} />
            </button>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['isPk', 'isFk', 'isNullable', 'isUnique'].map((flag) => (
              <label key={flag} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', cursor: 'pointer', color: 'hsl(var(--foreground-muted))' }}>
                <input type="checkbox" checked={col[flag]} onChange={(e) => updateColumn(idx, flag, e.target.checked)} style={{ accentColor: 'hsl(var(--primary))' }} />
                {flag.replace('is', '')}
              </label>
            ))}
          </div>
        </div>
      ))}
      <button className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center', borderStyle: 'dashed', borderColor: 'hsl(var(--border))' }} onClick={addColumn}>
        <Plus size={13} /> Add Column
      </button>
    </>
  );
}

// ─── UML Panel ────────────────────────────────────────────────────────────────
function UmlPanel({ data, onChange }: { data: Record<string, any>; onChange: (k: string, v: any) => void }) {
  const attrs: any[] = data.attributes || [];
  const methods: any[] = data.methods || [];
  const VISIBILITIES = ['+', '-', '#', '~'];

  const addAttr = () => onChange('attributes', [...attrs, { id: uuidv4(), visibility: '+', name: 'attribute', type: 'String', isStatic: false }]);
  const updateAttr = (idx: number, field: string, value: any) => onChange('attributes', attrs.map((a, i) => i === idx ? { ...a, [field]: value } : a));
  const removeAttr = (idx: number) => onChange('attributes', attrs.filter((_, i) => i !== idx));

  const addMethod = () => onChange('methods', [...methods, { id: uuidv4(), visibility: '+', name: 'method', returnType: 'void', params: '', isStatic: false, isAbstract: false }]);
  const updateMethod = (idx: number, field: string, value: any) => onChange('methods', methods.map((m, i) => i === idx ? { ...m, [field]: value } : m));
  const removeMethod = (idx: number) => onChange('methods', methods.filter((_, i) => i !== idx));

  return (
    <>
      <Field label="Class Name" value={data.label || ''} onChange={(v) => onChange('label', v)} placeholder="ClassName" />
      <Field label="Stereotype" value={data.stereotype || ''} onChange={(v) => onChange('stereotype', v)} placeholder="<<interface>>" mono />
      <div className="divider" />
      <SectionTitle>Attributes</SectionTitle>
      {attrs.map((a, idx) => (
        <div key={a.id} style={{ display: 'flex', gap: '0.375rem', marginBottom: '0.375rem', alignItems: 'center' }}>
          <select className="input" style={{ width: 44, fontSize: '0.8rem', padding: '0.3rem 0.2rem', fontFamily: 'monospace' }} value={a.visibility} onChange={(e) => updateAttr(idx, 'visibility', e.target.value)}>
            {VISIBILITIES.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          <input className="input" style={{ flex: 2, fontSize: '0.8rem', fontFamily: 'monospace' }} placeholder="name" value={a.name} onChange={(e) => updateAttr(idx, 'name', e.target.value)} />
          <input className="input" style={{ flex: 1, fontSize: '0.8rem', fontFamily: 'monospace' }} placeholder="Type" value={a.type} onChange={(e) => updateAttr(idx, 'type', e.target.value)} />
          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => removeAttr(idx)} style={{ color: 'hsl(var(--danger))' }}><Trash2 size={12} /></button>
        </div>
      ))}
      <button className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center', borderStyle: 'dashed', borderColor: 'hsl(var(--border))', marginBottom: '1rem' }} onClick={addAttr}><Plus size={13} /> Add Attribute</button>

      <SectionTitle>Methods</SectionTitle>
      {methods.map((m, idx) => (
        <div key={m.id} style={{ background: 'hsl(var(--surface-2))', borderRadius: 6, border: '1px solid hsl(var(--border-subtle))', padding: '0.5rem', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '0.375rem' }}>
            <select className="input" style={{ width: 44, fontSize: '0.8rem', padding: '0.3rem 0.2rem', fontFamily: 'monospace' }} value={m.visibility} onChange={(e) => updateMethod(idx, 'visibility', e.target.value)}>
              {VISIBILITIES.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            <input className="input" style={{ flex: 2, fontSize: '0.8rem', fontFamily: 'monospace' }} placeholder="method" value={m.name} onChange={(e) => updateMethod(idx, 'name', e.target.value)} />
            <input className="input" style={{ flex: 1, fontSize: '0.8rem', fontFamily: 'monospace' }} placeholder="return" value={m.returnType} onChange={(e) => updateMethod(idx, 'returnType', e.target.value)} />
            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => removeMethod(idx)} style={{ color: 'hsl(var(--danger))' }}><Trash2 size={12} /></button>
          </div>
          <input className="input" style={{ fontSize: '0.8rem', fontFamily: 'monospace', marginBottom: '0.375rem' }} placeholder="params: String, count: int" value={m.params} onChange={(e) => updateMethod(idx, 'params', e.target.value)} />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', cursor: 'pointer', color: 'hsl(var(--foreground-muted))' }}>
              <input type="checkbox" checked={m.isStatic} onChange={(e) => updateMethod(idx, 'isStatic', e.target.checked)} style={{ accentColor: 'hsl(var(--primary))' }} /> static
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', cursor: 'pointer', color: 'hsl(var(--foreground-muted))' }}>
              <input type="checkbox" checked={m.isAbstract} onChange={(e) => updateMethod(idx, 'isAbstract', e.target.checked)} style={{ accentColor: 'hsl(var(--primary))' }} /> abstract
            </label>
          </div>
        </div>
      ))}
      <button className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center', borderStyle: 'dashed', borderColor: 'hsl(var(--border))' }} onClick={addMethod}><Plus size={13} /> Add Method</button>
    </>
  );
}

// ─── Flow Panel ────────────────────────────────────────────────────────────────
function FlowPanel({ data, onChange }: { data: Record<string, any>; onChange: (k: string, v: any) => void }) {
  const SHAPES = ['process', 'decision', 'start', 'end', 'io', 'document', 'swimlane', 'annotation'];
  return (
    <>
      <Field label="Label" value={data.label || ''} onChange={(v) => onChange('label', v)} placeholder="Step label" />
      <div style={{ marginBottom: '0.875rem' }}>
        <label style={{ display: 'block', fontSize: '0.75rem', color: 'hsl(var(--foreground-muted))', marginBottom: '0.3rem' }}>Shape</label>
        <select className="input" value={data.shape || 'process'} onChange={(e) => onChange('shape', e.target.value)}>
          {SHAPES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>
      <Field label="Description" value={data.description || ''} onChange={(v) => onChange('description', v)} placeholder="Optional" multiline />
    </>
  );
}

// ─── Shared components ─────────────────────────────────────────────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '0.5rem', fontSize: '0.7rem', fontWeight: 600, color: 'hsl(var(--foreground-subtle))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {children}
    </div>
  );
}

function Field({
  label, value, onChange, placeholder, multiline, mono,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; multiline?: boolean; mono?: boolean;
}) {
  return (
    <div style={{ marginBottom: '0.875rem' }}>
      <label style={{ display: 'block', fontSize: '0.75rem', color: 'hsl(var(--foreground-muted))', marginBottom: '0.3rem' }}>
        {label}
      </label>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3} className="input" style={{ resize: 'vertical', fontFamily: mono ? 'monospace' : 'inherit', fontSize: '0.8125rem' }} />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="input" style={{ fontFamily: mono ? 'monospace' : 'inherit', fontSize: '0.8125rem' }} />
      )}
    </div>
  );
}
