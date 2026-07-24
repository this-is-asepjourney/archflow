'use client';

import {
  Undo2, Redo2, Save, Download, ZoomIn, ZoomOut, Maximize2,
  Grid3x3, ArrowLeft, Loader2, CheckCircle,
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
  historyIndex: number;
  historyLength: number;
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
  historyIndex,
  historyLength,
}: CanvasToolbarProps) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  return (
    <div
      style={{
        height: 52,
        background: 'hsl(var(--surface))',
        borderBottom: '1px solid hsl(var(--border-subtle))',
        display: 'flex',
        alignItems: 'center',
        padding: '0 0.75rem',
        gap: '0.5rem',
        flexShrink: 0,
        zIndex: 10,
      }}
    >
      {/* Back */}
      <Link
        href={`/projects/${projectId}`}
        className="btn btn-ghost btn-icon btn-sm"
        title="Back to project"
        style={{ marginRight: '0.25rem' }}
      >
        <ArrowLeft size={16} />
      </Link>

      <div
        style={{
          width: 1,
          height: 20,
          background: 'hsl(var(--border-subtle))',
          margin: '0 0.25rem',
        }}
      />

      {/* Canvas name & type */}
      <div style={{ marginRight: '0.5rem' }}>
        <div style={{ fontWeight: 600, fontSize: '0.875rem', lineHeight: 1 }}>{canvasName}</div>
        <div style={{ fontSize: '0.6875rem', color: 'hsl(var(--foreground-subtle))', marginTop: '1px' }}>
          {typeLabels[canvasType] ?? canvasType}
        </div>
      </div>

      <div style={{ flex: 1 }} />

      {/* Undo / Redo */}
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

      <div style={{ width: 1, height: 20, background: 'hsl(var(--border-subtle))', margin: '0 0.25rem' }} />

      {/* Zoom */}
      <button className="btn btn-ghost btn-icon btn-sm tooltip" data-tooltip="Zoom in" onClick={() => zoomIn()}>
        <ZoomIn size={16} />
      </button>
      <button className="btn btn-ghost btn-icon btn-sm tooltip" data-tooltip="Zoom out" onClick={() => zoomOut()}>
        <ZoomOut size={16} />
      </button>
      <button className="btn btn-ghost btn-icon btn-sm tooltip" data-tooltip="Fit view" onClick={() => fitView({ padding: 0.1 })}>
        <Maximize2 size={16} />
      </button>

      <div style={{ width: 1, height: 20, background: 'hsl(var(--border-subtle))', margin: '0 0.25rem' }} />

      {/* Export dropdown */}
      <div style={{ position: 'relative' }}>
        <button
          className="btn btn-ghost btn-sm tooltip"
          data-tooltip="Export"
          onClick={onExportPng}
        >
          <Download size={15} />
          Export PNG
        </button>
      </div>
      <button className="btn btn-ghost btn-sm" onClick={onExportJson}>
        JSON
      </button>

      <div style={{ width: 1, height: 20, background: 'hsl(var(--border-subtle))', margin: '0 0.25rem' }} />

      {/* Save */}
      <button
        className="btn btn-primary btn-sm"
        onClick={onSave}
        disabled={!isDirty || isSaving}
      >
        {isSaving ? (
          <>
            <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
            Saving...
          </>
        ) : isDirty ? (
          <>
            <Save size={14} />
            Save
          </>
        ) : (
          <>
            <CheckCircle size={14} />
            Saved
          </>
        )}
      </button>
    </div>
  );
}
