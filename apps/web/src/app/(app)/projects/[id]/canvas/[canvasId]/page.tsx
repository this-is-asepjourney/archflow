'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CanvasEditor } from '@/components/canvas/CanvasEditor';
import { useCanvasStore } from '@/stores/useCanvasStore';
import { useAuthStore } from '@/stores/useAuthStore';
import api from '@/lib/api';

export default function CanvasPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const canvasId = params.canvasId as string;
  const { setCanvas, reset } = useCanvasStore();
  const { initialize, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isAuthenticated) return;
    loadCanvas();
    return () => reset();
  }, [canvasId, isAuthenticated]);

  const loadCanvas = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/projects/${projectId}/canvas/${canvasId}`);
      setCanvas({
        id: data.id,
        projectId: projectId,
        name: data.name,
        type: data.type,
        role: data.role || 'EDITOR',
        nodes: data.nodes || [],
        edges: data.edges || [],
        viewport: data.viewport || { x: 0, y: 0, zoom: 1 },
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load canvas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'hsl(var(--background))',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            border: '3px solid hsl(var(--border))',
            borderTopColor: 'hsl(var(--primary))',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: 'hsl(var(--foreground-muted))', fontSize: '0.875rem' }}>
          Loading canvas...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'hsl(var(--background))',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <p style={{ color: 'hsl(var(--danger))' }}>{error}</p>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => router.push(`/projects/${projectId}`)}
        >
          Back to project
        </button>
      </div>
    );
  }

  return <CanvasEditor projectId={projectId} canvasId={canvasId} />;
}
