'use client';

import { X, Info, Plus, Trash2 } from 'lucide-react';
import { Node, Edge } from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';

interface PropertiesPanelProps {
  node: Node | null;
  edge: Edge | null;
  onClose: () => void;
  onUpdate: (id: string, data: Record<string, unknown>) => void;
  onUpdateEdge: (id: string, updates: Partial<Edge>) => void;
}

export function PropertiesPanel({ node, edge, onClose, onUpdate, onUpdateEdge }: PropertiesPanelProps) {
  if (!node && !edge) return null;

  const data = node ? (node.data as Record<string, unknown>) : (edge?.data as Record<string, unknown> || {});
  const type = node ? node.type : 'edge';

  const handleChange = (key: string, value: unknown) => {
    if (node) {
      onUpdate(node.id, { ...data, [key]: value });
    }
  };

  const handleEdgeChange = (updates: Partial<Edge>) => {
    if (edge) {
      onUpdateEdge(edge.id, updates);
    }
  };

  return (
    <div
      className="animate-slide-in"
      style={{
        width: 280,
        height: '100%',
        background: 'hsl(var(--surface))',
        borderLeft: '1px solid hsl(var(--border-subtle))',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1rem',
          borderBottom: '1px solid hsl(var(--border-subtle))',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Info size={14} style={{ color: 'hsl(var(--primary-glow))' }} />
          <span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>Properties</span>
          <span style={{
            fontSize: '0.65rem',
            background: 'hsl(var(--surface-2))',
            border: '1px solid hsl(var(--border-subtle))',
            borderRadius: 4,
            padding: '0.1rem 0.375rem',
            color: 'hsl(var(--foreground-muted))',
            textTransform: 'uppercase',
          }}>
            {type}
          </span>
        </div>
        <button onClick={onClose} className="btn btn-ghost btn-icon btn-sm">
          <X size={14} />
        </button>
      </div>

      {/* Content — scrollable */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
        {/* Item ID */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.6875rem', color: 'hsl(var(--foreground-subtle))', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
            {node ? 'Node ID' : 'Edge ID'}
          </div>
          <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'hsl(var(--foreground-muted))', background: 'hsl(var(--surface-2))', padding: '0.375rem 0.5rem', borderRadius: 6, border: '1px solid hsl(var(--border-subtle))' }}>
            {(node?.id || edge?.id || '').slice(0, 20)}...
          </div>
        </div>

        <div className="divider" />

        {/* Render panel based on type */}
        {edge && (
          <EdgePanel edge={edge} onChange={handleEdgeChange} />
        )}
        {node && type === 'erd' && (
          <ErdPanel data={data} onChange={handleChange} />
        )}
        {node && type === 'uml' && (
          <UmlPanel data={data} onChange={handleChange} />
        )}
        {node && type === 'flow' && (
          <FlowPanel data={data} onChange={handleChange} />
        )}
        {node && type === 'topology' && (
          <TopologyPanel data={data} node={node} onChange={handleChange} />
        )}
        {node && !['erd', 'uml', 'flow', 'topology'].includes(type || '') && (
          <TopologyPanel data={data} node={node} onChange={handleChange} />
        )}
      </div>

      {node && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderTop: '1px solid hsl(var(--border-subtle))',
            fontSize: '0.6875rem',
            color: 'hsl(var(--foreground-subtle))',
            display: 'flex',
            gap: '1rem',
          }}
        >
          <span>x: {Math.round(node.position.x)}</span>
          <span>y: {Math.round(node.position.y)}</span>
        </div>
      )}
    </div>
  );
}

// ─── Edge Panel ────────────────────────────────────────────────────────────────
function EdgePanel({ edge, onChange }: { edge: Edge; onChange: (updates: Partial<Edge>) => void }) {
  const edgeType = edge.type || 'default';
  
  return (
    <>
      <SectionTitle>Edge Properties</SectionTitle>
      
      <div style={{ marginBottom: '0.875rem' }}>
        <label style={{ display: 'block', fontSize: '0.75rem', color: 'hsl(var(--foreground-muted))', marginBottom: '0.3rem' }}>Routing Type</label>
        <select className="input w-full" value={edgeType} onChange={(e) => onChange({ type: e.target.value })} style={{ fontSize: '0.8125rem' }}>
          <option value="default">Bezier (Smooth curve)</option>
          <option value="straight">Straight</option>
          <option value="step">Step (Right angles)</option>
          <option value="smoothstep">Smoothstep (Rounded corners)</option>
        </select>
      </div>

      <div style={{ marginBottom: '0.875rem' }}>
        <label style={{ display: 'block', fontSize: '0.75rem', color: 'hsl(var(--foreground-muted))', marginBottom: '0.3rem' }}>Label</label>
        <input 
          type="text" 
          value={typeof edge.label === 'string' ? edge.label : ''} 
          onChange={(e) => onChange({ label: e.target.value })} 
          placeholder="e.g. TCP/IP" 
          className="input" 
          style={{ fontSize: '0.8125rem' }} 
        />
      </div>

      <div style={{ marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <input 
          type="checkbox" 
          checked={!!edge.animated} 
          onChange={(e) => onChange({ animated: e.target.checked })} 
          style={{ accentColor: 'hsl(var(--primary))', width: 14, height: 14 }} 
        />
        <label style={{ fontSize: '0.75rem', color: 'hsl(var(--foreground-muted))', cursor: 'pointer' }}>Animated (Flowing effect)</label>
      </div>
    </>
  );
}

// ─── Topology Panel ────────────────────────────────────────────────────────────
function TopologyPanel({ data, node, onChange }: { data: Record<string, unknown>; node: Node; onChange: (k: string, v: unknown) => void }) {
  const category = (data.category as string) || 'default';
  const nodeType = (data.nodeType as string) || '';
  const nodeWidth = node.style?.width?.toString() || '';
  const nodeHeight = node.style?.height?.toString() || '';

  const renderSelect = (label: string, field: string, options: string[]) => (
    <div style={{ marginBottom: '0.875rem' }}>
      <label style={{ display: 'block', fontSize: '0.75rem', color: 'hsl(var(--foreground-muted))', marginBottom: '0.3rem' }}>{label}</label>
      <select className="input w-full" value={(data[field] as string) || ''} onChange={(e) => onChange(field, e.target.value)} style={{ fontSize: '0.8125rem' }}>
        <option value="">-- Select --</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );

  const renderCheckbox = (label: string, field: string) => (
    <div style={{ marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <input type="checkbox" checked={!!data[field]} onChange={(e) => onChange(field, e.target.checked)} style={{ accentColor: 'hsl(var(--primary))', width: 14, height: 14 }} />
      <label style={{ fontSize: '0.75rem', color: 'hsl(var(--foreground-muted))', cursor: 'pointer' }}>{label}</label>
    </div>
  );

  return (
    <>
      <SectionTitle>Dimensions</SectionTitle>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <div style={{ flex: 1 }}><Field label="Width (px)" value={nodeWidth} onChange={(v) => onChange('_width', v)} placeholder="Auto" /></div>
        <div style={{ flex: 1 }}><Field label="Height (px)" value={nodeHeight} onChange={(v) => onChange('_height', v)} placeholder="Auto" /></div>
      </div>
      <div className="divider" />
      <SectionTitle>General Properties</SectionTitle>
      <Field label="Label" value={(data.label as string) || ''} onChange={(v) => onChange('label', v)} placeholder="Node label" />
      <Field label="Description" value={(data.description as string) || ''} onChange={(v) => onChange('description', v)} placeholder="Optional description" multiline />
      
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <div style={{ flex: 1 }}>{renderSelect('Status', 'status', ['active', 'inactive', 'maintenance', 'error', 'planned'])}</div>
        <div style={{ flex: 1 }}>{renderSelect('Environment', 'environment', ['production', 'staging', 'development', 'local'])}</div>
      </div>
      
      <Field label="Spesifikasi (Notes)" value={(data.spesifikasi as string) || ''} onChange={(v) => onChange('spesifikasi', v)} placeholder="Free text notes" multiline />
      <Field label="Tags (comma separated)" value={(data.tags as string) || ''} onChange={(v) => onChange('tags', v)} placeholder="web, prod, critical" />

      <div className="divider" />
      
      {/* Category: Network */}
      {category === 'network' && (
        <>
          <SectionTitle>Network Specs ({nodeType})</SectionTitle>
          {nodeType === 'router' && (
            <>
              <Field label="Hostname" value={(data.hostname as string) || ''} onChange={(v) => onChange('hostname', v)} />
              <Field label="WAN IP" value={(data.wan_ip as string) || ''} onChange={(v) => onChange('wan_ip', v)} mono />
              <Field label="LAN IP" value={(data.ip as string) || ''} onChange={(v) => onChange('ip', v)} mono />
              <Field label="Subnet" value={(data.subnet as string) || ''} onChange={(v) => onChange('subnet', v)} mono />
              <Field label="Gateway" value={(data.gateway as string) || ''} onChange={(v) => onChange('gateway', v)} mono />
              <Field label="DNS Servers" value={(data.dns_servers as string) || ''} onChange={(v) => onChange('dns_servers', v)} placeholder="8.8.8.8, 1.1.1.1" mono />
              {renderSelect('Routing Protocol', 'routing_protocol', ['static', 'OSPF', 'BGP', 'RIP'])}
              {renderSelect('WAN Type', 'wan_type', ['PPPoE', 'DHCP', 'Static IP'])}
              <div style={{ display: 'flex', gap: '1rem' }}>
                {renderCheckbox('NAT Enabled', 'nat_enabled')}
                {renderCheckbox('VLAN Support', 'vlan_support')}
              </div>
              <Field label="Bandwidth Limit" value={(data.bandwidth_limit as string) || ''} onChange={(v) => onChange('bandwidth_limit', v)} placeholder="50 Mbps up/down" />
              <Field label="Firmware Version" value={(data.firmware_version as string) || ''} onChange={(v) => onChange('firmware_version', v)} />
            </>
          )}
          {nodeType === 'switch' && (
            <>
              <Field label="Hostname" value={(data.hostname as string) || ''} onChange={(v) => onChange('hostname', v)} />
              {renderSelect('Switch Type', 'switch_type', ['managed', 'unmanaged', 'smart'])}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ flex: 1 }}><Field label="Port Count" value={(data.port_count as string) || ''} onChange={(v) => onChange('port_count', v)} /></div>
                <div style={{ flex: 1 }}><Field label="Port Speed" value={(data.port_speed as string) || ''} onChange={(v) => onChange('port_speed', v)} placeholder="10/100/1000 Mbps" /></div>
              </div>
              <Field label="Management IP" value={(data.ip as string) || ''} onChange={(v) => onChange('ip', v)} mono />
              <Field label="Subnet" value={(data.subnet as string) || ''} onChange={(v) => onChange('subnet', v)} mono />
              <Field label="Gateway" value={(data.gateway as string) || ''} onChange={(v) => onChange('gateway', v)} mono />
              <Field label="VLAN Config" value={(data.vlan_config as string) || ''} onChange={(v) => onChange('vlan_config', v)} placeholder="10, 20, 30" />
              <Field label="Uplink Port" value={(data.uplink_port as string) || ''} onChange={(v) => onChange('uplink_port', v)} />
              <div style={{ display: 'flex', gap: '1rem' }}>
                {renderCheckbox('PoE Support', 'poe_support')}
                {renderCheckbox('STP Enabled', 'stp_enabled')}
              </div>
            </>
          )}
          {nodeType === 'firewall' && (
            <>
              <Field label="Hostname" value={(data.hostname as string) || ''} onChange={(v) => onChange('hostname', v)} />
              {renderSelect('Firewall Type', 'firewall_type', ['Hardware', 'Software', 'Cloud-based'])}
              {renderSelect('Policy Mode', 'policy_mode', ['Allow by default', 'Deny by default'])}
              <Field label="Rules Count" value={(data.rules_count as string) || ''} onChange={(v) => onChange('rules_count', v)} />
              <Field label="Zones" value={(data.zones as string) || ''} onChange={(v) => onChange('zones', v)} placeholder="WAN, LAN, DMZ" />
              <Field label="Throughput" value={(data.throughput as string) || ''} onChange={(v) => onChange('throughput', v)} />
              {renderCheckbox('IPS/IDS Enabled', 'ips_ids_enabled')}
            </>
          )}
          {nodeType === 'load-balancer' && (
            <>
              {renderSelect('Algorithm', 'algorithm', ['Round Robin', 'Least Connections', 'IP Hash'])}
              <Field label="Backend Targets" value={(data.backend_targets as string) || ''} onChange={(v) => onChange('backend_targets', v)} placeholder="server-1, server-2" />
              <Field label="Health Check Path" value={(data.health_check_path as string) || ''} onChange={(v) => onChange('health_check_path', v)} placeholder="/health" />
              <div style={{ display: 'flex', gap: '1rem' }}>
                {renderCheckbox('SSL Termination', 'ssl_termination')}
                {renderCheckbox('Sticky Session', 'sticky_session')}
              </div>
            </>
          )}
          {nodeType === 'vpn' && (
            <>
              {renderSelect('VPN Type', 'vpn_type', ['Site-to-Site', 'Point-to-Site', 'Remote Access'])}
              {renderSelect('Protocol', 'protocol', ['WireGuard', 'OpenVPN', 'IPSec', 'L2TP'])}
              <Field label="Encryption" value={(data.encryption as string) || ''} onChange={(v) => onChange('encryption', v)} placeholder="AES-256" />
              <Field label="Tunnel IP Range" value={(data.tunnel_ip_range as string) || ''} onChange={(v) => onChange('tunnel_ip_range', v)} mono />
            </>
          )}
          {nodeType === 'nginx' && (
            <>
              {renderSelect('Role', 'role', ['Reverse Proxy', 'Load Balancer', 'Static Server'])}
              <Field label="Upstream Targets" value={(data.upstream_targets as string) || ''} onChange={(v) => onChange('upstream_targets', v)} />
              <Field label="Config Path" value={(data.config_path as string) || ''} onChange={(v) => onChange('config_path', v)} />
              {renderCheckbox('SSL Enabled', 'ssl_enabled')}
            </>
          )}
          
          {/* Default fallback for other network components */}
          {!['router', 'switch', 'firewall', 'load-balancer', 'vpn', 'nginx'].includes(nodeType) && (
            <>
              <Field label="IP Address" value={(data.ip as string) || ''} onChange={(v) => onChange('ip', v)} mono />
              <Field label="Subnet Mask" value={(data.subnet as string) || ''} onChange={(v) => onChange('subnet', v)} mono />
              <Field label="Gateway" value={(data.gateway as string) || ''} onChange={(v) => onChange('gateway', v)} mono />
            </>
          )}
        </>
      )}

      {/* Category: Compute */}
      {category === 'compute' && (
        <>
          <SectionTitle>Compute Specs ({nodeType})</SectionTitle>
          <Field label="IP Address" value={(data.ip as string) || ''} onChange={(v) => onChange('ip', v)} placeholder="192.168.1.100" mono />
          <Field label="Subnet" value={(data.subnet as string) || ''} onChange={(v) => onChange('subnet', v)} placeholder="255.255.255.0 or /24" mono />
          <Field label="Gateway" value={(data.gateway as string) || ''} onChange={(v) => onChange('gateway', v)} placeholder="192.168.1.1" mono />
          {nodeType === 'server' && (
            <>
              <Field label="Hostname" value={(data.hostname as string) || ''} onChange={(v) => onChange('hostname', v)} />
              {renderSelect('Server Role', 'server_role', ['Database', 'Web', 'File', 'Application', 'DNS', 'Mail'])}
              <Field label="OS" value={(data.os as string) || ''} onChange={(v) => onChange('os', v)} placeholder="Ubuntu 22.04" />
              {renderSelect('Virtualization', 'virtualization', ['Bare metal', 'Proxmox', 'VMware'])}
            </>
          )}
          {nodeType === 'vm' && (
            <>
              {renderSelect('Hypervisor', 'hypervisor', ['Proxmox', 'VMware ESXi', 'KVM', 'Hyper-V'])}
              <Field label="Host Node" value={(data.host_node as string) || ''} onChange={(v) => onChange('host_node', v)} />
              {renderCheckbox('Snapshot Enabled', 'snapshot_enabled')}
            </>
          )}
          {['server', 'vm'].includes(nodeType) && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ flex: 1 }}><Field label="CPU / vCPU" value={(data.cpu as string) || ''} onChange={(v) => onChange('cpu', v)} placeholder="4" mono /></div>
              <div style={{ flex: 1 }}><Field label="RAM" value={(data.ram as string) || ''} onChange={(v) => onChange('ram', v)} placeholder="16 GB" mono /></div>
              <div style={{ flex: 1 }}><Field label="Storage" value={(data.storage as string) || ''} onChange={(v) => onChange('storage', v)} placeholder="500 GB" mono /></div>
            </div>
          )}
          {nodeType === 'docker' && (
            <>
              <Field label="Container Name" value={(data.container_name as string) || ''} onChange={(v) => onChange('container_name', v)} />
              <Field label="Image" value={(data.image as string) || ''} onChange={(v) => onChange('image', v)} placeholder="nginx:1.25-alpine" />
              <Field label="Exposed Ports" value={(data.port as string) || ''} onChange={(v) => onChange('port', v)} placeholder="80:8080" mono />
              <Field label="Volumes" value={(data.volumes as string) || ''} onChange={(v) => onChange('volumes', v)} />
              <Field label="Env Vars" value={(data.env_vars as string) || ''} onChange={(v) => onChange('env_vars', v)} multiline />
              {renderSelect('Network Mode', 'network_mode', ['bridge', 'host', 'none', 'custom'])}
              {renderSelect('Restart Policy', 'restart_policy', ['always', 'on-failure', 'unless-stopped'])}
            </>
          )}
          {nodeType === 'kubernetes' && (
            <>
              {renderSelect('Resource Type', 'resource_type', ['Cluster', 'Node', 'Pod', 'Deployment', 'Service', 'Ingress'])}
              <Field label="Namespace" value={(data.namespace as string) || ''} onChange={(v) => onChange('namespace', v)} />
              <Field label="Image" value={(data.image as string) || ''} onChange={(v) => onChange('image', v)} />
              <Field label="Replicas" value={(data.replicas as string) || ''} onChange={(v) => onChange('replicas', v)} />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ flex: 1 }}><Field label="CPU Req/Lim" value={(data.cpu_limit as string) || ''} onChange={(v) => onChange('cpu_limit', v)} /></div>
                <div style={{ flex: 1 }}><Field label="Mem Req/Lim" value={(data.memory_limit as string) || ''} onChange={(v) => onChange('memory_limit', v)} /></div>
              </div>
              {renderSelect('Service Type', 'service_type', ['ClusterIP', 'NodePort', 'LoadBalancer'])}
            </>
          )}
        </>
      )}

      {/* Category: Cloud */}
      {category === 'cloud' && (
        <>
          <SectionTitle>Cloud Configuration ({nodeType})</SectionTitle>
          {renderSelect('Provider', 'provider', ['AWS', 'Azure', 'GCP'])}
          <Field label="Service Name" value={(data.service_name as string) || ''} onChange={(v) => onChange('service_name', v)} placeholder="EC2, S3, RDS..." />
          <Field label="Region" value={(data.region as string) || ''} onChange={(v) => onChange('region', v)} placeholder="ap-southeast-1" mono />
          <Field label="Resource ID / ARN" value={(data.resource_id as string) || ''} onChange={(v) => onChange('resource_id', v)} />
          <Field label="Instance Type" value={(data.instanceType as string) || ''} onChange={(v) => onChange('instanceType', v)} placeholder="t3.medium" mono />
          <Field label="Pricing Tier" value={(data.pricing_tier as string) || ''} onChange={(v) => onChange('pricing_tier', v)} />
          <Field label="Endpoint URL" value={(data.endpoint_url as string) || ''} onChange={(v) => onChange('endpoint_url', v)} mono />
          {renderCheckbox('Auto Scaling', 'auto_scaling')}
        </>
      )}

      {/* Category: IoT / Embedded */}
      {category === 'iot' && (
        <>
          <SectionTitle>IoT Configuration ({nodeType})</SectionTitle>
          <Field label="Board Model" value={(data.board_model as string) || ''} onChange={(v) => onChange('board_model', v)} placeholder="ESP32-WROOM-32" />
          <Field label="Firmware Version" value={(data.firmware_version as string) || ''} onChange={(v) => onChange('firmware_version', v)} />
          {renderSelect('Connection Method', 'connection_method', ['WiFi', 'Bluetooth', 'LoRa', 'Serial/UART', 'Ethernet'])}
          {renderSelect('Protocol', 'protocol', ['MQTT', 'HTTP', 'Modbus', 'CoAP'])}
          <Field label="Sensors / Actuators" value={(data.sensors_actuators as string) || ''} onChange={(v) => onChange('sensors_actuators', v)} placeholder="DHT22, Relay 4ch" />
          {renderSelect('Power Source', 'power_source', ['USB', 'Battery', 'PoE', 'Solar'])}
          <Field label="Broker Target" value={(data.broker_target as string) || ''} onChange={(v) => onChange('broker_target', v)} />
          <Field label="IP Address" value={(data.ip as string) || ''} onChange={(v) => onChange('ip', v)} mono />
        </>
      )}

      {/* Category: Data */}
      {category === 'data' && (
        <>
          <SectionTitle>Data Configuration ({nodeType})</SectionTitle>
          {['database', 'postgresql', 'mysql', 'mongodb'].includes(nodeType) && (
            <>
              {renderSelect('Engine', 'engine', ['PostgreSQL', 'MySQL', 'MongoDB', 'SQLite'])}
              <Field label="Version" value={(data.version as string) || ''} onChange={(v) => onChange('version', v)} />
              <Field label="DB Name" value={(data.db_name as string) || ''} onChange={(v) => onChange('db_name', v)} />
              <Field label="Host / IP" value={(data.ip as string) || ''} onChange={(v) => onChange('ip', v)} mono />
              <Field label="Port" value={(data.port as string) || ''} onChange={(v) => onChange('port', v)} mono />
              <Field label="Connection Pool Size" value={(data.connection_pool_size as string) || ''} onChange={(v) => onChange('connection_pool_size', v)} />
              {renderSelect('Replication', 'replication', ['None', 'Primary-Replica', 'Multi-Master'])}
            </>
          )}
          {nodeType === 'redis' && (
            <>
              {renderSelect('Usage', 'usage', ['Cache', 'Session Store', 'Pub/Sub', 'Queue'])}
              <Field label="Eviction Policy" value={(data.eviction_policy as string) || ''} onChange={(v) => onChange('eviction_policy', v)} placeholder="allkeys-lru" />
              {renderSelect('Persistence', 'persistence', ['RDB', 'AOF', 'None'])}
              {renderCheckbox('Cluster Mode', 'cluster_mode')}
            </>
          )}
          {['storage', 'minio'].includes(nodeType) && (
            <>
              {renderSelect('Storage Type', 'storage_type', ['Object Storage', 'Block Storage', 'File Storage'])}
              <Field label="Bucket Name" value={(data.bucket_name as string) || ''} onChange={(v) => onChange('bucket_name', v)} />
              <Field label="Capacity" value={(data.capacity as string) || ''} onChange={(v) => onChange('capacity', v)} />
              {renderSelect('Access Policy', 'access_policy', ['Private', 'Public Read', 'Custom'])}
            </>
          )}
          {['kafka', 'rabbitmq'].includes(nodeType) && (
            <>
              {renderSelect('Broker Type', 'broker_type', ['Kafka', 'RabbitMQ'])}
              <Field label="Topics or Queues" value={(data.topics_or_queues as string) || ''} onChange={(v) => onChange('topics_or_queues', v)} />
              <Field label="Partition Count (Kafka)" value={(data.partition_count as string) || ''} onChange={(v) => onChange('partition_count', v)} />
              {renderSelect('Exchange Type (RabbitMQ)', 'exchange_type', ['direct', 'topic', 'fanout'])}
              <Field label="Retention Policy" value={(data.retention_policy as string) || ''} onChange={(v) => onChange('retention_policy', v)} />
            </>
          )}
          {nodeType === 'mqtt' && (
            <>
              <Field label="Broker Software" value={(data.broker_software as string) || ''} onChange={(v) => onChange('broker_software', v)} placeholder="Mosquitto, EMQX" />
              <Field label="Topics" value={(data.topics as string) || ''} onChange={(v) => onChange('topics', v)} />
              {renderSelect('QoS Level', 'qos_level', ['0', '1', '2'])}
              {renderCheckbox('Auth Enabled', 'auth_enabled')}
            </>
          )}
        </>
      )}

      {/* Category: App */}
      {category === 'app' && (
        <>
          <SectionTitle>App Configuration ({nodeType})</SectionTitle>
          {renderSelect('App Type', 'app_type', ['API', 'Frontend', 'Backend', 'Microservice'])}
          <Field label="Tech Stack" value={(data.tech_stack as string) || ''} onChange={(v) => onChange('tech_stack', v)} placeholder="Next.js, NestJS" />
          <Field label="Repo URL" value={(data.repo_url as string) || ''} onChange={(v) => onChange('repo_url', v)} />
          <Field label="Base URL / Endpoint" value={(data.endpoint as string) || ''} onChange={(v) => onChange('endpoint', v)} mono />
          <Field label="Port" value={(data.port as string) || ''} onChange={(v) => onChange('port', v)} mono />
          <Field label="Deployment Target" value={(data.deployment_target as string) || ''} onChange={(v) => onChange('deployment_target', v)} />
          <Field label="Depends On" value={(data.depends_on as string) || ''} onChange={(v) => onChange('depends_on', v)} placeholder="DB, Redis" />
          <Field label="Version" value={(data.version as string) || ''} onChange={(v) => onChange('version', v)} />
        </>
      )}

      {/* Category: Observability */}
      {category === 'observability' && (
        <>
          <SectionTitle>Observability ({nodeType})</SectionTitle>
          {renderSelect('Tool', 'tool', ['Prometheus', 'Grafana', 'Loki'])}
          {renderSelect('Role', 'role', ['Metrics Collector', 'Dashboard', 'Log Aggregator'])}
          <Field label="Scrape Targets" value={(data.scrape_targets as string) || ''} onChange={(v) => onChange('scrape_targets', v)} />
          <Field label="Retention Period" value={(data.retention_period as string) || ''} onChange={(v) => onChange('retention_period', v)} />
          <Field label="Dashboard URL" value={(data.dashboard_url as string) || ''} onChange={(v) => onChange('dashboard_url', v)} mono />
          {renderCheckbox('Alerting Enabled', 'alerting_enabled')}
        </>
      )}

      {/* Category: Endpoint */}
      {category === 'endpoint' && (
        <>
          <SectionTitle>Endpoint Configuration ({nodeType})</SectionTitle>
          {renderSelect('Device Type', 'device_type', ['Printer', 'Laptop', 'PC', 'Mobile'])}
          <Field label="OS" value={(data.os as string) || ''} onChange={(v) => onChange('os', v)} />
          <Field label="Owner / User" value={(data.owner_user as string) || ''} onChange={(v) => onChange('owner_user', v)} />
          {renderSelect('Connection Method', 'connection_method', ['LAN', 'WiFi', 'Bluetooth'])}
          <Field label="Asset Tag" value={(data.asset_tag as string) || ''} onChange={(v) => onChange('asset_tag', v)} />
          <Field label="IP Address" value={(data.ip as string) || ''} onChange={(v) => onChange('ip', v)} mono />
        </>
      )}

      {/* Default Category Fallback */}
      {['default'].includes(category) && (
        <>
          <SectionTitle>Configuration</SectionTitle>
          <Field label="IP / Endpoint" value={(data.ip as string) || ''} onChange={(v) => onChange('ip', v)} placeholder="192.168.1.1" mono />
          <Field label="Port" value={(data.port as string) || ''} onChange={(v) => onChange('port', v)} placeholder="8080" mono />
        </>
      )}
    </>
  );
}

// ─── ERD Panel ────────────────────────────────────────────────────────────────
interface ErdColumn {
  id: string;
  name: string;
  type: string;
  isPk: boolean;
  isFk: boolean;
  isNullable: boolean;
  isUnique: boolean;
}

function ErdPanel({ data, onChange }: { data: Record<string, unknown>; onChange: (k: string, v: unknown) => void }) {
  const columns: ErdColumn[] = (data.columns as ErdColumn[]) || [];

  const addColumn = () => {
    const newCol: ErdColumn = { id: uuidv4(), name: 'column', type: 'VARCHAR', isPk: false, isFk: false, isNullable: true, isUnique: false };
    onChange('columns', [...columns, newCol]);
  };

  const updateColumn = (idx: number, field: keyof ErdColumn, value: unknown) => {
    const updated = columns.map((c, i) => i === idx ? { ...c, [field]: value } : c);
    onChange('columns', updated);
  };

  const removeColumn = (idx: number) => {
    onChange('columns', columns.filter((_, i) => i !== idx));
  };

  return (
    <>
      <Field label="Table Name" value={(data.tableName as string) || (data.label as string) || ''} onChange={(v) => { onChange('tableName', v); onChange('label', v); }} placeholder="table_name" mono />
      <div className="divider" />
      <SectionTitle>Columns</SectionTitle>
      {columns.map((col, idx) => (
        <div key={col.id} style={{ background: 'hsl(var(--surface-2))', borderRadius: 6, border: '1px solid hsl(var(--border-subtle))', padding: '0.5rem', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.375rem' }}>
            <input className="input" style={{ flex: 2, fontSize: '0.8rem', fontFamily: 'monospace' }} placeholder="col_name" value={col.name} onChange={(e) => updateColumn(idx, 'name', e.target.value)} />
            <input className="input" style={{ flex: 1, fontSize: '0.8rem', fontFamily: 'monospace' }} placeholder="type" value={col.type} onChange={(e) => updateColumn(idx, 'type', e.target.value)} />
            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => removeColumn(idx)} style={{ color: 'hsl(var(--danger))', flexShrink: 0 }}>
              <Trash2 size={12} />
            </button>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {(['isPk', 'isFk', 'isNullable', 'isUnique'] as (keyof ErdColumn)[]).map((flag) => (
              <label key={flag} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', cursor: 'pointer', color: 'hsl(var(--foreground-muted))' }}>
                <input type="checkbox" checked={!!col[flag]} onChange={(e) => updateColumn(idx, flag, e.target.checked)} style={{ accentColor: 'hsl(var(--primary))' }} />
                {flag.replace('is', '')}
              </label>
            ))}
          </div>
        </div>
      ))}
      <button className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center', borderStyle: 'dashed', borderColor: 'hsl(var(--border))' }} onClick={addColumn}>
        <Plus size={13} /> Add Column
      </button>
    </>
  );
}

// ─── UML Panel ────────────────────────────────────────────────────────────────
interface UmlAttribute {
  id: string;
  visibility: string;
  name: string;
  type: string;
  isStatic: boolean;
}

interface UmlMethod {
  id: string;
  visibility: string;
  name: string;
  returnType: string;
  params: string;
  isStatic: boolean;
  isAbstract: boolean;
}

function UmlPanel({ data, onChange }: { data: Record<string, unknown>; onChange: (k: string, v: unknown) => void }) {
  const attrs: UmlAttribute[] = (data.attributes as UmlAttribute[]) || [];
  const methods: UmlMethod[] = (data.methods as UmlMethod[]) || [];
  const VISIBILITIES = ['+', '-', '#', '~'];

  const addAttr = () => onChange('attributes', [...attrs, { id: uuidv4(), visibility: '+', name: 'attribute', type: 'String', isStatic: false }]);
  const updateAttr = (idx: number, field: keyof UmlAttribute, value: unknown) => onChange('attributes', attrs.map((a, i) => i === idx ? { ...a, [field]: value } : a));
  const removeAttr = (idx: number) => onChange('attributes', attrs.filter((_, i) => i !== idx));

  const addMethod = () => onChange('methods', [...methods, { id: uuidv4(), visibility: '+', name: 'method', returnType: 'void', params: '', isStatic: false, isAbstract: false }]);
  const updateMethod = (idx: number, field: keyof UmlMethod, value: unknown) => onChange('methods', methods.map((m, i) => i === idx ? { ...m, [field]: value } : m));
  const removeMethod = (idx: number) => onChange('methods', methods.filter((_, i) => i !== idx));

  return (
    <>
      <Field label="Class Name" value={(data.label as string) || ''} onChange={(v) => onChange('label', v)} placeholder="ClassName" />
      <Field label="Stereotype" value={(data.stereotype as string) || ''} onChange={(v) => onChange('stereotype', v)} placeholder="<<interface>>" mono />
      <div className="divider" />
      <SectionTitle>Attributes</SectionTitle>
      {attrs.map((a, idx) => (
        <div key={a.id} style={{ display: 'flex', gap: '0.375rem', marginBottom: '0.375rem', alignItems: 'center' }}>
          <select className="input" style={{ width: 44, fontSize: '0.8rem', padding: '0.3rem 0.2rem', fontFamily: 'monospace' }} value={a.visibility} onChange={(e) => updateAttr(idx, 'visibility', e.target.value)}>
            {VISIBILITIES.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          <input className="input" style={{ flex: 2, fontSize: '0.8rem', fontFamily: 'monospace' }} placeholder="name" value={a.name} onChange={(e) => updateAttr(idx, 'name', e.target.value)} />
          <input className="input" style={{ flex: 1, fontSize: '0.8rem', fontFamily: 'monospace' }} placeholder="Type" value={a.type} onChange={(e) => updateAttr(idx, 'type', e.target.value)} />
          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => removeAttr(idx)} style={{ color: 'hsl(var(--danger))' }}><Trash2 size={12} /></button>
        </div>
      ))}
      <button className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center', borderStyle: 'dashed', borderColor: 'hsl(var(--border))', marginBottom: '1rem' }} onClick={addAttr}><Plus size={13} /> Add Attribute</button>

      <SectionTitle>Methods</SectionTitle>
      {methods.map((m, idx) => (
        <div key={m.id} style={{ background: 'hsl(var(--surface-2))', borderRadius: 6, border: '1px solid hsl(var(--border-subtle))', padding: '0.5rem', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '0.375rem' }}>
            <select className="input" style={{ width: 44, fontSize: '0.8rem', padding: '0.3rem 0.2rem', fontFamily: 'monospace' }} value={m.visibility} onChange={(e) => updateMethod(idx, 'visibility', e.target.value)}>
              {VISIBILITIES.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            <input className="input" style={{ flex: 2, fontSize: '0.8rem', fontFamily: 'monospace' }} placeholder="method" value={m.name} onChange={(e) => updateMethod(idx, 'name', e.target.value)} />
            <input className="input" style={{ flex: 1, fontSize: '0.8rem', fontFamily: 'monospace' }} placeholder="return" value={m.returnType} onChange={(e) => updateMethod(idx, 'returnType', e.target.value)} />
            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => removeMethod(idx)} style={{ color: 'hsl(var(--danger))' }}><Trash2 size={12} /></button>
          </div>
          <input className="input" style={{ fontSize: '0.8rem', fontFamily: 'monospace', marginBottom: '0.375rem' }} placeholder="params: String, count: int" value={m.params} onChange={(e) => updateMethod(idx, 'params', e.target.value)} />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', cursor: 'pointer', color: 'hsl(var(--foreground-muted))' }}>
              <input type="checkbox" checked={m.isStatic} onChange={(e) => updateMethod(idx, 'isStatic', e.target.checked)} style={{ accentColor: 'hsl(var(--primary))' }} /> static
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', cursor: 'pointer', color: 'hsl(var(--foreground-muted))' }}>
              <input type="checkbox" checked={m.isAbstract} onChange={(e) => updateMethod(idx, 'isAbstract', e.target.checked)} style={{ accentColor: 'hsl(var(--primary))' }} /> abstract
            </label>
          </div>
        </div>
      ))}
      <button className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center', borderStyle: 'dashed', borderColor: 'hsl(var(--border))' }} onClick={addMethod}><Plus size={13} /> Add Method</button>
    </>
  );
}

// ─── Flow Panel ────────────────────────────────────────────────────────────────
function FlowPanel({ data, onChange }: { data: Record<string, unknown>; onChange: (k: string, v: unknown) => void }) {
  const SHAPES = ['process', 'decision', 'start', 'end', 'io', 'document', 'swimlane', 'annotation'];
  return (
    <>
      <Field label="Label" value={(data.label as string) || ''} onChange={(v) => onChange('label', v)} placeholder="Step label" />
      <div style={{ marginBottom: '0.875rem' }}>
        <label style={{ display: 'block', fontSize: '0.75rem', color: 'hsl(var(--foreground-muted))', marginBottom: '0.3rem' }}>Shape</label>
        <select className="input" value={(data.shape as string) || 'process'} onChange={(e) => onChange('shape', e.target.value)}>
          {SHAPES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>
      <Field label="Description" value={(data.description as string) || ''} onChange={(v) => onChange('description', v)} placeholder="Optional" multiline />
    </>
  );
}

// ─── Shared components ─────────────────────────────────────────────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '0.5rem', fontSize: '0.7rem', fontWeight: 600, color: 'hsl(var(--foreground-subtle))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {children}
    </div>
  );
}

function Field({
  label, value, onChange, placeholder, multiline, mono,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; multiline?: boolean; mono?: boolean;
}) {
  return (
    <div style={{ marginBottom: '0.875rem' }}>
      <label style={{ display: 'block', fontSize: '0.75rem', color: 'hsl(var(--foreground-muted))', marginBottom: '0.3rem' }}>
        {label}
      </label>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3} className="input" style={{ resize: 'vertical', fontFamily: mono ? 'monospace' : 'inherit', fontSize: '0.8125rem' }} />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="input" style={{ fontFamily: mono ? 'monospace' : 'inherit', fontSize: '0.8125rem' }} />
      )}
    </div>
  );
}
