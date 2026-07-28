# ArchFlow

> Visual platform untuk mendesain keseluruhan project software & IT infrastructure — topologi, arsitektur, database, UML, flow, hingga dokumentasi teknis — dalam satu tempat.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS v4 |
| Canvas Engine | React Flow (@xyflow/react) |
| State Management | Zustand |
| Data Fetching | TanStack Query |
| Backend | NestJS 11, TypeScript |
| Auth | JWT + Passport |
| Storage | In-memory (MVP) |

## Project Structure

```
archflow/
├── apps/
│   ├── web/          # Next.js frontend (port 3000)
│   └── api/          # NestJS backend (port 4000)
├── pnpm-workspace.yaml
└── package.json
```

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm

### Run Development

**Backend API:**
```bash
cd apps/api
pnpm dev
```

**Frontend:**
```bash
cd apps/web
pnpm dev
```

Or from root (both at once):
```bash
pnpm dev
```

### API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | /api/auth/register | Register |
| POST | /api/auth/login | Login |
| GET | /api/users/me | Current user |
| GET/POST | /api/workspaces | Workspaces |
| GET/POST | /api/projects | Projects |
| GET/POST | /api/projects/:id/canvas | Canvases |
| PATCH | /api/projects/:id/canvas/:canvasId | Save canvas |
| GET | /api/projects/:id/canvas/:canvasId/export/json | Export JSON |
| GET/PATCH | /api/projects/:id/blueprint | Blueprint |
| GET/POST/PATCH/DELETE | /api/projects/:id/requirements | Requirements |
| GET | /api/projects/:id/documentation/markdown | Doc preview |
| GET | /api/projects/:id/documentation/export/markdown | Export Markdown |
| GET | /api/projects/:id/documentation/export/pdf | Export PDF |

## Features (Phase 1 MVP)

- ✅ Auth (register/login/JWT)
- ✅ Workspace & Project management
- ✅ Canvas editor (React Flow)
  - Infinite canvas, zoom/pan
  - Snap to grid (16px)
  - Drag & drop from component palette
  - Minimap navigation
  - Undo/Redo (Ctrl+Z / Ctrl+Y)
  - Multi-directional edge connections
- ✅ Topology Builder (50+ node types)
- ✅ Properties panel (per-node metadata)
- ✅ Export PNG & JSON
- ✅ Auto-save on Ctrl+S

## Features (Phase 2)

- ✅ Blueprint Builder (11 sections: requirements, ADR, risks, plans)
- ✅ Requirement Management (CRUD, status, priority, type filter)
- ✅ Canvas node linking on requirements
- ✅ Documentation generator (Markdown preview + export)
- ✅ PDF export (server-side)
- ✅ Print-friendly documentation layout

## Roadmap

| Phase | Features |
|---|---|
| Phase 2 | ~~Blueprint Builder, Requirements Management, Documentation~~ ✅ |
| Phase 3 | ERD Builder, UML Builder, Mermaid/PlantUML export |
| Phase 4 | Real-time Collaboration, Comments, Version History |
| Phase 5 | API Design module, Infrastructure Builder |
| Phase 6 | Template Marketplace, Advanced Roles |
