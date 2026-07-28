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
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { v4 as uuidv4 } from 'uuid';

import { nodeTypes } from './nodes';
import { NodePalette } from './NodePalette';
import { PropertiesPanel } from './PropertiesPanel';
import { CanvasToolbar } from './CanvasToolbar';
import { HistoryPanel } from './HistoryPanel';
import { useCanvasStore } from '@/stores/useCanvasStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { exportToMermaid, exportToPlantUML } from '@/utils/exportDiagrams';
import { getLayoutedElements } from '@/utils/layoutElements';
import { ImportSchemaModal } from './ImportSchemaModal';
import { NetworkSimulation } from './NetworkSimulation';

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
    connectSocket,
    disconnectSocket,
    broadcastUpdate,
    role,
  } = useCanvasStore();

  const { user } = useAuthStore();

  const [nodes, setNodes, onNodesChange] = useNodesState(storeNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(storeEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showImportSchema, setShowImportSchema] = useState(false);
  const [showSimulation, setShowSimulation] = useState(false);

  // Sync store → local
  useEffect(() => {
    setNodes(storeNodes);
  }, [storeNodes, setNodes]);

  useEffect(() => {
    setEdges(storeEdges);
  }, [storeEdges, setEdges]);

  // Connect WebSocket on mount
  useEffect(() => {
    if (user && canvasId) {
      connectSocket(canvasId, { id: user.id, name: user.name });
    }
    return () => {
      disconnectSocket();
    };
  }, [user, canvasId, connectSocket, disconnectSocket]);

  // Sync local → store on change
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => {
        const updated = applyNodeChanges(changes, nds);
        setTimeout(() => setStoreNodes(updated), 0);
        return updated;
      });
    },
    [setNodes, setStoreNodes],
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => {
        const updated = applyEdgeChanges(changes, eds);
        setTimeout(() => setStoreEdges(updated), 0);
        return updated;
      });
    },
    [setEdges, setStoreEdges],
  );

  // Derive edge style from diagram type
  const getEdgeDefaults = useCallback((): Partial<Edge> => {
    switch (canvasType) {
      case 'ERD':
        return { type: 'smoothstep', style: { stroke: 'hsl(38 92% 50% / 0.7)', strokeWidth: 2 }, markerEnd: { type: 'arrowclosed' } as any };
      case 'UML':
        return { type: 'smoothstep', style: { stroke: 'hsl(252 87% 67% / 0.7)', strokeWidth: 1.5 }, markerEnd: { type: 'arrowclosed' } as any };
      case 'FLOW':
      case 'CICD':
        return { type: 'smoothstep', animated: true, style: { stroke: 'hsl(210 80% 60% / 0.7)', strokeWidth: 2 }, markerEnd: { type: 'arrowclosed' } as any };
      default:
        return { type: 'smoothstep', style: { stroke: 'hsl(252 87% 67% / 0.6)', strokeWidth: 2 } };
    }
  }, [canvasType]);

  const onConnect = useCallback(
    (params: Connection) => {
      if (role === 'VIEWER') return;
      const newEdge: Edge = {
        ...params,
        id: `edge-${uuidv4()}`,
        ...getEdgeDefaults(),
      } as Edge;
      const updated = addEdge(newEdge, edges);
      setEdges(updated);
      setStoreEdges(updated);
      pushHistory();
      setTimeout(broadcastUpdate, 0);
    },
    [edges, setEdges, setStoreEdges, pushHistory, getEdgeDefaults, broadcastUpdate, role],
  );

  // Drag & drop from palette
  const onDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      if (role === 'VIEWER') return;
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

      const updated = [...nodes, newNode];
      setNodes(updated);
      setStoreEdges(edges); // Ensure edges are synchronized if needed, but here just setStoreNodes
      setStoreNodes(updated);
      pushHistory();
      setTimeout(broadcastUpdate, 0);
    },
    [nodes, edges, screenToFlowPosition, setNodes, setStoreNodes, setStoreEdges, pushHistory, broadcastUpdate, role],
  );

  const handleDragStart = (event: DragEvent, nodeData: Record<string, unknown>) => {
    event.dataTransfer.setData('application/archflow-node', JSON.stringify(nodeData));
    event.dataTransfer.effectAllowed = 'move';
  };

  const onNodeDragStop = useCallback(() => {
    // Only broadcast once dragging stops
    broadcastUpdate();
  }, [broadcastUpdate]);

  // Node selection
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Update node data from properties panel
  const handleUpdateNodeData = useCallback(
    (id: string, data: Record<string, any>) => {
      const updated = nodes.map((n) => (n.id === id ? { ...n, data } : n));
      setNodes(updated);
      setStoreNodes(updated);
      setSelectedNode((prev) => (prev?.id === id ? { ...prev, data } : prev));
      setTimeout(broadcastUpdate, 0);
    },
    [nodes, setNodes, setStoreNodes, broadcastUpdate],
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

  const handleAutoLayout = useCallback(() => {
    if (role === 'VIEWER') return;
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges, 'TB');
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    setTimeout(() => {
      setStoreNodes(layoutedNodes);
      setStoreEdges(layoutedEdges);
      pushHistory();
      broadcastUpdate();
    }, 0);
  }, [nodes, edges, setNodes, setEdges, setStoreNodes, setStoreEdges, pushHistory, broadcastUpdate, role]);

  const handleImportSchema = useCallback((importedNodes: Node[], importedEdges: Edge[]) => {
    setNodes(importedNodes);
    setEdges(importedEdges);
    setTimeout(() => {
      setStoreNodes(importedNodes);
      setStoreEdges(importedEdges);
      pushHistory();
      broadcastUpdate();
    }, 0);
  }, [setNodes, setEdges, setStoreNodes, setStoreEdges, pushHistory, broadcastUpdate]);

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

  // Export Mermaid
  const handleExportMermaid = useCallback(() => {
    const mermaidCode = exportToMermaid(nodes, edges, canvasType);
    const blob = new Blob([mermaidCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${canvasName || 'canvas'}.mmd`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }, [canvasName, canvasType, nodes, edges]);

  // Export PlantUML
  const handleExportPlantUML = useCallback(() => {
    const pumlCode = exportToPlantUML(nodes, edges, canvasType);
    const blob = new Blob([pumlCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${canvasName || 'canvas'}.puml`;
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
        onExportMermaid={handleExportMermaid}
        onExportPlantUML={handleExportPlantUML}
        onToggleHistory={() => setShowHistory((prev) => !prev)}
        historyIndex={historyIndex}
        historyLength={history.length}
        onAutoLayout={handleAutoLayout}
        onImportSchema={() => setShowImportSchema(true)}
        onSimulate={() => setShowSimulation(true)}
      />

      {/* Canvas area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left palette */}
        <NodePalette canvasType={canvasType} onDragStart={handleDragStart} />

        {/* React Flow canvas */}
        <div ref={reactFlowWrapper} style={{ flex: 1, position: 'relative' }}>
          {role === 'VIEWER' && (
            <div style={{ position: 'absolute', top: '16px', left: '50%', transform: 'translateX(-50%)', zIndex: 50, background: 'hsl(var(--warning)/0.2)', color: 'hsl(var(--warning))', padding: '8px 16px', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 500, border: '1px solid hsl(var(--warning)/0.3)', backdropFilter: 'blur(8px)' }}>
              Viewing as Guest/Viewer (Read-only)
            </div>
          )}
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={role === 'VIEWER' ? undefined : handleNodesChange}
            onEdgesChange={role === 'VIEWER' ? undefined : handleEdgesChange}
            onConnect={role === 'VIEWER' ? undefined : onConnect}
            onNodeClick={onNodeClick}
            onNodeDragStop={onNodeDragStop}
            onPaneClick={onPaneClick}
        onDragOver={onDragOver}
            onDrop={role === 'VIEWER' ? undefined : onDrop}
            nodeTypes={nodeTypes}
            onMoveEnd={(_, viewport) => setViewport(viewport)}
            fitView
            nodesDraggable={role !== 'VIEWER'}
            nodesConnectable={role !== 'VIEWER'}
            elementsSelectable={role !== 'VIEWER'}
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

        {/* Right properties panel or history panel */}
        {showHistory ? (
          <HistoryPanel canvasId={canvasId} onClose={() => setShowHistory(false)} />
        ) : selectedNode && role !== 'VIEWER' ? (
          <PropertiesPanel
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
            onUpdate={handleUpdateNodeData}
          />
        ) : null}

        {showImportSchema && (
          <ImportSchemaModal
            onClose={() => setShowImportSchema(false)}
            onImport={handleImportSchema}
          />
        )}

        {showSimulation && (
          <NetworkSimulation
            nodes={nodes}
            edges={edges}
            onClose={() => setShowSimulation(false)}
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
