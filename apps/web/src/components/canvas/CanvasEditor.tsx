'use client';

import { useCallback, useRef, useEffect, useState, DragEvent } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  BackgroundVariant,
  Node,
  Edge,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { v4 as uuidv4 } from 'uuid';

import { nodeTypes } from './nodes';
import { NodePalette } from './NodePalette';
import { PropertiesPanel } from './PropertiesPanel';
import { CanvasToolbar } from './CanvasToolbar';
import { useCanvasStore } from '@/stores/useCanvasStore';

interface CanvasEditorProps {
  projectId: string;
  canvasId: string;
}

function CanvasEditorInner({ projectId, canvasId }: CanvasEditorProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  const {
    canvasName,
    canvasType,
    nodes: storeNodes,
    edges: storeEdges,
    isDirty,
    isSaving,
    historyIndex,
    history,
    setNodes: setStoreNodes,
    setEdges: setStoreEdges,
    setViewport,
    saveCanvas,
    undo,
    redo,
    pushHistory,
  } = useCanvasStore();

  const [nodes, setNodes, onNodesChange] = useNodesState(storeNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(storeEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  // Sync store → local
  useEffect(() => {
    setNodes(storeNodes);
  }, [storeNodes]);

  useEffect(() => {
    setEdges(storeEdges);
  }, [storeEdges]);

  // Sync local → store on change
  const handleNodesChange = useCallback(
    (changes: any) => {
      onNodesChange(changes);
      // Debounce store update
      setTimeout(() => {
        setNodes((nds) => {
          setStoreNodes(nds);
          return nds;
        });
      }, 0);
    },
    [onNodesChange, setStoreNodes, setNodes],
  );

  const handleEdgesChange = useCallback(
    (changes: any) => {
      onEdgesChange(changes);
      setTimeout(() => {
        setEdges((eds) => {
          setStoreEdges(eds);
          return eds;
        });
      }, 0);
    },
    [onEdgesChange, setStoreEdges, setEdges],
  );

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge: Edge = {
        ...params,
        id: `edge-${uuidv4()}`,
        type: 'smoothstep',
        animated: false,
        style: { stroke: 'hsl(252 87% 67% / 0.6)', strokeWidth: 2 },
      } as Edge;
      setEdges((eds) => {
        const updated = addEdge(newEdge, eds);
        setStoreEdges(updated);
        return updated;
      });
      pushHistory();
    },
    [setEdges, setStoreEdges, pushHistory],
  );

  // Drag & drop from palette
  const onDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      const raw = e.dataTransfer.getData('application/archflow-node');
      if (!raw) return;

      const { type, data } = JSON.parse(raw);
      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });

      const newNode: Node = {
        id: `node-${uuidv4()}`,
        type,
        position,
        data: { ...data },
      };

      setNodes((nds) => {
        const updated = [...nds, newNode];
        setStoreNodes(updated);
        return updated;
      });
      pushHistory();
    },
    [screenToFlowPosition, setNodes, setStoreNodes, pushHistory],
  );

  const handleDragStart = (event: DragEvent, nodeData: any) => {
    event.dataTransfer.setData('application/archflow-node', JSON.stringify(nodeData));
    event.dataTransfer.effectAllowed = 'move';
  };

  // Node selection
  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Update node data from properties panel
  const handleUpdateNodeData = useCallback(
    (id: string, data: Record<string, any>) => {
      setNodes((nds) => {
        const updated = nds.map((n) => (n.id === id ? { ...n, data } : n));
        setStoreNodes(updated);
        setSelectedNode((prev) => (prev?.id === id ? { ...prev, data } : prev));
        return updated;
      });
    },
    [setNodes, setStoreNodes],
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveCanvas();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, saveCanvas]);

  // Export PNG
  const handleExportPng = useCallback(() => {
    const svgEl = reactFlowWrapper.current?.querySelector('.react-flow__viewport') as SVGElement;
    if (!svgEl) return;
    // Use html2canvas approach — simple screenshot via window.print-like
    // For a more robust solution, use html-to-image library
    import('html-to-image').then(({ toPng }) => {
      const viewport = reactFlowWrapper.current?.querySelector('.react-flow__viewport') as HTMLElement;
      if (!viewport) return;
      toPng(reactFlowWrapper.current as HTMLElement, { backgroundColor: 'hsl(222, 47%, 6%)' }).then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `${canvasName || 'canvas'}.png`;
        link.href = dataUrl;
        link.click();
      });
    }).catch(() => alert('Install html-to-image for PNG export'));
  }, [canvasName]);

  // Export JSON
  const handleExportJson = useCallback(() => {
    const data = {
      name: canvasName,
      type: canvasType,
      nodes,
      edges,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${canvasName || 'canvas'}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }, [canvasName, canvasType, nodes, edges]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Toolbar */}
      <CanvasToolbar
        projectId={projectId}
        canvasName={canvasName}
        canvasType={canvasType}
        isDirty={isDirty}
        isSaving={isSaving}
        onSave={saveCanvas}
        onUndo={undo}
        onRedo={redo}
        onExportPng={handleExportPng}
        onExportJson={handleExportJson}
        historyIndex={historyIndex}
        historyLength={history.length}
      />

      {/* Canvas area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left palette */}
        <NodePalette onDragStart={handleDragStart} />

        {/* React Flow canvas */}
        <div ref={reactFlowWrapper} style={{ flex: 1, position: 'relative' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            onDragOver={onDragOver}
            onDrop={onDrop}
            nodeTypes={nodeTypes}
            onMoveEnd={(_, viewport) => setViewport(viewport)}
            fitView
            snapToGrid
            snapGrid={[16, 16]}
            minZoom={0.1}
            maxZoom={4}
            deleteKeyCode="Delete"
            multiSelectionKeyCode="Shift"
            style={{ background: 'hsl(222, 47%, 6%)' }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1}
              color="hsl(222, 30%, 18%)"
            />
            <Controls
              style={{
                background: 'hsl(var(--surface))',
                border: '1px solid hsl(var(--border-subtle))',
                borderRadius: 8,
              }}
            />
            <MiniMap
              style={{
                background: 'hsl(var(--surface-2))',
                border: '1px solid hsl(var(--border-subtle))',
                borderRadius: 8,
              }}
              nodeColor="hsl(252 87% 67% / 0.5)"
              maskColor="hsl(222 47% 6% / 0.8)"
            />
          </ReactFlow>

          {/* Empty state hint */}
          {nodes.length === 0 && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                pointerEvents: 'none',
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🎨</div>
              <h3 style={{ color: 'hsl(var(--foreground-muted))', fontWeight: 600, marginBottom: '0.5rem' }}>
                Drag components here
              </h3>
              <p style={{ color: 'hsl(var(--foreground-subtle))', fontSize: '0.875rem' }}>
                Pull nodes from the left panel to start designing
              </p>
            </div>
          )}
        </div>

        {/* Right properties panel */}
        {selectedNode && (
          <PropertiesPanel
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
            onUpdate={handleUpdateNodeData}
          />
        )}
      </div>
    </div>
  );
}

export function CanvasEditor(props: CanvasEditorProps) {
  return (
    <ReactFlowProvider>
      <CanvasEditorInner {...props} />
    </ReactFlowProvider>
  );
}
