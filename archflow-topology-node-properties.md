# ArchFlow — Topology Builder: Node Properties Schema

> Dokumen ini melengkapi **ArchFlow Blueprint** bagian 5 (Topology Builder) dan bagian 18 (Modul Database — entity `Node`). Isinya: rancangan field/properties untuk tiap kategori node yang didukung, supaya panel properti di canvas dan hasil export dokumentasi punya data yang konsisten.

---

## 1. Properties Umum (semua node, semua kategori)

Field ini melekat di entity `Node` inti (bukan di kolom JSON), karena dipakai lintas modul (Topology/Flow/UML/ERD/Infrastructure) dan untuk rendering canvas.

| Field | Tipe Data | Keterangan |
|---|---|---|
| `id` | UUID | primary key node |
| `diagram_id` | FK → Diagram | node ini milik diagram/canvas mana |
| `type` | enum | `router`, `switch`, `server`, `esp32`, dst — menentukan template properties mana yang dipakai |
| `category` | enum | `network`, `compute`, `cloud`, `iot`, `data`, `aplikasi`, `observability`, `endpoint` |
| `label` | string | nama tampilan node |
| `icon` | string | key/path icon |
| `position_x`, `position_y` | number | posisi di canvas |
| `width`, `height` | number | ukuran node (resizable) |
| `status` | enum | `active`, `inactive`, `maintenance`, `error`, `planned` |
| `environment` | enum | `production`, `staging`, `development`, `local` — sesuai catatan di Blueprint §5 |
| `ip_address` | string | opsional, dipakai node yang relevan |
| `port` | string/array | opsional, sesuai catatan Blueprint §5 |
| `spesifikasi` | text | free text, sesuai catatan Blueprint §5 |
| `description` | text | deskripsi bebas |
| `tags` | array | untuk filter/search node |
| `properties` | JSONB | field spesifik per `type`, lihat bagian 2–9 |
| `linked_requirement_ids` | array/FK | link ke Requirement/ADR/Risk di Blueprint Builder |

Kolom `properties` (JSONB) inilah yang menampung field-field spesifik di bawah — polanya: sistem load "template properties" berdasarkan `type` node, lalu render dynamic form. Pendekatan ini konsisten dengan stack PostgreSQL + Prisma yang sudah dipilih.

---

## 2. Kategori: Network

Node: Router, Switch, Firewall, Load Balancer, VPN, Nginx

### Router
| Field | Tipe | Contoh |
|---|---|---|
| `hostname` | string | `RTR-CORE-01` |
| `wan_ip` | string | IP publik/WAN |
| `lan_ip` | string | `192.168.1.1/24` |
| `gateway` | string | default gateway |
| `dns_servers` | array | `["8.8.8.8", "1.1.1.1"]` |
| `routing_protocol` | enum | `static`, `OSPF`, `BGP`, `RIP` |
| `wan_type` | enum | `PPPoE`, `DHCP`, `Static IP` |
| `nat_enabled` | boolean | |
| `vlan_support` | boolean | |
| `bandwidth_limit` | string | `50 Mbps up/down` |
| `firmware_version` | string | |

### Switch
| Field | Tipe | Contoh |
|---|---|---|
| `hostname` | string | |
| `switch_type` | enum | `managed`, `unmanaged`, `smart` |
| `port_count` | number | |
| `port_speed` | string | `10/100/1000 Mbps` |
| `poe_support` | boolean | |
| `vlan_config` | array | daftar VLAN ID |
| `uplink_port` | string | |
| `management_ip` | string | |
| `stp_enabled` | boolean | |

### Firewall
| Field | Tipe | Contoh |
|---|---|---|
| `hostname` | string | |
| `firewall_type` | enum | `Hardware`, `Software`, `Cloud-based` |
| `policy_mode` | enum | `Allow by default`, `Deny by default` |
| `rules_count` | number | |
| `ips_ids_enabled` | boolean | |
| `zones` | array | `["WAN", "LAN", "DMZ"]` |
| `throughput` | string | |

### Load Balancer
| Field | Tipe | Contoh |
|---|---|---|
| `algorithm` | enum | `Round Robin`, `Least Connections`, `IP Hash` |
| `backend_targets` | array/FK | list node backend yang di-load balance |
| `health_check_path` | string | `/health` |
| `ssl_termination` | boolean | |
| `sticky_session` | boolean | |

### VPN
| Field | Tipe | Contoh |
|---|---|---|
| `vpn_type` | enum | `Site-to-Site`, `Point-to-Site`, `Remote Access` |
| `protocol` | enum | `WireGuard`, `OpenVPN`, `IPSec`, `L2TP` |
| `encryption` | string | `AES-256` |
| `tunnel_ip_range` | string | |

### Nginx (sebagai reverse proxy/network node)
| Field | Tipe | Contoh |
|---|---|---|
| `role` | enum | `Reverse Proxy`, `Load Balancer`, `Static Server` |
| `upstream_targets` | array/FK | node backend tujuan |
| `ssl_enabled` | boolean | |
| `config_path` | string | |

---

## 3. Kategori: Compute

Node: Server, VM, Docker, Kubernetes

### Server
| Field | Tipe | Contoh |
|---|---|---|
| `hostname` | string | |
| `server_role` | enum | `Database`, `Web`, `File`, `Application`, `DNS`, `Mail` |
| `os` | string | `Ubuntu Server 22.04` |
| `cpu` | string | |
| `ram` | string | |
| `storage` | string | |
| `virtualization` | enum | `Bare metal`, `Proxmox`, `VMware` |
| `services_running` | array | |
| `backup_schedule` | string | |

### VM (Virtual Machine)
| Field | Tipe | Contoh |
|---|---|---|
| `hypervisor` | enum | `Proxmox`, `VMware ESXi`, `KVM`, `Hyper-V` |
| `vcpu` | number | |
| `ram_allocated` | string | |
| `disk_allocated` | string | |
| `host_node` | string/FK | server fisik tempat VM jalan |
| `snapshot_enabled` | boolean | |

### Docker (container)
| Field | Tipe | Contoh |
|---|---|---|
| `image` | string | `nginx:1.25-alpine` |
| `container_name` | string | |
| `exposed_ports` | array | `["80:8080"]` |
| `volumes` | array | |
| `env_vars` | array/JSON | |
| `network_mode` | enum | `bridge`, `host`, `none`, `custom` |
| `restart_policy` | enum | `always`, `on-failure`, `unless-stopped` |

### Kubernetes
| Field | Tipe | Contoh |
|---|---|---|
| `resource_type` | enum | `Cluster`, `Node`, `Pod`, `Deployment`, `Service`, `Ingress` |
| `namespace` | string | |
| `replicas` | number | |
| `image` | string | |
| `cpu_request` / `cpu_limit` | string | |
| `memory_request` / `memory_limit` | string | |
| `service_type` | enum | `ClusterIP`, `NodePort`, `LoadBalancer` |

---

## 4. Kategori: Cloud

Node: AWS, Azure, GCP

| Field | Tipe | Contoh |
|---|---|---|
| `provider` | enum | `AWS`, `Azure`, `GCP` |
| `service_name` | string | `EC2`, `S3`, `RDS`, `Cloud Run`, `Blob Storage` |
| `region` | string | `ap-southeast-1` |
| `resource_id` | string | ARN/resource ID |
| `instance_type` | string | `t3.medium` |
| `pricing_tier` | string | |
| `auto_scaling` | boolean | |
| `endpoint_url` | string | |

---

## 5. Kategori: IoT / Embedded

Node: ESP32, Arduino, Raspberry Pi

| Field | Tipe | Contoh |
|---|---|---|
| `board_model` | string | `ESP32-WROOM-32`, `Arduino Uno R3`, `Raspberry Pi 4 Model B` |
| `firmware_version` | string | |
| `connection_method` | enum | `WiFi`, `Bluetooth`, `LoRa`, `Serial/UART`, `Ethernet` |
| `protocol` | enum | `MQTT`, `HTTP`, `Modbus`, `CoAP` |
| `sensors_actuators` | array | `["DHT22", "Relay 4ch", "Load Cell HX711"]` |
| `power_source` | enum | `USB`, `Battery`, `PoE`, `Solar` |
| `broker_target` | string/FK | broker MQTT tujuan (jika ada) |

---

## 6. Kategori: Data

Node: Database, Redis, Storage, Kafka, RabbitMQ, MQTT

### Database
| Field | Tipe | Contoh |
|---|---|---|
| `engine` | enum | `PostgreSQL`, `MySQL`, `MongoDB`, `SQLite` |
| `version` | string | |
| `db_name` | string | |
| `connection_pool_size` | number | |
| `replication` | enum | `None`, `Primary-Replica`, `Multi-Master` |
| `backup_schedule` | string | |

### Redis
| Field | Tipe | Contoh |
|---|---|---|
| `usage` | enum | `Cache`, `Session Store`, `Pub/Sub`, `Queue` |
| `eviction_policy` | string | `allkeys-lru` |
| `persistence` | enum | `RDB`, `AOF`, `None` |
| `cluster_mode` | boolean | |

### Storage (mis. MinIO/S3)
| Field | Tipe | Contoh |
|---|---|---|
| `storage_type` | enum | `Object Storage`, `Block Storage`, `File Storage` |
| `bucket_name` | string | |
| `capacity` | string | |
| `access_policy` | enum | `Private`, `Public Read`, `Custom` |

### Kafka / RabbitMQ (message broker)
| Field | Tipe | Contoh |
|---|---|---|
| `broker_type` | enum | `Kafka`, `RabbitMQ` |
| `topics_or_queues` | array | |
| `partition_count` | number | (Kafka) |
| `exchange_type` | enum | `direct`, `topic`, `fanout` (RabbitMQ) |
| `retention_policy` | string | |

### MQTT
| Field | Tipe | Contoh |
|---|---|---|
| `broker_software` | string | `Mosquitto`, `EMQX`, `HiveMQ` |
| `topics` | array | |
| `qos_level` | enum | `0`, `1`, `2` |
| `auth_enabled` | boolean | |

---

## 7. Kategori: Aplikasi

Node: API, Frontend, Backend, Microservice

| Field | Tipe | Contoh |
|---|---|---|
| `app_type` | enum | `API`, `Frontend`, `Backend`, `Microservice` |
| `tech_stack` | array | `["Next.js", "NestJS"]` |
| `repo_url` | string | |
| `base_url` / `endpoint` | string | |
| `port` | string | |
| `deployment_target` | string/FK | node cloud/compute tempat app jalan |
| `depends_on` | array/FK | service lain yang jadi dependency |
| `version` | string | |

---

## 8. Kategori: Observability

Node: Prometheus, Grafana, Loki

| Field | Tipe | Contoh |
|---|---|---|
| `tool` | enum | `Prometheus`, `Grafana`, `Loki` |
| `role` | enum | `Metrics Collector`, `Dashboard`, `Log Aggregator` |
| `scrape_targets` | array/FK | (Prometheus) node yang dimonitor |
| `retention_period` | string | |
| `dashboard_url` | string | (Grafana) |
| `alerting_enabled` | boolean | |

---

## 9. Kategori: Endpoint

Node: Printer, Laptop, PC, Mobile

| Field | Tipe | Contoh |
|---|---|---|
| `device_type` | enum | `Printer`, `Laptop`, `PC`, `Mobile` |
| `os` | string | |
| `owner_user` | string/FK | user/departemen pemakai |
| `connection_method` | enum | `LAN`, `WiFi`, `Bluetooth` |
| `asset_tag` | string | nomor inventaris (opsional) |

---

## 10. Edge / Koneksi Antar Node

Sesuai entity `Edge` di Blueprint §18 — bukan node, tapi garis penghubung.

| Field | Tipe | Contoh |
|---|---|---|
| `id` | UUID | |
| `diagram_id` | FK | |
| `source_node_id` | FK → Node | |
| `target_node_id` | FK → Node | |
| `connection_type` | enum | `straight`, `orthogonal`, `curved` (sesuai Canvas §4) |
| `label` | string | keterangan link, mis. `REST API`, `TCP 5432` |
| `cable_type` | enum | `UTP Cat6`, `Fiber Optic`, `Wireless`, `Virtual` — relevan untuk edge kategori Network |
| `protocol` | string | `HTTP`, `MQTT`, `gRPC`, `TCP/IP` |
| `port_source` / `port_target` | string | |
| `properties` | JSONB | field tambahan spesifik jenis edge |

---

## 11. Implementasi di Skema Database (Prisma)

Selaras dengan entity `Node`/`Edge` generik di Blueprint §18:

```prisma
model Node {
  id            String   @id @default(uuid())
  diagramId     String
  type          String   // "router", "server", "esp32", dst
  category      String   // "network", "compute", "cloud", dst
  label         String
  icon          String?
  positionX     Float
  positionY     Float
  width         Float?
  height        Float?
  status        String   @default("active")
  environment   String?
  ipAddress     String?
  port          String?
  spesifikasi   String?
  description   String?
  tags          String[]
  properties    Json     // field spesifik per type, sesuai bagian 2-9
  diagram       Diagram  @relation(fields: [diagramId], references: [id])
}

model Edge {
  id            String   @id @default(uuid())
  diagramId     String
  sourceNodeId  String
  targetNodeId  String
  connectionType String  @default("orthogonal")
  label         String?
  properties    Json?
  diagram       Diagram  @relation(fields: [diagramId], references: [id])
}
```

**Kenapa `properties` pakai JSONB, bukan tabel terpisah per tipe:**
- Jumlah tipe node cukup banyak (30+) dan akan terus nambah (Template Marketplace bisa bawa tipe baru) — bikin tabel per tipe tidak scalable.
- Query filter/search yang butuh field spesifik tetap bisa pakai indexing JSONB PostgreSQL (`GIN index`) kalau nanti perlu performa lebih.
- Frontend tinggal punya "properties template" per `type` (semacam JSON Schema/form config) untuk generate form dynamic — cocok dengan React Flow + custom node types yang sudah direncanakan.

---

*Dokumen ini mengikuti struktur kategori node di ArchFlow Blueprint §5 (Topology Builder) dan siap dipakai sebagai acuan saat implementasi panel properties + form dynamic di Canvas.*
