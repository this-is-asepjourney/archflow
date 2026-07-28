'use client';

import { usePathname, useParams } from 'next/navigation';
import Link from 'next/link';

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const projectId = params.id as string;

  // Don't show project tabs when inside the full-screen canvas editor
  if (pathname.includes('/canvas/')) {
    return <>{children}</>;
  }

  const tabs = [
    { name: 'Canvas', href: `/projects/${projectId}` },
    { name: 'Blueprint', href: `/projects/${projectId}/blueprint` },
    { name: 'Requirements', href: `/projects/${projectId}/requirements` },
    { name: 'API Design', href: `/projects/${projectId}/api-design` },
    { name: 'Documentation', href: `/projects/${projectId}/documentation` },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Project Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '1.5rem',
          borderBottom: '1px solid hsl(var(--border-subtle))',
          marginBottom: '2rem',
          paddingBottom: '0.25rem',
        }}
      >
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              style={{
                textDecoration: 'none',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'hsl(var(--primary-glow))' : 'hsl(var(--foreground-muted))',
                borderBottom: isActive ? '2px solid hsl(var(--primary-glow))' : '2px solid transparent',
                paddingBottom: '0.5rem',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.name}
            </Link>
          );
        })}
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1 }}>
        {children}
      </div>
    </div>
  );
}
