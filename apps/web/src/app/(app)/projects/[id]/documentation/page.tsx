'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api, { downloadFile } from '@/lib/api';
import { Loader2, Download, FileText, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function DocumentationPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [markdown, setMarkdown] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<'markdown' | 'pdf' | 'docx' | null>(null);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        setError(null);
        const res = await api.get(`/projects/${projectId}/documentation/markdown`);
        setMarkdown(res.data.markdown);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load documentation');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDoc();
  }, [projectId]);

  const handleDownloadMarkdown = async () => {
    try {
      setIsExporting('markdown');
      await downloadFile(`/projects/${projectId}/documentation/export/markdown`, `project-${projectId}-docs.md`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to export Markdown');
    } finally {
      setIsExporting(null);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setIsExporting('pdf');
      await downloadFile(`/projects/${projectId}/documentation/export/pdf`, `project-${projectId}-docs.pdf`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to export PDF');
    } finally {
      setIsExporting(null);
    }
  };

  const handleDownloadDocx = async () => {
    try {
      setIsExporting('docx');
      await downloadFile(`/projects/${projectId}/documentation/export/docx`, `project-${projectId}-docs.docx`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to export DOCX');
    } finally {
      setIsExporting(null);
    }
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
    <div className="animate-fade-in documentation-page" style={{ paddingBottom: '4rem' }}>
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
            Print
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handleDownloadPdf} disabled={isExporting === 'pdf'}>
            {isExporting === 'pdf' ? <Loader2 className="animate-spin" size={16} /> : <FileText size={16} />}
            Export PDF
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handleDownloadDocx} disabled={isExporting === 'docx'}>
            {isExporting === 'docx' ? <Loader2 className="animate-spin" size={16} /> : <FileText size={16} />}
            Export DOCX
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleDownloadMarkdown} disabled={isExporting === 'markdown'}>
            {isExporting === 'markdown' ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
            Export Markdown
          </button>
        </div>
      </div>

      {error && (
        <div className="card print-hide" style={{ padding: '0.75rem 1rem', marginBottom: '1rem', borderColor: 'hsl(var(--danger))', color: 'hsl(var(--danger))', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="glass print-container" style={{ padding: '3rem', borderRadius: 12, backgroundColor: 'hsl(var(--surface))' }}>
        <div className="prose prose-invert max-w-none">
          <ReactMarkdown>{markdown}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
