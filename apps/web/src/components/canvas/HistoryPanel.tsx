import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { History, RotateCcw, X, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { useCanvasStore } from '@/stores/useCanvasStore';

interface HistorySnapshot {
  id: string;
  createdAt: string;
  creator: {
    name: string;
    avatar?: string;
  };
}

interface HistoryPanelProps {
  canvasId: string;
  onClose: () => void;
}

export function HistoryPanel({ canvasId, onClose }: HistoryPanelProps) {
  const [snapshots, setSnapshots] = useState<HistorySnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRestoring, setIsRestoring] = useState(false);
  const { setNodes, setEdges, setViewport, pushHistory } = useCanvasStore();

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get(`/projects/placeholder/canvas/${canvasId}/history`);
      setSnapshots(data);
    } catch (err) {
      console.error('Failed to load history', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasId]);

  const handleRestore = async (historyId: string) => {
    if (!confirm('Are you sure you want to restore this version? Your current changes will be overwritten.')) {
      return;
    }
    
    try {
      setIsRestoring(true);
      const { data } = await api.post(`/projects/placeholder/canvas/${canvasId}/history/${historyId}/restore`);
      
      // Update local state
      setNodes(data.nodes);
      setEdges(data.edges);
      if (data.viewport) setViewport(data.viewport);
      pushHistory();
      
      onClose();
    } catch (err) {
      console.error('Failed to restore history', err);
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div
      style={{
        width: 320,
        background: 'hsl(var(--surface))',
        borderLeft: '1px solid hsl(var(--border-subtle))',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        zIndex: 50,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem',
          borderBottom: '1px solid hsl(var(--border-subtle))',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
          <History size={18} className="text-[hsl(var(--primary))]" />
          Version History
        </div>
        <button onClick={onClose} className="btn btn-ghost btn-icon btn-sm">
          <X size={16} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <Loader2 className="animate-spin text-[hsl(var(--foreground-subtle))]" size={24} />
          </div>
        ) : snapshots.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'hsl(var(--foreground-subtle))', marginTop: '2rem' }}>
            No history available yet.<br/>Save the canvas to create snapshots.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {snapshots.map((snapshot) => (
              <div
                key={snapshot.id}
                style={{
                  padding: '0.75rem',
                  border: '1px solid hsl(var(--border-subtle))',
                  borderRadius: 8,
                  background: 'hsl(var(--surface-2))',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                      {formatDistanceToNow(new Date(snapshot.createdAt), { addSuffix: true })}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'hsl(var(--foreground-subtle))', marginTop: '0.25rem' }}>
                      by {snapshot.creator.name}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRestore(snapshot.id)}
                    disabled={isRestoring}
                    className="btn btn-outline btn-sm tooltip tooltip-left"
                    data-tooltip="Restore this version"
                    style={{ padding: '0 0.5rem', height: 28, minHeight: 28 }}
                  >
                    <RotateCcw size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
