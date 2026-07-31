import React from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getSmoothStepPath,
  getBezierPath,
  getStraightPath,
  useReactFlow,
} from '@xyflow/react';

export function TopologyEdge({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps) {
  const { getNode } = useReactFlow();
  
  const sourceNode = getNode(source);
  const targetNode = getNode(target);
  
  // Fallback to node IP if not specified in edge data
  const sourceIp = (data?.sourceIp as string) || (sourceNode?.data?.ip as string);
  const targetIp = (data?.targetIp as string) || (targetNode?.data?.ip as string);

  let edgePath = '';
  let labelX = 0;
  let labelY = 0;

  const pathParams = {
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  };

  // Allow custom routing via data.routingType, defaulting to smoothstep
  const routingType = data?.routingType || 'smoothstep';

  if (routingType === 'straight') {
    [edgePath, labelX, labelY] = getStraightPath(pathParams);
  } else if (routingType === 'bezier') {
    [edgePath, labelX, labelY] = getBezierPath(pathParams);
  } else {
    [edgePath, labelX, labelY] = getSmoothStepPath({ ...pathParams, borderRadius: 16 });
  }

  // Construct label from IPs if available
  let computedLabel = '';
  if (sourceIp && targetIp) {
    computedLabel = `${sourceIp} ↔ ${targetIp}`;
  } else if (sourceIp) {
    computedLabel = `${sourceIp} →`;
  } else if (targetIp) {
    computedLabel = `→ ${targetIp}`;
  }

  // Allow overriding with manual label from data
  const finalLabel = (data?.label as string) || computedLabel;

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} id={id} />
      
      {finalLabel && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: '0.65rem',
              pointerEvents: 'all',
              background: 'hsl(var(--surface-2))',
              border: '1px solid hsl(var(--border))',
              padding: '2px 6px',
              borderRadius: 4,
              color: 'hsl(var(--foreground))',
              fontWeight: 500,
              fontFamily: 'monospace',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              zIndex: 1000,
            }}
            className="nodrag nopan"
          >
            {finalLabel}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
