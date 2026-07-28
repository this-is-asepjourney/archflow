import { useState } from 'react';
import { ApiEndpoint } from '@/stores/useApiDesignStore';
import { Trash2, Edit2, Save, X } from 'lucide-react';

interface ApiDesignEditorProps {
  endpoint: ApiEndpoint;
  onSave: (id: string, data: Partial<ApiEndpoint>) => void;
  onDelete: (id: string) => void;
  onCancel: () => void;
}

export function ApiDesignEditor({ endpoint, onSave, onDelete, onCancel }: ApiDesignEditorProps) {
  const [formData, setFormData] = useState({
    method: endpoint.method || 'GET',
    path: endpoint.path || '/',
    description: endpoint.description || '',
    requestSchema: endpoint.requestSchema ? JSON.stringify(endpoint.requestSchema, null, 2) : '',
    responseSchema: endpoint.responseSchema ? JSON.stringify(endpoint.responseSchema, null, 2) : '',
  });

  const handleSave = () => {
    try {
      const reqSchema = formData.requestSchema ? JSON.parse(formData.requestSchema) : undefined;
      const resSchema = formData.responseSchema ? JSON.parse(formData.responseSchema) : undefined;
      
      onSave(endpoint.id, {
        method: formData.method,
        path: formData.path,
        description: formData.description,
        requestSchema: reqSchema,
        responseSchema: resSchema,
      });
    } catch (err) {
      alert('Invalid JSON in schema fields');
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'var(--primary)';
      case 'POST': return 'var(--success)';
      case 'PUT': return 'var(--warning)';
      case 'DELETE': return 'var(--danger)';
      default: return 'var(--foreground-muted)';
    }
  };

  return (
    <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <select 
          className="input" 
          value={formData.method} 
          onChange={(e) => setFormData({ ...formData, method: e.target.value })}
          style={{ width: '120px', fontWeight: 600, color: `hsl(${getMethodColor(formData.method)})` }}
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="PATCH">PATCH</option>
          <option value="DELETE">DELETE</option>
        </select>
        <input 
          type="text" 
          className="input" 
          placeholder="/api/users" 
          value={formData.path} 
          onChange={(e) => setFormData({ ...formData, path: e.target.value })}
          style={{ flex: 1, fontFamily: 'monospace' }}
        />
        <button onClick={handleSave} className="btn btn-primary btn-sm tooltip" data-tooltip="Save Endpoint">
          <Save size={16} /> Save
        </button>
        {endpoint.id && (
          <button onClick={() => onDelete(endpoint.id)} className="btn btn-ghost btn-sm text-[hsl(var(--danger))]">
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <input 
        type="text" 
        className="input" 
        placeholder="Brief description of this endpoint..." 
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Request Body Schema (JSON)</label>
          <textarea
            className="input"
            value={formData.requestSchema}
            onChange={(e) => setFormData({ ...formData, requestSchema: e.target.value })}
            placeholder={'{\n  "type": "object",\n  "properties": { ... }\n}'}
            style={{ fontFamily: 'monospace', minHeight: '200px', fontSize: '0.875rem' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Response Schema (JSON)</label>
          <textarea
            className="input"
            value={formData.responseSchema}
            onChange={(e) => setFormData({ ...formData, responseSchema: e.target.value })}
            placeholder={'{\n  "type": "object",\n  "properties": { ... }\n}'}
            style={{ fontFamily: 'monospace', minHeight: '200px', fontSize: '0.875rem' }}
          />
        </div>
      </div>
    </div>
  );
}
