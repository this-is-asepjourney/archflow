'use client';

import {
  Undo2, Redo2, Save, Download, ZoomIn, ZoomOut, Maximize2,
  ArrowLeft, Loader2, CheckCircle, History, LayoutTemplate, Database, Activity
} from 'lucide-react';
import Link from 'next/link';
import { useReactFlow } from '@xyflow/react';

interface CanvasToolbarProps {
  projectId: string;
  canvasName: string;
  canvasType: string;
  isDirty: boolean;
  isSaving: boolean;
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onExportPng: () => void;
  onExportJson: () => void;
  onExportMermaid: () => void;
  onExportPlantUML: () => void;
  onToggleHistory: () => void;
  historyIndex: number;
  historyLength: number;
  onAutoLayout: () => void;
  onImportSchema?: () => void;
  onSimulate?: () => void;
}

const typeLabels: Record<string, string> = {
  TOPOLOGY: 'Topology',
  FLOW: 'Flow',
  ERD: 'ERD',
  UML: 'UML',
  INFRASTRUCTURE: 'Infrastructure',
};

export function CanvasToolbar({
  projectId,
  canvasName,
  canvasType,
  isDirty,
  isSaving,
  onSave,
  onUndo,
  onRedo,
  onExportPng,
  onExportJson,
  onExportMermaid,
  onExportPlantUML,
  onToggleHistory,
  historyIndex,
  historyLength,
  onAutoLayout,
  onImportSchema,
  onSimulate,
}: CanvasToolbarProps) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  return (
    <div
      style={{
        height: 56,
        background: 'hsl(var(--surface) / 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid hsl(var(--border) / 0.5)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 1rem',
        gap: '0.5rem',
        flexShrink: 0,
        zIndex: 50,
        boxShadow: '0 4px 20px hsl(0 0% 0% / 0.2)',
      }}
    >
      {/* Back */}
      <Link
        href={`/projects/${projectId}`}
        className="btn btn-ghost btn-icon btn-sm"
        title="Back to project"
        style={{ marginRight: '0.25rem', borderRadius: '50%' }}
      >
        <ArrowLeft size={18} />
      </Link>

      <div
        style={{
          width: 1,
          height: 24,
          background: 'hsl(var(--border) / 0.5)',
          margin: '0 0.5rem',
        }}
      />

      {/* Canvas name & type */}
      <div style={{ marginRight: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'hsl(var(--foreground))', letterSpacing: '-0.01em' }}>
          {canvasName}
        </div>
        <div style={{ fontSize: '0.7rem', color: 'hsl(var(--primary))', fontWeight: 500, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
          {typeLabels[canvasType] ?? canvasType}
        </div>
      </div>

      <div style={{ flex: 1 }} />

      {/* Undo / Redo */}
      <div style={{ display: 'flex', gap: '0.25rem' }}>
        <button
          className="btn btn-ghost btn-icon btn-sm tooltip"
          data-tooltip="Undo (Ctrl+Z)"
          onClick={onUndo}
          disabled={historyIndex <= 0}
        >
          <Undo2 size={16} />
        </button>
        <button
          className="btn btn-ghost btn-icon btn-sm tooltip"
          data-tooltip="Redo (Ctrl+Y)"
          onClick={onRedo}
          disabled={historyIndex >= historyLength - 1}
        >
          <Redo2 size={16} />
        </button>
      </div>

      <div style={{ width: 1, height: 20, background: 'hsl(var(--border) / 0.5)', margin: '0 0.5rem' }} />

      {/* Zoom */}
      <div style={{ display: 'flex', gap: '0.25rem' }}>
        <button className="btn btn-ghost btn-icon btn-sm tooltip" data-tooltip="Zoom out" onClick={() => zoomOut()}>
          <ZoomOut size={16} />
        </button>
        <button className="btn btn-ghost btn-icon btn-sm tooltip" data-tooltip="Fit view" onClick={() => fitView({ padding: 0.1 })}>
          <Maximize2 size={14} />
        </button>
        <button className="btn btn-ghost btn-icon btn-sm tooltip" data-tooltip="Zoom in" onClick={() => zoomIn()}>
          <ZoomIn size={16} />
        </button>
      </div>

      <div style={{ width: 1, height: 20, background: 'hsl(var(--border) / 0.5)', margin: '0 0.5rem' }} />

      {/* Advanced Features */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {(canvasType === 'TOPOLOGY' || canvasType === 'INFRASTRUCTURE') && onSimulate && (
          <button className="btn btn-ghost btn-sm tooltip" data-tooltip="Simulate Network" onClick={onSimulate} style={{ color: 'hsl(var(--success))' }}>
            <Activity size={16} />
            <span>Simulate</span>
          </button>
        )}
        <button className="btn btn-ghost btn-sm tooltip" data-tooltip="Auto Layout (Top to Bottom)" onClick={onAutoLayout}>
          <LayoutTemplate size={16} />
          <span>Auto Layout</span>
        </button>
        {canvasType === 'ERD' && onImportSchema && (
          <button className="btn btn-ghost btn-sm tooltip" data-tooltip="Import Schema" onClick={onImportSchema}>
            <Database size={16} />
            <span>Import Schema</span>
          </button>
        )}
      </div>

      <div style={{ width: 1, height: 20, background: 'hsl(var(--border) / 0.5)', margin: '0 0.5rem' }} />

      {/* Export dropdown */}
      <div style={{ position: 'relative' }} className="group">
        <button
          className="btn btn-ghost btn-sm tooltip"
          data-tooltip="Export Diagram"
        >
          <Download size={16} />
          <span>Export</span>
        </button>
        
        {/* Dropdown Menu */}
        <div 
          className="absolute right-0 top-full mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out"
          style={{ zIndex: 100 }}
        >
          <div 
            style={{ 
              background: 'hsl(var(--surface-2) / 0.95)',
              backdropFilter: 'blur(12px)',
              border: '1px solid hsl(var(--border))',
              borderRadius: '0.5rem',
              padding: '0.375rem',
              boxShadow: '0 10px 40px -10px hsl(0 0% 0% / 0.5), 0 0 0 1px hsl(var(--border) / 0.5) inset',
            }}
          >
            {[
              { label: 'PNG Image', onClick: onExportPng },
              { label: 'JSON Data', onClick: onExportJson },
              { label: 'Mermaid Code', onClick: onExportMermaid },
              { label: 'PlantUML Code', onClick: onExportPlantUML },
            ].map((item, i) => (
              <button
                key={i}
                onClick={item.onClick}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.8125rem',
                  color: 'hsl(var(--foreground))',
                  borderRadius: '0.25rem',
                  transition: 'background 0.15s ease',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'hsl(var(--surface-3))'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ width: 1, height: 20, background: 'hsl(var(--border) / 0.5)', margin: '0 0.5rem' }} />

      {/* History */}
      <button
        className="btn btn-ghost btn-sm tooltip"
        data-tooltip="Version History"
        onClick={onToggleHistory}
      >
        <History size={16} />
        <span>History</span>
      </button>

      <div style={{ width: 1, height: 20, background: 'hsl(var(--border) / 0.5)', margin: '0 0.5rem' }} />

      {/* Save */}
      <button
        className="btn btn-primary btn-sm"
        onClick={onSave}
        disabled={!isDirty || isSaving}
        style={{
          minWidth: 90,
          padding: '0.5rem 1rem',
          borderRadius: '99px',
          fontWeight: 600,
          boxShadow: isDirty ? '0 4px 14px hsl(var(--primary) / 0.4)' : 'none',
          opacity: (!isDirty && !isSaving) ? 0.6 : 1,
        }}
      >
        {isSaving ? (
          <>
            <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
            <span>Saving</span>
          </>
        ) : isDirty ? (
          <>
            <Save size={16} />
            <span>Save</span>
          </>
        ) : (
          <>
            <CheckCircle size={16} />
            <span>Saved</span>
          </>
        )}
      </button>
    </div>
  );
}
