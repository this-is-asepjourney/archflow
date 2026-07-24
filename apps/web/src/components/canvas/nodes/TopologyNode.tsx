'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { LucideIcon } from 'lucide-react';

interface TopologyNodeData {
  label: string;
  icon?: string;
  category?: string;
  description?: string;
  ip?: string;
  port?: string;
  color?: string;
  selected?: boolean;
}

const categoryColors: Record<string, string> = {
  network: '252 87% 67%',
  compute: '142 71% 45%',
  cloud: '192 100% 60%',
  data: '38 92% 50%',
  iot: '280 80% 65%',
  app: '210 80% 60%',
  observability: '0 84% 60%',
  endpoint: '215 20% 60%',
  default: '252 87% 67%',
};

const categoryIcons: Record<string, string> = {
  // Network
  router: '🔀',
  switch: '🔌',
  firewall: '🛡️',
  'load-balancer': '⚖️',
  vpn: '🔒',
  nginx: '🌐',
  // Compute
  server: '🖥️',
  vm: '💻',
  docker: '🐳',
  kubernetes: '☸️',
  // Cloud
  aws: '☁️',
  azure: '☁️',
  gcp: '☁️',
  // IoT
  esp32: '📡',
  arduino: '🎛️',
  'raspberry-pi': '🍓',
  // Data
  database: '🗄️',
  redis: '⚡',
  storage: '💾',
  kafka: '📨',
  rabbitmq: '🐇',
  mqtt: '📡',
  // App
  api: '🔗',
  frontend: '🖥️',
  backend: '⚙️',
  microservice: '🔧',
  // Observability
  prometheus: '📊',
  grafana: '📈',
  loki: '📋',
  // Endpoints
  printer: '🖨️',
  laptop: '💻',
  pc: '🖥️',
  mobile: '📱',
};

function TopologyNode({ data, selected }: NodeProps) {
  const nodeData = data as TopologyNodeData;
  const color = categoryColors[nodeData.category || 'default'] || categoryColors.default;
  const emoji = categoryIcons[nodeData.label?.toLowerCase().replace(/\s+/g, '-') || ''] || '📦';

  return (
    <div
      style={{
        minWidth: 100,
        background: `hsl(var(--surface-2))`,
        border: `2px solid ${selected ? `hsl(${color})` : `hsl(${color} / 0.3)`}`,
        borderRadius: 10,
        padding: '0.625rem 0.875rem',
        textAlign: 'center',
        boxShadow: selected
          ? `0 0 0 3px hsl(${color} / 0.2), 0 4px 16px hsl(0 0% 0% / 0.3)`
          : '0 2px 8px hsl(0 0% 0% / 0.2)',
        transition: 'all 0.15s ease',
        cursor: 'grab',
        position: 'relative',
      }}
    >
      {/* Handles */}
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: `hsl(${color})`,
          border: '2px solid hsl(var(--surface-2))',
          width: 10,
          height: 10,
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: `hsl(${color})`,
          border: '2px solid hsl(var(--surface-2))',
          width: 10,
          height: 10,
        }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={{
          background: `hsl(${color})`,
          border: '2px solid hsl(var(--surface-2))',
          width: 10,
          height: 10,
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{
          background: `hsl(${color})`,
          border: '2px solid hsl(var(--surface-2))',
          width: 10,
          height: 10,
        }}
      />

      {/* Icon */}
      <div style={{ fontSize: '1.5rem', lineHeight: 1, marginBottom: '0.375rem' }}>{emoji}</div>

      {/* Label */}
      <div
        style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          color: 'hsl(var(--foreground))',
          whiteSpace: 'nowrap',
        }}
      >
        {nodeData.label}
      </div>

      {/* IP/Port badge */}
      {nodeData.ip && (
        <div
          style={{
            fontSize: '0.625rem',
            color: `hsl(${color})`,
            marginTop: '0.25rem',
            fontFamily: 'monospace',
          }}
        >
          {nodeData.ip}
          {nodeData.port ? `:${nodeData.port}` : ''}
        </div>
      )}

      {/* Color indicator */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `hsl(${color})`,
          borderRadius: '10px 10px 0 0',
        }}
      />
    </div>
  );
}

export default memo(TopologyNode);
