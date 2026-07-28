'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useApiDesignStore } from '@/stores/useApiDesignStore';
import { ApiDesignEditor } from '@/components/api-design/ApiDesignEditor';
import { Loader2, Plus, Download } from 'lucide-react';

export default function ApiDesignPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { endpoints, isLoading, fetchEndpoints, createEndpoint, updateEndpoint, deleteEndpoint, exportSwagger } = useApiDesignStore();
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchEndpoints(projectId);
  }, [projectId, fetchEndpoints]);

  const handleAddNew = () => {
    createEndpoint(projectId, { method: 'GET', path: '/new-endpoint' });
  };

  const handleExport = async () => {
    try {
      const swaggerData = await exportSwagger(projectId);
      const blob = new Blob([JSON.stringify(swaggerData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `swagger-${projectId}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to export swagger');
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <Loader2 className="animate-spin text-muted" size={24} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>API Design</h2>
          <p style={{ color: 'hsl(var(--foreground-muted))', fontSize: '0.875rem' }}>
            Design REST API endpoints and export them to OpenAPI/Swagger.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-outline btn-sm" onClick={handleExport}>
            <Download size={16} /> Export Swagger JSON
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleAddNew}>
            <Plus size={16} /> New Endpoint
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {endpoints.map((ep) => (
          <div key={ep.id}>
            {editingId === ep.id ? (
              <ApiDesignEditor
                endpoint={ep}
                onSave={async (id, data) => {
                  await updateEndpoint(projectId, id, data);
                  setEditingId(null);
                }}
                onDelete={async (id) => {
                  await deleteEndpoint(projectId, id);
                  setEditingId(null);
                }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div 
                className="card hoverable glass" 
                style={{ padding: '1rem', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                onClick={() => setEditingId(ep.id)}
              >
                <div style={{ width: 80, fontWeight: 700, fontSize: '0.875rem', color: `hsl(var(--primary))` }}>
                  {ep.method}
                </div>
                <div style={{ flex: 1, fontFamily: 'monospace', fontSize: '1rem', fontWeight: 600 }}>
                  {ep.path}
                </div>
                <div style={{ flex: 2, color: 'hsl(var(--foreground-muted))', fontSize: '0.875rem' }}>
                  {ep.description}
                </div>
              </div>
            )}
          </div>
        ))}
        {endpoints.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'hsl(var(--foreground-muted))', border: '1px dashed hsl(var(--border-subtle))', borderRadius: 8 }}>
            No API endpoints designed yet. Click "New Endpoint" to begin.
          </div>
        )}
      </div>
    </div>
  );
}
