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
    ],
  },
  {
    category: 'cloud',
    label: 'Cloud',
    items: [
      { type: 'topology', label: 'AWS', category: 'cloud' },
      { type: 'topology', label: 'Azure', category: 'cloud' },
      { type: 'topology', label: 'GCP', category: 'cloud' },
    ],
  },
  {
    category: 'data',
    label: 'Data',
    items: [
      { type: 'topology', label: 'Database', category: 'data' },
      { type: 'topology', label: 'Redis', category: 'data' },
      { type: 'topology', label: 'Storage', category: 'data' },
      { type: 'topology', label: 'Kafka', category: 'data' },
      { type: 'topology', label: 'RabbitMQ', category: 'data' },
      { type: 'topology', label: 'MQTT', category: 'data' },
    ],
  },
  {
    category: 'app',
    label: 'Application',
    items: [
      { type: 'topology', label: 'API', category: 'app' },
      { type: 'topology', label: 'Frontend', category: 'app' },
      { type: 'topology', label: 'Backend', category: 'app' },
      { type: 'topology', label: 'Microservice', category: 'app' },
    ],
  },
  {
    category: 'iot',
    label: 'IoT / Embedded',
    items: [
      { type: 'topology', label: 'ESP32', category: 'iot' },
      { type: 'topology', label: 'Arduino', category: 'iot' },
      { type: 'topology', label: 'Raspberry Pi', category: 'iot' },
    ],
  },
  {
    category: 'observability',
    label: 'Observability',
    items: [
      { type: 'topology', label: 'Prometheus', category: 'observability' },
      { type: 'topology', label: 'Grafana', category: 'observability' },
      { type: 'topology', label: 'Loki', category: 'observability' },
    ],
  },
  {
    category: 'endpoint',
    label: 'Endpoints',
    items: [
      { type: 'topology', label: 'Laptop', category: 'endpoint' },
      { type: 'topology', label: 'PC', category: 'endpoint' },
      { type: 'topology', label: 'Mobile', category: 'endpoint' },
      { type: 'topology', label: 'Printer', category: 'endpoint' },
    ],
  },
];
