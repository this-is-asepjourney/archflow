'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from '@xyflow/react';

export type FlowShape = 'process' | 'decision' | 'start' | 'end' | 'io' | 'document' | 'swimlane' | 'annotation';

export interface FlowNodeData {
  label: string;
  shape?: FlowShape;
  color?: string;
  [key: string]: unknown;
}

const SHAPE_CONFIGS: Record<FlowShape, { bg: string; border: string; borderRadius: string; shape?: string }> = {
  process:   { bg: 'hsl(210 80% 60% / 0.15)', border: 'hsl(210 80% 60%)', borderRadius: '8px' },
  decision:  { bg: 'hsl(38 92% 50% / 0.15)', border: 'hsl(38 92% 50%)', borderRadius: '0', shape: 'diamond' },
  start:     { bg: 'hsl(142 71% 45% / 0.2)', border: 'hsl(142 71% 45%)', borderRadius: '50%' },
  end:       { bg: 'hsl(0 84% 60% / 0.2)', border: 'hsl(0 84% 60%)', borderRadius: '50%' },
  io:        { bg: 'hsl(280 80% 65% / 0.15)', border: 'hsl(280 80% 65%)', borderRadius: '4px', shape: 'parallelogram' },
  document:  { bg: 'hsl(192 100% 60% / 0.1)', border: 'hsl(192 100% 60%)', borderRadius: '0 0 12px 12px' },
  swimlane:  { bg: 'hsl(252 87% 67% / 0.08)', border: 'hsl(252 87% 67%)', borderRadius: '8px' },
  annotation:{ bg: 'transparent', border: 'hsl(var(--foreground-muted))', borderRadius: '0' },
};

const FlowNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as FlowNodeData;
  const shape = nodeData.shape || 'process';
  const config = SHAPE_CONFIGS[shape];
  const label = nodeData.label || 'Step';
  const isCircle = shape === 'start' || shape === 'end';
  const isDiamond = shape === 'decision';
  const isSwimlane = shape === 'swimlane';
  
  // Extract hue/sat/light for nice gradients if available, or just use config.border
  const color = config.border;

  const renderHandles = () => (
    <>
      {['target', 'source'].map((type, idx) => (
        <Handle
          key={`top-${idx}`}
          type={type as any}
          position={Position.Top}
          id={`top-${type}`}
          className={`transition-opacity duration-200 ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
          style={{ background: color, border: '2px solid hsl(var(--surface))', width: 10, height: 10, left: type === 'target' ? '40%' : '60%' }}
        />
      ))}
      {['target', 'source'].map((type, idx) => (
        <Handle
          key={`bottom-${idx}`}
          type={type as any}
          position={Position.Bottom}
          id={`bottom-${type}`}
          className={`transition-opacity duration-200 ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
          style={{ background: color, border: '2px solid hsl(var(--surface))', width: 10, height: 10, left: type === 'target' ? '40%' : '60%' }}
        />
      ))}
      <Handle
        type="target"
        position={Position.Left}
        id="left-target"
        className={`transition-opacity duration-200 ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
        style={{ background: color, border: '2px solid hsl(var(--surface))', width: 10, height: 10 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        className={`transition-opacity duration-200 ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
        style={{ background: color, border: '2px solid hsl(var(--surface))', width: 10, height: 10 }}
      />
    </>
  );

  if (isDiamond) {
    return (
      <div className="group">
        <NodeResizer isVisible={selected} minWidth={100} minHeight={60} handleStyle={{ borderRadius: '50%', width: 8, height: 8, border: `2px solid ${color}`, background: 'hsl(var(--surface))' }} />
        {renderHandles()}
        <div
          style={{
            width: 120,
            height: 120,
            background: `linear-gradient(135deg, ${config.bg.replace('0.15)', '0.3)')}, ${config.bg.replace('0.15)', '0.1)')})`,
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: `1px solid ${selected ? color : 'hsl(var(--border) / 0.8)'}`,
            transform: 'rotate(45deg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: selected 
              ? `0 0 0 1px ${color}80 inset, 0 8px 32px ${color}40` 
              : `0 4px 16px hsl(0 0% 0% / 0.3), inset 0 1px 1px hsl(0 0% 100% / 0.05)`,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            scale: selected ? '1.02' : '1',
          }}
        >
          <span
            style={{
              transform: 'rotate(-45deg)',
              color: 'hsl(var(--foreground))',
              fontWeight: 600,
              fontSize: '0.8125rem',
              textAlign: 'center',
              padding: '0 0.5rem',
              whiteSpace: 'pre-wrap',
              maxWidth: 100,
              lineHeight: 1.2,
              letterSpacing: '-0.01em',
            }}
          >
            {label}
          </span>
        </div>
      </div>
    );
  }

  if (isSwimlane) {
    return (
      <div className="group">
        <NodeResizer isVisible={selected} minWidth={120} minHeight={200} handleStyle={{ borderRadius: '50%', width: 8, height: 8, border: `2px solid ${color}`, background: 'hsl(var(--surface))' }} />
        <Handle type="target" position={Position.Top} id="top-target" className={`transition-opacity duration-200 ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} style={{ background: color, border: '2px solid hsl(var(--surface))', width: 10, height: 10 }} />
        <Handle type="source" position={Position.Bottom} id="bottom-source" className={`transition-opacity duration-200 ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} style={{ background: color, border: '2px solid hsl(var(--surface))', width: 10, height: 10 }} />
        <div
          style={{
            background: config.bg,
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: `1px solid ${selected ? color : 'hsl(var(--border) / 0.8)'}`,
            borderRadius: config.borderRadius,
            minWidth: 120,
            minHeight: 200,
            overflow: 'hidden',
            boxShadow: selected ? `0 0 0 1px ${color}80 inset, 0 8px 32px ${color}40` : '0 4px 16px hsl(0 0% 0% / 0.3)',
            transition: 'all 0.2s ease',
          }}
        >
          <div
            style={{
              background: `linear-gradient(135deg, ${color}22, ${color}11)`,
              borderBottom: `1px solid ${color}44`,
              padding: '0.5rem 0.75rem',
              fontWeight: 700,
              fontSize: '0.8rem',
              color: 'hsl(var(--foreground))',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              boxShadow: `inset 0 1px 1px hsl(0 0% 100% / 0.1)`,
            }}
          >
            {label}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group">
      <NodeResizer isVisible={selected} minWidth={80} minHeight={40} handleStyle={{ borderRadius: '50%', width: 8, height: 8, border: `2px solid ${color}`, background: 'hsl(var(--surface))' }} />
      {renderHandles()}
      <div
        style={{
          background: `linear-gradient(135deg, ${config.bg.replace('0.2)', '0.35)').replace('0.15)', '0.3)')}, ${config.bg.replace('0.2)', '0.15)').replace('0.15)', '0.1)')})`,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: `1px solid ${selected ? color : 'hsl(var(--border) / 0.8)'}`,
          borderRadius: isCircle ? '50%' : config.borderRadius,
          minWidth: isCircle ? 72 : 120,
          minHeight: isCircle ? 72 : 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isCircle ? 0 : '0.5rem 1rem',
          boxShadow: selected 
            ? `0 0 0 1px ${color}80 inset, 0 8px 32px ${color}40` 
            : `0 4px 16px hsl(0 0% 0% / 0.3), inset 0 1px 1px hsl(0 0% 100% / 0.05)`,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: selected ? 'scale(1.02)' : 'scale(1)',
        }}
      >
        <span
          style={{
            color: 'hsl(var(--foreground))',
            fontWeight: 600,
            fontSize: '0.875rem',
            textAlign: 'center',
            lineHeight: 1.3,
            letterSpacing: '-0.01em',
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
});

FlowNode.displayName = 'FlowNode';
export default FlowNode;
