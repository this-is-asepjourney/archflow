'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Network,
  Workflow,
  Database,
  GitBranch,
  FileText,
  Cloud,
  ArrowRight,
  ChevronRight,
  Zap,
  Shield,
  Users,
  Star,
} from 'lucide-react';

const features = [
  {
    icon: Network,
    title: 'Topology Builder',
    desc: 'Design network infrastructure with routers, switches, firewalls, cloud services, and IoT devices.',
    color: 'var(--primary)',
  },
  {
    icon: Workflow,
    title: 'Flow Builder',
    desc: 'Visualize business processes, auth flows, CI/CD pipelines, and microservice communication.',
    color: 'var(--accent)',
  },
  {
    icon: Database,
    title: 'ERD Builder',
    desc: 'Design database schemas with entities, relationships, constraints, and data types.',
    color: 'var(--success)',
  },
  {
    icon: GitBranch,
    title: 'UML Builder',
    desc: 'Create all 8 UML diagram types: class, sequence, use case, state, component, and more.',
    color: 'var(--warning)',
  },
  {
    icon: FileText,
    title: 'Blueprint Builder',
    desc: 'Document requirements, architecture decisions, risks, and milestones in one structured place.',
    color: 'var(--primary)',
  },
  {
    icon: Cloud,
    title: 'Infrastructure Builder',
    desc: 'Model cloud infrastructure for AWS, Azure, GCP with containers and orchestration.',
    color: 'var(--accent)',
  },
];

const stats = [
  { value: '16+', label: 'Builder Modules' },
  { value: '50+', label: 'Node Types' },
  { value: '7', label: 'Export Formats' },
  { value: '8', label: 'UML Diagrams' },
];

const navItems = [
  { label: 'Features', href: '#features' },
  { label: 'Modules', href: '#modules' },
  { label: 'Pricing', href: '#' },
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'hsl(var(--background))' }}>
      {/* Navbar */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          padding: '0 1.5rem',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'all 0.3s ease',
          background: scrolled
            ? 'hsl(var(--surface) / 0.95)'
            : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          borderBottom: scrolled ? '1px solid hsl(var(--border-subtle))' : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Network size={18} color="white" />
          </div>
          <span style={{ fontWeight: 700, fontSize: '1.125rem', color: 'hsl(var(--foreground))' }}>
            ArchFlow
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              style={{
                color: 'hsl(var(--foreground-muted))',
                fontSize: '0.875rem',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'hsl(var(--foreground))')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'hsl(var(--foreground-muted))')}
            >
              {item.label}
            </a>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link href="/login" className="btn btn-ghost btn-sm">
            Sign in
          </Link>
          <Link href="/register" className="btn btn-primary btn-sm">
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '6rem 1.5rem 4rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background glow orbs */}
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600,
            height: 600,
            background: 'radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '10%',
            right: '10%',
            width: 300,
            height: 300,
            background: 'radial-gradient(circle, hsl(var(--accent) / 0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Badge */}
        <div className="badge badge-primary animate-fade-in" style={{ marginBottom: '1.5rem' }}>
          <Zap size={12} style={{ marginRight: 4 }} />
          Visual Architecture Platform
        </div>

        {/* Headline */}
        <h1
          className="animate-fade-in"
          style={{
            fontSize: 'clamp(2.5rem, 6vw, 5rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: '1.5rem',
            maxWidth: 800,
            animationDelay: '0.1s',
          }}
        >
          Design your entire{' '}
          <span className="gradient-text">software project</span>
          {' '}visually
        </h1>

        {/* Subtitle */}
        <p
          className="animate-fade-in"
          style={{
            fontSize: '1.125rem',
            color: 'hsl(var(--foreground-muted))',
            maxWidth: 600,
            marginBottom: '2.5rem',
            lineHeight: 1.7,
            animationDelay: '0.2s',
          }}
        >
          From network topology to database ERD, UML diagrams to CI/CD pipelines —
          ArchFlow is the all-in-one visual platform for software engineers, DevOps,
          and architects.
        </p>

        {/* CTA buttons */}
        <div
          className="animate-fade-in"
          style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
            animationDelay: '0.3s',
          }}
        >
          <Link href="/register" className="btn btn-primary btn-lg">
            Start designing free
            <ArrowRight size={18} />
          </Link>
          <Link href="/login" className="btn btn-secondary btn-lg">
            View demo
          </Link>
        </div>

        {/* Stats */}
        <div
          className="animate-fade-in"
          style={{
            display: 'flex',
            gap: '3rem',
            marginTop: '5rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
            animationDelay: '0.4s',
          }}
        >
          {stats.map((stat) => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div
                className="gradient-text"
                style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: '0.875rem',
                  color: 'hsl(var(--foreground-subtle))',
                  marginTop: '0.25rem',
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        style={{ padding: '6rem 1.5rem', maxWidth: 1200, margin: '0 auto' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2
            style={{ fontSize: '2.25rem', fontWeight: 700, marginBottom: '1rem' }}
          >
            Everything you need to{' '}
            <span className="gradient-text">design & document</span>
          </h2>
          <p style={{ color: 'hsl(var(--foreground-muted))', maxWidth: 600, margin: '0 auto' }}>
            One unified canvas engine powers all builders. Design your entire system
            architecture without switching tools.
          </p>
        </div>

        <div
          id="modules"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="card card-interactive animate-fade-in"
              style={{
                padding: '1.75rem',
                animationDelay: `${i * 0.05}s`,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: `hsl(${feature.color} / 0.15)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                  border: `1px solid hsl(${feature.color} / 0.25)`,
                }}
              >
                <feature.icon size={22} color={`hsl(${feature.color})`} />
              </div>
              <h3 style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '1.0625rem' }}>
                {feature.title}
              </h3>
              <p style={{ color: 'hsl(var(--foreground-muted))', fontSize: '0.875rem', lineHeight: 1.6 }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Value Props */}
      <section
        style={{
          padding: '6rem 1.5rem',
          background: 'hsl(var(--surface) / 0.5)',
          borderTop: '1px solid hsl(var(--border-subtle))',
          borderBottom: '1px solid hsl(var(--border-subtle))',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '3rem',
          }}
        >
          {[
            {
              icon: Zap,
              title: 'Fast & Intuitive',
              desc: 'Drag-and-drop canvas with smart guides, snap-to-grid, and auto-layout — design at the speed of thought.',
            },
            {
              icon: Shield,
              title: 'Data-Linked Diagrams',
              desc: 'Nodes carry metadata — IP, specs, requirements — exported into technical documentation automatically.',
            },
            {
              icon: Users,
              title: 'Built for Teams',
              desc: 'Real-time collaboration, comments, roles, and version history for engineering teams of any size.',
            },
          ].map((prop) => (
            <div key={prop.title} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: 'hsl(var(--primary) / 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  border: '1px solid hsl(var(--primary) / 0.2)',
                }}
              >
                <prop.icon size={20} color="hsl(var(--primary-glow))" />
              </div>
              <div>
                <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{prop.title}</h3>
                <p style={{ color: 'hsl(var(--foreground-muted))', fontSize: '0.875rem', lineHeight: 1.6 }}>
                  {prop.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section
        style={{ padding: '6rem 1.5rem', textAlign: 'center' }}
      >
        <div
          className="glass gradient-border"
          style={{
            maxWidth: 700,
            margin: '0 auto',
            padding: '4rem 2rem',
            borderRadius: 24,
          }}
        >
          <Star size={32} color="hsl(var(--primary-glow))" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>
            Start architecting today
          </h2>
          <p style={{ color: 'hsl(var(--foreground-muted))', marginBottom: '2rem' }}>
            Join engineers and architects who use ArchFlow to design, document,
            and collaborate on complex systems.
          </p>
          <Link href="/register" className="btn btn-primary btn-lg">
            Create free account
            <ChevronRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid hsl(var(--border-subtle))',
          padding: '2rem 1.5rem',
          textAlign: 'center',
          color: 'hsl(var(--foreground-subtle))',
          fontSize: '0.875rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: 5,
              background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Network size={12} color="white" />
          </div>
          <strong style={{ color: 'hsl(var(--foreground-muted))' }}>ArchFlow</strong>
        </div>
        <p>© 2026 ArchFlow. Visual Architecture Design Platform.</p>
      </footer>
    </div>
  );
}
