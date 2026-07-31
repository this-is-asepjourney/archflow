import React from 'react';
import {
  Router,
  Server,
  Database,
  Cloud,
  Monitor,
  Smartphone,
  Cpu,
  Wifi,
  Shield,
  Activity,
  Network,
  Box,
  HardDrive,
  Lock,
  Printer,
  Share2
} from 'lucide-react';

interface DeviceIconProps {
  type: string;
  size?: number;
  className?: string;
  color?: string;
}

const brandMap: Record<string, string> = {
  aws: 'amazonaws',
  azure: 'microsoftazure',
  gcp: 'googlecloud',
  cloudflare: 'cloudflare',
  vercel: 'vercel',
  'digital-ocean': 'digitalocean',
  postgresql: 'postgresql',
  mysql: 'mysql',
  mongodb: 'mongodb',
  redis: 'redis',
  kafka: 'apachekafka',
  rabbitmq: 'rabbitmq',
  mqtt: 'mqtt',
  elasticsearch: 'elasticsearch',
  minio: 'minio',
  docker: 'docker',
  kubernetes: 'kubernetes',
  lambda: 'awslambda',
  nginx: 'nginx',
  haproxy: 'haproxy',
  prometheus: 'prometheus',
  grafana: 'grafana',
  loki: 'loki', 
  vue: 'vuedotjs',
  react: 'react',
  angular: 'angular',
  nextjs: 'nextdotjs',
  nestjs: 'nestjs',
  nodejs: 'nodedotjs'
};

const iconMap: Record<string, React.ElementType> = {
  router: Router,
  switch: Share2,
  firewall: Shield,
  'load-balancer': Activity,
  vpn: Lock,
  server: Server,
  vm: Monitor,
  container: Box,
  database: Database,
  storage: HardDrive,
  esp32: Wifi,
  arduino: Cpu,
  'raspberry-pi': Cpu,
  printer: Printer,
  laptop: Monitor,
  pc: Monitor,
  mobile: Smartphone,
  api: Network,
  frontend: Monitor,
  backend: Server,
  microservice: Box,
  default: Box,
};

export function DeviceIcon({ type, size = 24, className = '' }: DeviceIconProps) {
  const normalizedType = type.toLowerCase().replace(/\s+/g, '-');
  
  if (brandMap[normalizedType]) {
    const slug = brandMap[normalizedType];
    return (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://cdn.simpleicons.org/${slug}`}
          alt={type}
          width={size}
          height={size}
          className={className}
          style={{ objectFit: 'contain' }}
        />
      </>
    );
  }

  const IconComponent = iconMap[normalizedType] || iconMap.default;
  return <IconComponent size={size} className={className} />;
}
