'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Network, Database, Copy, CheckCircle, Boxes } from 'lucide-react';
import api from '@/lib/api';

interface TemplateCategory {
  id: string;
  name: string;
  slug: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
  type: string;
  isOfficial: boolean;
  categoryId: string;
}

export default function TemplatesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const loadData = async () => {
    try {
      setLoading(true);
      const [catRes, tempRes] = await Promise.all([
        api.get('/templates/categories'),
        api.get('/templates'),
      ]);
      setCategories(catRes.data);
      setTemplates(tempRes.data);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, []);
  if (loading) {
    return <div>Loading templates...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Template Marketplace</h1>
        <p className="text-foreground-muted">
          Start your project quickly using predefined architectures and official templates.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar / Categories */}
        <div className="col-span-1 space-y-2">
          <div className="font-semibold px-3 py-2 text-sm uppercase tracking-wider text-foreground-muted">
            Categories
          </div>
          <button className="w-full text-left px-3 py-2 rounded-lg bg-primary/10 text-primary font-medium text-sm border border-primary/20 transition-colors">
            All Templates
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-elevated text-foreground-muted hover:text-foreground text-sm transition-colors"
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Template Grid */}
        <div className="col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="flex flex-col p-5 bg-surface rounded-xl border border-border-subtle hover:border-primary/50 transition-colors shadow-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  {tpl.type === 'TOPOLOGY' ? <Network size={20} /> : <Database size={20} />}
                </div>
                {tpl.isOfficial && (
                  <span className="flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                    <CheckCircle size={12} /> Official
                  </span>
                )}
              </div>
              
              <h3 className="font-semibold text-lg mb-1">{tpl.name}</h3>
              <p className="text-sm text-foreground-muted flex-1 line-clamp-3">
                {tpl.description || 'A predefined template to kickstart your architecture design.'}
              </p>
              
              <div className="mt-5 flex items-center gap-2">
                <button
                  className="btn btn-primary btn-sm flex-1"
                  onClick={() => router.push(`/dashboard?templateId=${tpl.id}`)}
                >
                  <Copy size={14} className="mr-2" /> Use Template
                </button>
              </div>
            </div>
          ))}
          
          {templates.length === 0 && (
            <div className="col-span-full py-12 text-center text-foreground-muted border border-dashed border-border-subtle rounded-xl flex flex-col items-center gap-3">
              <Boxes size={32} className="text-foreground-subtle" />
              <p>No templates available yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
