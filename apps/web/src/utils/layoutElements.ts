import dagre from 'dagre';
import { Node, Edge } from '@xyflow/react';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

// TB = Top to Bottom
export const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    // Estimasi ukuran default node
    const width = node.measured?.width || (node.type === 'erd' ? 250 : 200);
    const height = node.measured?.height || (node.type === 'erd' ? 150 : 100);
    dagreGraph.setNode(node.id, { width, height });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const width = node.measured?.width || (node.type === 'erd' ? 250 : 200);
    const height = node.measured?.height || (node.type === 'erd' ? 150 : 100);

    // Dagre mengembalikan posisi center, sedangkan React Flow menggunakan posisi top-left
    const newNode = {
      ...node,
      position: {
        x: nodeWithPosition.x - width / 2,
        y: nodeWithPosition.y - height / 2,
      },
    };

    return newNode;
  });

  return { nodes: newNodes, edges };
};
