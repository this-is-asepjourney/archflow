import React, { useState, useRef } from 'react';
import { X, Upload, Plus, Trash2 } from 'lucide-react';
import { uploadComponentIcon, createComponent } from '@/lib/api';

interface UploadComponentModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId?: string;
  onSuccess?: () => void;
}

interface PropertyField {
  key: string;
  label: string;
  type: string;
  default?: string;
  options?: string[];
  required?: boolean;
}

export function UploadComponentModal({ isOpen, onClose, workspaceId, onSuccess }: UploadComponentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('iot');
  const [description, setDescription] = useState('');
  const [vendor, setVendor] = useState('');
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [visibility, setVisibility] = useState('private');

  // Properties Schema State
  const [fields, setFields] = useState<PropertyField[]>([]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIconFile(file);
      setIconPreview(URL.createObjectURL(file));
    }
  };

  const addField = () => {
    setFields([...fields, { key: '', label: '', type: 'text', options: [], default: '', required: false }]);
  };

  const updateField = (index: number, key: keyof PropertyField, value: unknown) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], [key]: value };
    setFields(newFields);
  };


  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleOptionsChange = (index: number, value: string) => {
    // split by comma for simple dropdown input
    const options = value.split(',').map(s => s.trim()).filter(s => s);
    updateField(index, 'options', options);
  };

  const handleSubmit = async () => {
    if (!name || !iconFile) {
      alert('Name and Icon are required!');
      return;
    }

    // Validate fields
    for (const f of fields) {
      if (!f.key || !f.label) {
        alert('All fields must have a key and a label');
        return;
      }
      if ((f.type === 'dropdown' || f.type === 'multi_select') && (!f.options || f.options.length === 0)) {
        alert(`Dropdown field "${f.label}" must have options`);
        return;
      }
    }

    setIsLoading(true);
    try {
      // 1. Upload Icon
      const uploadRes = await uploadComponentIcon(iconFile);
      const iconUrl = uploadRes.data.url;

      // 2. Create Component
      const typeKey = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      await createComponent({
        name,
        category,
        typeKey,
        iconUrl,
        description,
        vendor,
        propertiesSchema: fields,
        visibility,
        workspaceId,
      });

      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      console.error(err);
      const e = err as { response?: { data?: { message?: string } } };
      alert(e.response?.data?.message || 'Failed to create component');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'hsl(var(--surface))',
          width: '90%',
          maxWidth: 600,
          maxHeight: '85vh',
          borderRadius: '0.75rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid hsl(var(--border))',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid hsl(var(--border))',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'hsl(var(--surface-2) / 0.5)',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Upload Custom Component</h2>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'hsl(var(--foreground-muted))', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Section 1: Basic Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'hsl(var(--primary))' }}>1. Basic Information</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Component Name *</label>
                <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Timbangan Scrap Digital" required />
              </div>
              <div className="form-group">
                <label>Category *</label>
                <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="network">Network</option>
                  <option value="compute">Compute / Server</option>
                  <option value="iot">IoT / Embedded</option>
                  <option value="cloud">Cloud</option>
                  <option value="data">Data / Database</option>
                  <option value="observability">Observability</option>
                  <option value="endpoint">Endpoint</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Icon (PNG/SVG) *</label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div 
                  style={{ width: 64, height: 64, borderRadius: '0.5rem', border: '1px dashed hsl(var(--border))', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'hsl(var(--surface-2))', cursor: 'pointer' }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {iconPreview ? <img src={iconPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '0.25rem' }} /> : <Upload size={24} style={{ color: 'hsl(var(--foreground-muted))' }} />}
                </div>
                <input type="file" accept="image/png, image/svg+xml" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
                <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>Choose File</button>
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea className="input" value={description} onChange={e => setDescription(e.target.value)} rows={2}></textarea>
            </div>
            
            <div className="form-group">
              <label>Vendor / Brand</label>
              <input className="input" value={vendor} onChange={e => setVendor(e.target.value)} placeholder="e.g. Cisco, CAS, etc" />
            </div>
          </div>

          {/* Section 2: Properties Schema */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid hsl(var(--border))', paddingTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'hsl(var(--primary))' }}>2. Properties Schema</h3>
              <button className="btn btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', display: 'flex', gap: '0.4rem', alignItems: 'center' }} onClick={addField}>
                <Plus size={14} /> Add Field
              </button>
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'hsl(var(--foreground-muted))' }}>Define custom fields that will appear in the Properties Panel when this component is selected.</p>

            {fields.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', background: 'hsl(var(--surface-2))', borderRadius: '0.5rem', border: '1px dashed hsl(var(--border))', color: 'hsl(var(--foreground-muted))', fontSize: '0.9rem' }}>
                No custom properties defined. Click &quot;Add Field&quot; to create one.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {fields.map((field, idx) => (
                  <div key={idx} style={{ padding: '1rem', background: 'hsl(var(--surface-2))', borderRadius: '0.5rem', border: '1px solid hsl(var(--border))', display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative' }}>
                    <button onClick={() => removeField(idx)} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'transparent', border: 'none', color: 'hsl(0 84% 60%)', cursor: 'pointer', padding: '0.25rem' }}>
                      <Trash2 size={16} />
                    </button>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', paddingRight: '2rem' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Field Key</label>
                        <input className="input" value={field.key} onChange={e => updateField(idx, 'key', e.target.value)} placeholder="e.g. ip_address" style={{ padding: '0.4rem 0.75rem' }} />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Label</label>
                        <input className="input" value={field.label} onChange={e => updateField(idx, 'label', e.target.value)} placeholder="e.g. IP Address" style={{ padding: '0.4rem 0.75rem' }} />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Type</label>
                        <select className="input" value={field.type} onChange={e => updateField(idx, 'type', e.target.value)} style={{ padding: '0.4rem 0.75rem' }}>
                          <option value="text">Text</option>
                          <option value="number">Number</option>
                          <option value="boolean">Boolean (Toggle)</option>
                          <option value="dropdown">Dropdown (Select)</option>
                          <option value="multi_select">Multi-Select</option>
                        </select>
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Default Value</label>
                        <input className="input" value={field.default || ''} onChange={e => updateField(idx, 'default', e.target.value)} placeholder="Default" style={{ padding: '0.4rem 0.75rem' }} />
                      </div>
                    </div>

                    {(field.type === 'dropdown' || field.type === 'multi_select') && (
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Options (comma separated)</label>
                        <input className="input" value={field.options?.join(', ') || ''} onChange={e => handleOptionsChange(idx, e.target.value)} placeholder="e.g. RS232, RS485, USB" style={{ padding: '0.4rem 0.75rem' }} />
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input type="checkbox" id={`req-${idx}`} checked={field.required} onChange={e => updateField(idx, 'required', e.target.checked)} />
                      <label htmlFor={`req-${idx}`} style={{ fontSize: '0.85rem' }}>Required Field</label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Publish */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid hsl(var(--border))', paddingTop: '1.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'hsl(var(--primary))' }}>3. Visibility & Publish</h3>
            <div className="form-group">
              <label>Visibility</label>
              <select className="input" value={visibility} onChange={e => setVisibility(e.target.value)}>
                <option value="private">Private (Only Me)</option>
                {workspaceId && <option value="workspace">Workspace (All Members)</option>}
                <option value="public">Marketplace (Public)</option>
              </select>
            </div>
          </div>
        </div>

        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderTop: '1px solid hsl(var(--border))',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '1rem',
            background: 'hsl(var(--surface-2) / 0.5)',
          }}
        >
          <button className="btn btn-secondary" onClick={onClose} disabled={isLoading}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={isLoading || !name || !iconFile}>
            {isLoading ? 'Publishing...' : 'Publish Component'}
          </button>
        </div>
      </div>
    </div>
  );
}
