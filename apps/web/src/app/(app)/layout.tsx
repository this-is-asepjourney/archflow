'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Network,
  LayoutDashboard,
  FolderOpen,
  Settings,
  LogOut,
  ChevronRight,
  Bell,
  User,
} from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: FolderOpen, label: 'Projects', href: '/projects' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, initialize, logout } = useAuthStore();
  const [sidebarOpen] = useState(true);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isAuthenticated && typeof window !== 'undefined') {
      const token = localStorage.getItem('archflow_token');
      if (!token) router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated && !user) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'hsl(var(--background))',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div className="skeleton" style={{ width: 200, height: 20, margin: '0 auto 1rem' }} />
          <div className="skeleton" style={{ width: 150, height: 16, margin: '0 auto' }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'hsl(var(--background))' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: sidebarOpen ? 240 : 64,
          flexShrink: 0,
          background: 'hsl(var(--surface))',
          borderRight: '1px solid hsl(var(--border-subtle))',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.2s ease',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 40,
        }}
      >
        {/* Logo */}
        <div
          style={{
            height: 60,
            display: 'flex',
            alignItems: 'center',
            padding: '0 1rem',
            gap: '0.75rem',
            borderBottom: '1px solid hsl(var(--border-subtle))',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Network size={18} color="white" />
          </div>
          {sidebarOpen && (
            <span style={{ fontWeight: 700, fontSize: '1rem', whiteSpace: 'nowrap' }}>
              ArchFlow
            </span>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '1rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.625rem 0.75rem',
                  borderRadius: 8,
                  textDecoration: 'none',
                  color: isActive ? 'hsl(var(--primary-glow))' : 'hsl(var(--foreground-muted))',
                  background: isActive ? 'hsl(var(--primary) / 0.12)' : 'transparent',
                  border: isActive ? '1px solid hsl(var(--primary) / 0.2)' : '1px solid transparent',
                  transition: 'all 0.15s ease',
                  fontWeight: isActive ? 500 : 400,
                  fontSize: '0.875rem',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                }}
              >
                <item.icon size={18} style={{ flexShrink: 0 }} />
                {sidebarOpen && item.label}
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div
          style={{
            padding: '0.75rem',
            borderTop: '1px solid hsl(var(--border-subtle))',
          }}
        >
          {sidebarOpen ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <User size={16} color="white" />
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    color: 'hsl(var(--foreground))',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {user?.name}
                </div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: 'hsl(var(--foreground-subtle))',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {user?.email}
                </div>
              </div>
              <button
                onClick={logout}
                className="btn btn-ghost btn-icon btn-sm tooltip"
                data-tooltip="Sign out"
                style={{ flexShrink: 0 }}
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <button onClick={logout} className="btn btn-ghost btn-icon btn-sm" style={{ width: '100%' }}>
              <LogOut size={16} />
            </button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main
        style={{
          flex: 1,
          marginLeft: sidebarOpen ? 240 : 64,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          transition: 'margin-left 0.2s ease',
        }}
      >
        {/* Topbar */}
        <header
          style={{
            height: 60,
            borderBottom: '1px solid hsl(var(--border-subtle))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1.5rem',
            background: 'hsl(var(--surface) / 0.8)',
            backdropFilter: 'blur(8px)',
            position: 'sticky',
            top: 0,
            zIndex: 30,
          }}
        >
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
            <span style={{ color: 'hsl(var(--foreground-subtle))' }}>ArchFlow</span>
            <ChevronRight size={14} style={{ color: 'hsl(var(--foreground-subtle))' }} />
            <span style={{ color: 'hsl(var(--foreground-muted))' }}>
              {pathname === '/dashboard' ? 'Dashboard' :
               pathname.startsWith('/projects') ? 'Projects' : 'Settings'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button className="btn btn-ghost btn-icon btn-sm">
              <Bell size={16} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <div style={{ flex: 1, padding: '2rem 1.5rem' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
