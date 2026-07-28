// ─── Topology Palette ───────────────────────────────────────────────────────
export const TOPOLOGY_PALETTE = [
  {
    category: 'network',
    label: 'Network',
    items: [
      { type: 'topology', label: 'Router', category: 'network' },
      { type: 'topology', label: 'Switch', category: 'network' },
      { type: 'topology', label: 'Firewall', category: 'network' },
      { type: 'topology', label: 'Load Balancer', category: 'network' },
      { type: 'topology', label: 'VPN', category: 'network' },
      { type: 'topology', label: 'Nginx', category: 'network' },
      { type: 'topology', label: 'HAProxy', category: 'network' },
      { type: 'topology', label: 'DNS', category: 'network' },
      { type: 'topology', label: 'CDN', category: 'network' },
    ],
  },
  {
    category: 'compute',
    label: 'Compute',
    items: [
      { type: 'topology', label: 'Server', category: 'compute' },
      { type: 'topology', label: 'VM', category: 'compute' },
      { type: 'topology', label: 'Docker', category: 'compute' },
      { type: 'topology', label: 'Kubernetes', category: 'compute' },
      { type: 'topology', label: 'Lambda', category: 'compute' },
      { type: 'topology', label: 'Container', category: 'compute' },
    ],
  },
  {
    category: 'cloud',
    label: 'Cloud',
    items: [
      { type: 'topology', label: 'AWS', category: 'cloud' },
      { type: 'topology', label: 'Azure', category: 'cloud' },
      { type: 'topology', label: 'GCP', category: 'cloud' },
      { type: 'topology', label: 'Cloudflare', category: 'cloud' },
      { type: 'topology', label: 'Vercel', category: 'cloud' },
      { type: 'topology', label: 'Digital Ocean', category: 'cloud' },
    ],
  },
  {
    category: 'data',
    label: 'Data',
    items: [
      { type: 'topology', label: 'Database', category: 'data' },
      { type: 'topology', label: 'PostgreSQL', category: 'data' },
      { type: 'topology', label: 'MySQL', category: 'data' },
      { type: 'topology', label: 'MongoDB', category: 'data' },
      { type: 'topology', label: 'Redis', category: 'data' },
      { type: 'topology', label: 'Storage', category: 'data' },
      { type: 'topology', label: 'Kafka', category: 'data' },
      { type: 'topology', label: 'RabbitMQ', category: 'data' },
      { type: 'topology', label: 'MQTT', category: 'data' },
      { type: 'topology', label: 'Elasticsearch', category: 'data' },
      { type: 'topology', label: 'MinIO', category: 'data' },
    ],
  },
  {
    category: 'app',
    label: 'Application',
    items: [
      { type: 'topology', label: 'API Gateway', category: 'app' },
      { type: 'topology', label: 'Frontend', category: 'app' },
      { type: 'topology', label: 'Backend', category: 'app' },
      { type: 'topology', label: 'Microservice', category: 'app' },
      { type: 'topology', label: 'Auth Service', category: 'app' },
      { type: 'topology', label: 'Notification', category: 'app' },
      { type: 'topology', label: 'File Service', category: 'app' },
    ],
  },
  {
    category: 'iot',
    label: 'IoT / Embedded',
    items: [
      { type: 'topology', label: 'ESP32', category: 'iot' },
      { type: 'topology', label: 'Arduino', category: 'iot' },
      { type: 'topology', label: 'Raspberry Pi', category: 'iot' },
      { type: 'topology', label: 'IoT Gateway', category: 'iot' },
      { type: 'topology', label: 'Sensor', category: 'iot' },
      { type: 'topology', label: 'Actuator', category: 'iot' },
    ],
  },
  {
    category: 'observability',
    label: 'Observability',
    items: [
      { type: 'topology', label: 'Prometheus', category: 'observability' },
      { type: 'topology', label: 'Grafana', category: 'observability' },
      { type: 'topology', label: 'Loki', category: 'observability' },
      { type: 'topology', label: 'Jaeger', category: 'observability' },
      { type: 'topology', label: 'Datadog', category: 'observability' },
    ],
  },
  {
    category: 'endpoint',
    label: 'Endpoints',
    items: [
      { type: 'topology', label: 'Laptop', category: 'endpoint' },
      { type: 'topology', label: 'PC', category: 'endpoint' },
      { type: 'topology', label: 'Mobile', category: 'endpoint' },
      { type: 'topology', label: 'Tablet', category: 'endpoint' },
      { type: 'topology', label: 'Printer', category: 'endpoint' },
      { type: 'topology', label: 'Browser', category: 'endpoint' },
    ],
  },
];

// ─── ERD Palette ────────────────────────────────────────────────────────────
export const ERD_PALETTE = [
  {
    category: 'erd',
    label: 'ERD',
    items: [
      {
        type: 'erd',
        label: 'Entity / Table',
        category: 'erd',
        defaultData: {
          tableName: 'Table',
          columns: [
            { id: '1', name: 'id', type: 'UUID', isPk: true, isFk: false, isNullable: false, isUnique: true },
            { id: '2', name: 'created_at', type: 'TIMESTAMP', isPk: false, isFk: false, isNullable: false, isUnique: false },
          ],
        },
      },
      {
        type: 'erd',
        label: 'Join Table',
        category: 'erd',
        defaultData: {
          tableName: 'JoinTable',
          columns: [
            { id: '1', name: 'entity_a_id', type: 'UUID', isPk: true, isFk: true, isNullable: false, isUnique: false },
            { id: '2', name: 'entity_b_id', type: 'UUID', isPk: true, isFk: true, isNullable: false, isUnique: false },
          ],
        },
      },
    ],
  },
];

// ─── UML Palette ─────────────────────────────────────────────────────────────
export const UML_PALETTE = [
  {
    category: 'uml-class',
    label: 'Class Diagram',
    items: [
      {
        type: 'uml',
        label: 'Class',
        category: 'uml-class',
        defaultData: { label: 'ClassName', stereotype: '', attributes: [], methods: [] },
      },
      {
        type: 'uml',
        label: 'Interface',
        category: 'uml-class',
        defaultData: { label: 'IInterface', stereotype: '<<interface>>', attributes: [], methods: [] },
      },
      {
        type: 'uml',
        label: 'Abstract Class',
        category: 'uml-class',
        defaultData: { label: 'AbstractClass', stereotype: '<<abstract>>', attributes: [], methods: [] },
      },
      {
        type: 'uml',
        label: 'Enum',
        category: 'uml-class',
        defaultData: { label: 'EnumName', stereotype: '<<enumeration>>', attributes: [], methods: [] },
      },
    ],
  },
  {
    category: 'uml-usecase',
    label: 'Use Case',
    items: [
      {
        type: 'uml',
        label: 'Actor',
        category: 'uml-usecase',
        defaultData: { label: 'Actor', stereotype: '<<actor>>', attributes: [], methods: [] },
      },
      {
        type: 'uml',
        label: 'Use Case',
        category: 'uml-usecase',
        defaultData: { label: 'Use Case', stereotype: '<<use case>>', attributes: [], methods: [] },
      },
      {
        type: 'uml',
        label: 'System Boundary',
        category: 'uml-usecase',
        defaultData: { label: 'System', stereotype: '<<system>>', attributes: [], methods: [] },
      },
    ],
  },
];

// ─── Flow Palette ────────────────────────────────────────────────────────────
export const FLOW_PALETTE = [
  {
    category: 'flow-basic',
    label: 'Flowchart',
    items: [
      { type: 'flow', label: 'Start', category: 'flow-basic', defaultData: { label: 'Start', shape: 'start' } },
      { type: 'flow', label: 'End', category: 'flow-basic', defaultData: { label: 'End', shape: 'end' } },
      { type: 'flow', label: 'Process', category: 'flow-basic', defaultData: { label: 'Process', shape: 'process' } },
      { type: 'flow', label: 'Decision', category: 'flow-basic', defaultData: { label: 'Decision?', shape: 'decision' } },
      { type: 'flow', label: 'Input/Output', category: 'flow-basic', defaultData: { label: 'I/O', shape: 'io' } },
      { type: 'flow', label: 'Document', category: 'flow-basic', defaultData: { label: 'Document', shape: 'document' } },
      { type: 'flow', label: 'Annotation', category: 'flow-basic', defaultData: { label: 'Note', shape: 'annotation' } },
    ],
  },
  {
    category: 'flow-swim',
    label: 'Swimlane',
    items: [
      { type: 'flow', label: 'Lane', category: 'flow-swim', defaultData: { label: 'Lane', shape: 'swimlane' } },
    ],
  },
  {
    category: 'flow-cicd',
    label: 'CI/CD Pipeline',
    items: [
      { type: 'flow', label: 'Source', category: 'flow-cicd', defaultData: { label: 'Source Code', shape: 'process' } },
      { type: 'flow', label: 'Build', category: 'flow-cicd', defaultData: { label: 'Build', shape: 'process' } },
      { type: 'flow', label: 'Test', category: 'flow-cicd', defaultData: { label: 'Test', shape: 'process' } },
      { type: 'flow', label: 'Deploy', category: 'flow-cicd', defaultData: { label: 'Deploy', shape: 'process' } },
      { type: 'flow', label: 'Gate', category: 'flow-cicd', defaultData: { label: 'Gate?', shape: 'decision' } },
    ],
  },
];

// ─── Palette resolver by canvas type ─────────────────────────────────────────
export function getPaletteForType(canvasType?: string) {
  switch (canvasType) {
    case 'ERD':
      return ERD_PALETTE;
    case 'UML':
      return UML_PALETTE;
    case 'FLOW':
    case 'CICD':
    case 'SEQUENCE':
      return FLOW_PALETTE;
    case 'TOPOLOGY':
    default:
      return TOPOLOGY_PALETTE;
  }
}
