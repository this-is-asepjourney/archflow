'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from '@xyflow/react';

interface TopologyNodeData {
  label: string;
  icon?: string;
  iconUrl?: string;
  category?: string;
  description?: string;
  ip?: string;
  subnet?: string;
  gateway?: string;
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

import { DeviceIcon } from './DeviceIcon';

export default memo(TopologyNode);

function TopologyNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as TopologyNodeData;
  const color = categoryColors[nodeData.category || 'default'] || categoryColors.default;

  return (
    <>
      <NodeResizer 
        isVisible={selected} 
        minWidth={120} 
        minHeight={100} 
        handleStyle={{ borderRadius: '50%', width: 8, height: 8, border: `2px solid hsl(${color})`, background: 'hsl(var(--surface))' }} 
      />
      <div
        style={{
          width: '100%',
          height: '100%',
          minWidth: 120,
          minHeight: 100,
          background: `hsl(var(--surface-2) / 0.85)`,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: `1px solid ${selected ? `hsl(${color})` : `hsl(var(--border) / 0.8)`}`,
          borderRadius: 12,
          padding: '0.75rem 1rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: selected
            ? `0 0 0 1px hsl(${color} / 0.5) inset, 0 8px 32px hsl(${color} / 0.25)`
            : '0 4px 16px hsl(0 0% 0% / 0.4), inset 0 1px 1px hsl(0 0% 100% / 0.05)',
          transition: 'box-shadow 0.2s ease, border-color 0.2s ease, transform 0.2s ease',
          cursor: 'grab',
          position: 'relative',
          transform: selected ? 'scale(1.02)' : 'scale(1)',
        }}
        className="group"
      >
        {/* Handles - visible on hover or select */}
        {['target', 'source'].map((type, idx) => (
          <Handle
            key={`top-${idx}`}
            type={type as 'source' | 'target'}
            position={Position.Top}
            id={`top-${type}`}
            className={`transition-opacity duration-200 ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
            style={{
              background: `hsl(${color})`,
              border: '2px solid hsl(var(--surface))',
              width: 12,
              height: 12,
              left: type === 'target' ? '40%' : '60%',
            }}
          />
        ))}
        
        {['target', 'source'].map((type, idx) => (
          <Handle
            key={`bottom-${idx}`}
            type={type as 'source' | 'target'}
            position={Position.Bottom}
            id={`bottom-${type}`}
            className={`transition-opacity duration-200 ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
            style={{
              background: `hsl(${color})`,
              border: '2px solid hsl(var(--surface))',
              width: 12,
              height: 12,
              left: type === 'target' ? '40%' : '60%',
            }}
          />
        ))}

        <Handle
          type="target"
          position={Position.Left}
          id="left-target"
          className={`transition-opacity duration-200 ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
          style={{ background: `hsl(${color})`, border: '2px solid hsl(var(--surface))', width: 12, height: 12 }}
        />
        <Handle
          type="source"
          position={Position.Right}
          id="right-source"
          className={`transition-opacity duration-200 ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
          style={{ background: `hsl(${color})`, border: '2px solid hsl(var(--surface))', width: 12, height: 12 }}
        />

        {/* Icon Container */}
        <div 
          style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 42,
            height: 42,
            margin: '0 auto 0.5rem auto',
            background: `linear-gradient(135deg, hsl(${color} / 0.15), hsl(${color} / 0.05))`,
            border: `1px solid hsl(${color} / 0.2)`,
            borderRadius: 10,
            fontSize: '1.5rem',
            marginBottom: '0.25rem',
            lineHeight: 1,
            boxShadow: `inset 0 1px 2px hsl(0 0% 100% / 0.1)`,
            flexShrink: 0,
          }}
        >
          {nodeData.iconUrl ? (
            <img src={nodeData.iconUrl} alt={nodeData.label} style={{ width: 24, height: 24, objectFit: 'contain' }} />
          ) : (
            <DeviceIcon type={nodeData.label || ''} size={32} />
          )}
        </div>

        {/* Label */}
        <div
          style={{
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'hsl(var(--foreground))',
            letterSpacing: '-0.01em',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            width: '100%',
          }}
        >
          {nodeData.label}
        </div>

        {/* IP/Subnet/Gateway badge */}
        {(nodeData.ip || nodeData.gateway) && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              fontSize: '0.6rem',
              color: `hsl(${color} / 0.9)`,
              marginTop: '0.375rem',
              fontFamily: 'monospace',
              background: `hsl(${color} / 0.1)`,
              padding: '0.25rem 0.4rem',
              borderRadius: '0.25rem',
              border: `1px solid hsl(${color} / 0.2)`,
              textAlign: 'left',
            }}
          >
            {nodeData.ip && <div>IP: {nodeData.ip}{nodeData.subnet ? nodeData.subnet : ''}{nodeData.port ? `:${nodeData.port}` : ''}</div>}
            {nodeData.gateway && <div>GW: {nodeData.gateway}</div>}
          </div>
        )}

        {/* Top Color Accent */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: `linear-gradient(90deg, hsl(${color}), hsl(${color} / 0.7))`,
            borderRadius: '12px 12px 0 0',
            opacity: selected ? 1 : 0.7,
          }}
        />
      </div>
    </>
  );
}
