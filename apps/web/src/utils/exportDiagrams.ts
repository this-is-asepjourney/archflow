import { Node, Edge } from '@xyflow/react';

export function exportToMermaid(nodes: Node[], edges: Edge[], type: string): string {
  let mermaidString = '';

  switch (type) {
    case 'ERD':
      mermaidString = 'erDiagram\n';
      // Process ERD nodes (entities)
      nodes.forEach((node) => {
        const entityName = node.data.label ? String(node.data.label).replace(/\s+/g, '_') : `Entity_${node.id}`;
        mermaidString += `  ${entityName} {\n`;
        if (Array.isArray(node.data.columns)) {
          node.data.columns.forEach((col: any) => {
            let colType = col.type || 'string';
            let colName = col.name || 'column';
            let pkFk = col.isPrimary ? ' PK' : (col.isForeign ? ' FK' : '');
            mermaidString += `    ${colType} ${colName}${pkFk}\n`;
          });
        }
        mermaidString += `  }\n`;
      });
      // Process ERD edges (relationships)
      edges.forEach((edge) => {
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);
        if (sourceNode && targetNode) {
          const srcName = String(sourceNode.data.label || sourceNode.id).replace(/\s+/g, '_');
          const tgtName = String(targetNode.data.label || targetNode.id).replace(/\s+/g, '_');
          const relationship = edge.label ? ` : "${edge.label}"` : '';
          mermaidString += `  ${srcName} ||--o{ ${tgtName}${relationship}\n`;
        }
      });
      break;

    case 'FLOW':
    case 'TOPOLOGY':
    case 'INFRASTRUCTURE':
    case 'CICD':
    default:
      mermaidString = 'graph TD\n';
      nodes.forEach((node) => {
        const shapeStart = node.data.shape === 'diamond' ? '{' : (node.data.shape === 'cylinder' ? '[(' : '[');
        const shapeEnd = node.data.shape === 'diamond' ? '}' : (node.data.shape === 'cylinder' ? ')]' : ']');
        const label = String(node.data.label || node.type || node.id).replace(/"/g, '');
        mermaidString += `  ${node.id.replace(/-/g, '')}${shapeStart}"${label}"${shapeEnd}\n`;
      });
      edges.forEach((edge) => {
        const label = edge.label ? `|"${edge.label}"|` : '';
        const arrow = edge.animated ? '-.->' : '-->';
        mermaidString += `  ${edge.source.replace(/-/g, '')} ${arrow}${label} ${edge.target.replace(/-/g, '')}\n`;
      });
      break;
  }

  return mermaidString;
}

export function exportToPlantUML(nodes: Node[], edges: Edge[], type: string): string {
  let pumlString = '@startuml\n\n';

  switch (type) {
    case 'UML':
      nodes.forEach((node) => {
        const className = node.data.label ? String(node.data.label).replace(/\s+/g, '_') : `Class_${node.id}`;
        if (node.data.stereotype) {
          pumlString += `class ${className} <<${node.data.stereotype}>> {\n`;
        } else {
          pumlString += `class ${className} {\n`;
        }
        
        if (Array.isArray(node.data.attributes)) {
          node.data.attributes.forEach((attr: any) => {
            const vis = attr.visibility === 'public' ? '+' : (attr.visibility === 'private' ? '-' : (attr.visibility === 'protected' ? '#' : ''));
            pumlString += `  ${vis}${attr.name}: ${attr.type}\n`;
          });
        }
        
        if (Array.isArray(node.data.methods)) {
          pumlString += `  ==\n`;
          node.data.methods.forEach((method: any) => {
            const vis = method.visibility === 'public' ? '+' : (method.visibility === 'private' ? '-' : (method.visibility === 'protected' ? '#' : ''));
            pumlString += `  ${vis}${method.name}(${method.params || ''}): ${method.returnType || 'void'}\n`;
          });
        }
        pumlString += `}\n\n`;
      });
      
      edges.forEach((edge) => {
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);
        if (sourceNode && targetNode) {
          const srcName = String(sourceNode.data.label || sourceNode.id).replace(/\s+/g, '_');
          const tgtName = String(targetNode.data.label || targetNode.id).replace(/\s+/g, '_');
          const label = edge.label ? ` : ${edge.label}` : '';
          pumlString += `${srcName} --> ${tgtName}${label}\n`;
        }
      });
      break;

    default:
      nodes.forEach((node) => {
        const typeStr = node.data.shape === 'cylinder' ? 'database' : 'node';
        const label = String(node.data.label || node.type || node.id).replace(/"/g, '');
        pumlString += `${typeStr} "${label}" as ${node.id.replace(/-/g, '')}\n`;
      });
      
      pumlString += '\n';
      edges.forEach((edge) => {
        const label = edge.label ? ` : ${edge.label}` : '';
        const arrow = edge.animated ? '..>' : '-->';
        pumlString += `${edge.source.replace(/-/g, '')} ${arrow} ${edge.target.replace(/-/g, '')}${label}\n`;
      });
      break;
  }

  pumlString += '\n@enduml';
  return pumlString;
}
