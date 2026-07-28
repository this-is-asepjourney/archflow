'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Play, Activity, Terminal, CheckCircle2, AlertCircle } from 'lucide-react';
import { Node, Edge } from '@xyflow/react';

interface NetworkSimulationProps {
  nodes: Node[];
  edges: Edge[];
  onClose: () => void;
}

interface LogLine {
  text: string;
  type: 'info' | 'success' | 'error' | 'warning';
  timestamp: number;
}

export function NetworkSimulation({ nodes, edges, onClose }: NetworkSimulationProps) {
  const [sourceId, setSourceId] = useState<string>('');
  const [targetId, setTargetId] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<LogLine[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (text: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    setLogs((prev) => [...prev, { text, type, timestamp: Date.now() }]);
  };

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // --- Network Logic Helpers --- //

  // Parse IP (e.g. 192.168.1.10) to 32-bit integer for subnet calculation
  const ipToInt = (ip: string) => {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
  };

  // Subnet mask from CIDR or format like 255.255.255.0
  const parseSubnetMask = (subnet?: string): number => {
    if (!subnet) return 24; // Default to /24
    if (subnet.startsWith('/')) return parseInt(subnet.substring(1), 10);
    if (subnet.includes('.')) {
      const bits = subnet.split('.').map((s) => parseInt(s, 10).toString(2).replace(/0/g, '').length);
      return bits.reduce((a, b) => a + b, 0);
    }
    return parseInt(subnet, 10);
  };

  const isInSameSubnet = (ip1: string, ip2: string, maskBits: number) => {
    if (!ip1 || !ip2) return false;
    const mask = -1 << (32 - maskBits);
    return (ipToInt(ip1) & mask) === (ipToInt(ip2) & mask);
  };

  const buildGraph = () => {
    const adj = new Map<string, string[]>();
    nodes.forEach(n => adj.set(n.id, []));
    edges.forEach(e => {
      const { source, target } = e;
      if (adj.has(source)) adj.get(source)!.push(target);
      if (adj.has(target)) adj.get(target)!.push(source); // Undirected for physical layer
    });
    return adj;
  };

  const findPaths = (start: string, end: string, adj: Map<string, string[]>) => {
    const queue = [[start]];
    const visited = new Set<string>([start]);
    const paths: string[][] = [];

    while (queue.length > 0) {
      const path = queue.shift()!;
      const node = path[path.length - 1];

      if (node === end) {
        paths.push(path);
        // Find all shortest paths, so if we found one, we can just return it or keep searching level
        // Here we just return the first one found (shortest)
        return path;
      }

      for (const neighbor of adj.get(node) || []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push([...path, neighbor]);
        }
      }
    }
    return null;
  };

  // --- Run Simulation --- //

  const runSimulation = async () => {
    if (!sourceId || !targetId) {
      addLog('Please select both source and target nodes.', 'error');
      return;
    }
    if (sourceId === targetId) {
      addLog('Source and target must be different.', 'warning');
      return;
    }

    setLogs([]);
    setIsRunning(true);
    addLog(`Initializing Network Simulation Engine...`, 'info');
    await sleep(600);

    const sourceNode = nodes.find(n => n.id === sourceId);
    const targetNode = nodes.find(n => n.id === targetId);

    if (!sourceNode || !targetNode) {
      addLog('Selected nodes could not be found.', 'error');
      setIsRunning(false);
      return;
    }

    const srcName = (sourceNode.data.label as string) || sourceNode.id;
    const dstName = (targetNode.data.label as string) || targetNode.id;
    const srcIp = sourceNode.data.ip as string;
    const dstIp = targetNode.data.ip as string;
    const srcSubnet = sourceNode.data.subnet as string;

    addLog(`Pinging ${dstName} ${dstIp ? `[${dstIp}]` : ''} from ${srcName} ${srcIp ? `[${srcIp}]` : ''} with 32 bytes of data:`, 'info');
    await sleep(800);

    // Step 1: Check Physical Connectivity
    const adj = buildGraph();
    const path = findPaths(sourceId, targetId, adj);

    if (!path) {
      for (let i = 0; i < 4; i++) {
        addLog('Request timed out. (No physical route)', 'error');
        await sleep(1000);
      }
      addLog(`\nPing statistics for ${dstName}:`, 'info');
      addLog(`    Packets: Sent = 4, Received = 0, Lost = 4 (100% loss)`, 'error');
      setIsRunning(false);
      return;
    }

    addLog(`Physical path found: ${path.length - 1} hops.`, 'success');
    await sleep(500);

    // Step 2: Subnet & Router Validation
    let isReachable = true;
    let failReason = '';

    if (srcIp && dstIp) {
      const maskBits = parseSubnetMask(srcSubnet);
      const sameSubnet = isInSameSubnet(srcIp, dstIp, maskBits);

      if (!sameSubnet) {
        addLog(`Nodes are in different subnets. Checking for router in path...`, 'warning');
        await sleep(800);

        // Check if any intermediate node is a router
        let hasRouter = false;
        for (let i = 1; i < path.length - 1; i++) {
          const midNode = nodes.find(n => n.id === path[i]);
          if (midNode && midNode.data.category === 'network' && (midNode.data.label as string).toLowerCase().includes('router')) {
            hasRouter = true;
            break;
          }
        }

        if (hasRouter) {
          addLog(`Router detected in path. Routing packet...`, 'success');
          await sleep(500);
        } else {
          isReachable = false;
          failReason = 'Different subnets, but no Router found in path.';
        }
      } else {
        addLog(`Nodes are in the same subnet. Direct communication possible.`, 'success');
        await sleep(500);
      }
    } else {
      addLog(`Warning: Missing IP addresses for L3 validation. Checking L2 physical path only.`, 'warning');
      await sleep(500);
    }

    if (!isReachable) {
      for (let i = 0; i < 4; i++) {
        addLog(`Reply from ${srcIp || srcName}: Destination net unreachable.`, 'error');
        await sleep(1000);
      }
      addLog(`\nReason: ${failReason}`, 'error');
    } else {
      // Simulate successful ping
      for (let i = 0; i < 4; i++) {
        const time = Math.floor(Math.random() * 20) + 1; // 1-20ms
        addLog(`Reply from ${dstIp || dstName}: bytes=32 time=${time}ms TTL=64`, 'success');
        await sleep(1000);
      }
      addLog(`\nPing statistics for ${dstIp || dstName}:`, 'info');
      addLog(`    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)`, 'success');
      addLog(`    Approximate round trip times in milli-seconds:`, 'info');
      addLog(`    Minimum = 2ms, Maximum = 18ms, Average = 8ms`, 'info');
    }

    setIsRunning(false);
  };

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 480,
        height: 480,
        background: 'hsl(var(--surface) / 0.95)',
        backdropFilter: 'blur(16px)',
        border: '1px solid hsl(var(--border))',
        borderRadius: 16,
        boxShadow: '0 16px 40px -10px hsl(0 0% 0% / 0.5), 0 0 0 1px hsl(var(--border) / 0.5) inset',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        overflow: 'hidden',
        animation: 'slideInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1rem',
          borderBottom: '1px solid hsl(var(--border) / 0.5)',
          background: 'hsl(var(--surface-2) / 0.5)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={16} style={{ color: 'hsl(var(--success))' }} />
          <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Network Simulator</span>
        </div>
        <button onClick={onClose} className="btn btn-ghost btn-icon btn-sm">
          <X size={14} />
        </button>
      </div>

      {/* Controls */}
      <div style={{ padding: '1rem', borderBottom: '1px solid hsl(var(--border) / 0.5)' }}>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.7rem', color: 'hsl(var(--foreground-muted))', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Source Node</label>
            <select
              className="input w-full"
              style={{ fontSize: '0.8125rem', padding: '0.4rem 0.5rem' }}
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
              disabled={isRunning}
            >
              <option value="">Select source...</option>
              {nodes.map(n => (
                <option key={n.id} value={n.id}>
                  {n.data.label as string} {n.data.ip ? `(${n.data.ip})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.7rem', color: 'hsl(var(--foreground-muted))', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Destination Node</label>
            <select
              className="input w-full"
              style={{ fontSize: '0.8125rem', padding: '0.4rem 0.5rem' }}
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              disabled={isRunning}
            >
              <option value="">Select destination...</option>
              {nodes.map(n => (
                <option key={n.id} value={n.id}>
                  {n.data.label as string} {n.data.ip ? `(${n.data.ip})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          className="btn btn-primary w-full"
          style={{ justifyContent: 'center', background: 'hsl(var(--success))', color: '#000', fontWeight: 700 }}
          onClick={runSimulation}
          disabled={isRunning || !sourceId || !targetId}
        >
          {isRunning ? (
            <>
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent mr-2" />
              Running Simulation...
            </>
          ) : (
            <>
              <Play size={16} fill="currentColor" />
              Run Ping Test
            </>
          )}
        </button>
      </div>

      {/* Terminal View */}
      <div
        style={{
          flex: 1,
          background: '#0d1117',
          padding: '1rem',
          fontFamily: 'monospace',
          fontSize: '0.8125rem',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
        }}
      >
        <div style={{ color: 'hsl(var(--foreground-subtle))', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Terminal size={14} />
          <span>Simulation Terminal</span>
        </div>
        
        {logs.map((log, i) => (
          <div
            key={i}
            style={{
              color: 
                log.type === 'error' ? 'hsl(var(--danger))' :
                log.type === 'success' ? 'hsl(142 71% 45%)' :
                log.type === 'warning' ? 'hsl(38 92% 50%)' :
                '#c9d1d9',
              whiteSpace: 'pre-wrap',
            }}
          >
            {log.text}
          </div>
        ))}
        {isRunning && (
          <div className="animate-pulse" style={{ color: 'hsl(var(--foreground-subtle))' }}>_</div>
        )}
        <div ref={logsEndRef} />
      </div>

      <style>{`
        @keyframes slideInUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
