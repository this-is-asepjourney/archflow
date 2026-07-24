'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { Loader2, Download, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function DocumentationPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [markdown, setMarkdown] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await api.get(`/projects/${projectId}/documentation/markdown`);
        setMarkdown(res.data.markdown);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDoc();
  }, [projectId]);

  const handleDownload = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/documentation/export/markdown`;
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <Loader2 className="animate-spin text-muted" size={24} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      <div className="print-hide" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Documentation</h2>
          <p style={{ color: 'hsl(var(--foreground-muted))', fontSize: '0.875rem' }}>
            Auto-generated documentation from Canvas, Blueprint, and Requirements.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={handlePrint}>
            <FileText size={16} />
            Print to PDF
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleDownload}>
            <Download size={16} />
            Export Markdown
          </button>
        </div>
      </div>

      <div className="glass print-container" style={{ padding: '3rem', borderRadius: 12, backgroundColor: 'hsl(var(--surface))' }}>
        <div className="prose prose-invert max-w-none">
          <ReactMarkdown>{markdown}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
