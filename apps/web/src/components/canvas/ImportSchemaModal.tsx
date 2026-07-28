import { useState } from 'react';
import { X } from 'lucide-react';
import { Node, Edge } from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';
import { getLayoutedElements } from '@/utils/layoutElements';

interface ImportSchemaModalProps {
  onClose: () => void;
  onImport: (nodes: Node[], edges: Edge[]) => void;
}

export function ImportSchemaModal({ onClose, onImport }: ImportSchemaModalProps) {
  const [schemaText, setSchemaText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleImport = () => {
    setError(null);
    try {
      const nodes: Node[] = [];
      const edges: Edge[] = [];
      
      // Simple custom parser for ERD schemas
      // e.g., 
      // Table Users { id string PK, email string }
      // Table Posts { id string PK, userId string FK, title string }
      
      const lines = schemaText.split('\n');
      let currentTable: Node | null = null;
      let yOffset = 0;
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('//')) continue;
        
        if (trimmed.toLowerCase().startsWith('table ')) {
          const match = trimmed.match(/table\s+(\w+)\s*{/i);
          if (match) {
            const tableName = match[1];
            currentTable = {
              id: `node-${uuidv4()}`,
              type: 'erd',
              position: { x: 0, y: yOffset },
              data: {
                label: tableName,
                columns: [],
              },
            };
            nodes.push(currentTable);
            yOffset += 200;
          }
        } else if (trimmed === '}' && currentTable) {
          currentTable = null;
        } else if (currentTable) {
          // Parse column: name type [PK|FK]
          const parts = trimmed.split(/[\s,]+/);
          if (parts.length >= 2) {
            const name = parts[0];
            const type = parts[1];
            const isPrimary = parts.includes('PK');
            const isForeign = parts.includes('FK');
            
            const cols = currentTable.data.columns as any[];
            cols.push({
              id: uuidv4(),
              name,
              type,
              isPrimary,
              isForeign,
            });
          }
        }
      }

      if (nodes.length === 0) {
        throw new Error('No valid tables found in the schema.');
      }

      // Automatically layout
      const layouted = getLayoutedElements(nodes, edges, 'TB');
      onImport(layouted.nodes, layouted.edges);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to parse schema. Please check the format.');
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-3xl" style={{ display: 'flex', flexDirection: 'column' }}>
        <h3 className="font-bold text-lg mb-4">Import ERD Schema</h3>
        <p className="text-sm text-muted mb-4">
          Paste your schema definitions below. Example format:<br/>
          <pre className="p-2 bg-base-200 mt-2 text-xs rounded">
            {`Table Users {\n  id string PK\n  email string\n}\n\nTable Posts {\n  id string PK\n  userId string FK\n  title string\n}`}
          </pre>
        </p>

        {error && (
          <div className="alert alert-error text-sm mb-4">
            <span>{error}</span>
          </div>
        )}

        <textarea
          className="textarea textarea-bordered flex-1 w-full mb-4 font-mono"
          placeholder="Paste schema here..."
          value={schemaText}
          onChange={(e) => setSchemaText(e.target.value)}
          style={{ minHeight: '300px' }}
        />

        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleImport}>Import & Layout</button>
        </div>
      </div>
    </div>
  );
}
