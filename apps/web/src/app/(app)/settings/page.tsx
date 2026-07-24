'use client';

import { useAuthStore } from '@/stores/useAuthStore';
import { useEffect } from 'react';
import { User, Mail, LogOut } from 'lucide-react';

export default function SettingsPage() {
  const { user, initialize, logout } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <div className="animate-fade-in" style={{ maxWidth: 600 }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem' }}>Settings</h1>

      {/* Profile Section */}
      <div className="glass" style={{ padding: '1.5rem', borderRadius: 12, marginBottom: '1.5rem' }}>
        <h2 style={{ fontWeight: 600, marginBottom: '1.25rem', fontSize: '1rem' }}>Profile</h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <User size={28} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '1.0625rem' }}>{user?.name}</div>
            <div style={{ color: 'hsl(var(--foreground-muted))', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Mail size={13} />
              {user?.email}
            </div>
          </div>
        </div>

        <div className="divider" />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: 'hsl(var(--foreground-muted))', marginBottom: '0.375rem' }}>Full Name</label>
            <input className="input" defaultValue={user?.name} disabled />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: 'hsl(var(--foreground-muted))', marginBottom: '0.375rem' }}>Email</label>
            <input className="input" defaultValue={user?.email} disabled />
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'hsl(var(--foreground-subtle))' }}>
            Profile editing coming in a future update.
          </p>
        </div>
      </div>

      {/* Account */}
      <div className="glass" style={{ padding: '1.5rem', borderRadius: 12 }}>
        <h2 style={{ fontWeight: 600, marginBottom: '1.25rem', fontSize: '1rem' }}>Account</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 500, fontSize: '0.9375rem' }}>Sign out</div>
              <div style={{ color: 'hsl(var(--foreground-muted))', fontSize: '0.8125rem' }}>Sign out from all devices</div>
            </div>
            <button className="btn btn-danger btn-sm" onClick={logout}>
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
