'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Link2, Loader2, X } from 'lucide-react';

interface CanvasNode {
  id: string;
  type: string;
  data: { label?: string };
}

interface Canvas {
  id: string;
  name: string;
  type: string;
  nodes: CanvasNode[];
}

interface NodeLinkPickerProps {
  projectId: string;
  linkedNodeIds: string[];
  onChange: (nodeIds: string[]) => void;
}

export function NodeLinkPicker({ projectId, linkedNodeIds, onChange }: NodeLinkPickerProps) {
  const [canvases, setCanvases] = useState<Canvas[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    api
      .get(`/projects/${projectId}/canvas`)
      .then((res) => setCanvases(res.data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [projectId, isOpen]);

  const toggleNode = (nodeId: string) => {
    if (linkedNodeIds.includes(nodeId)) {
      onChange(linkedNodeIds.filter((id) => id !== nodeId));
    } else {
      onChange([...linkedNodeIds, nodeId]);
    }
  };

  const allNodes = canvases.flatMap((c) =>
    c.nodes.map((n) => ({
      id: n.id,
      label: n.data?.label || n.type,
      canvasName: c.name,
    })),
  );

  return (
    <div>
      <label className="text-muted text-sm font-medium mb-1 block">Linked Canvas Nodes</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
        {linkedNodeIds.length === 0 && (
          <span style={{ fontSize: '0.75rem', color: 'hsl(var(--foreground-muted))' }}>No nodes linked</span>
        )}
        {linkedNodeIds.map((id) => {
          const node = allNodes.find((n) => n.id === id);
          return (
            <span key={id} className="badge badge-accent" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              {node ? `${node.label} (${node.canvasName})` : id.slice(0, 8)}
              <button
                type="button"
                onClick={() => toggleNode(id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, display: 'flex' }}
              >
                <X size={12} />
              </button>
            </span>
          );
        })}
      </div>
      <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsOpen(!isOpen)}>
        <Link2 size={14} />
        {isOpen ? 'Close Picker' : 'Link to Canvas Nodes'}
      </button>

      {isOpen && (
        <div
          className="glass"
          style={{ marginTop: '0.75rem', padding: '1rem', borderRadius: 8, maxHeight: 240, overflowY: 'auto' }}
        >
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}>
              <Loader2 className="animate-spin text-muted" size={20} />
            </div>
          ) : canvases.length === 0 ? (
            <p style={{ fontSize: '0.875rem', color: 'hsl(var(--foreground-muted))' }}>No canvases found. Create a diagram first.</p>
          ) : (
            canvases.map((canvas) => (
              <div key={canvas.id} style={{ marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--foreground-muted))', marginBottom: '0.5rem' }}>
                  {canvas.name} ({canvas.type})
                </p>
                {canvas.nodes.length === 0 ? (
                  <p style={{ fontSize: '0.75rem', color: 'hsl(var(--foreground-subtle))', paddingLeft: '0.5rem' }}>No nodes</p>
                ) : (
                  canvas.nodes.map((node) => (
                    <label
                      key={node.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.35rem 0.5rem',
                        cursor: 'pointer',
                        borderRadius: 4,
                        fontSize: '0.875rem',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={linkedNodeIds.includes(node.id)}
                        onChange={() => toggleNode(node.id)}
                      />
                      {node.data?.label || node.type}
                    </label>
                  ))
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
