'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useBlueprintStore } from '@/stores/useBlueprintStore';
import { Loader2, Save } from 'lucide-react';

const SECTIONS = [
  { title: 'Business Requirements', name: 'businessRequirements', placeholder: 'High-level business goals and constraints...' },
  { title: 'Functional Requirements', name: 'functionalRequirements', placeholder: 'What the system must do...' },
  { title: 'Non-Functional Requirements', name: 'nonFunctionalRequirements', placeholder: 'Performance, availability, security requirements...' },
  { title: 'Architecture Decisions (ADR)', name: 'architectureDecisions', placeholder: 'Record key architecture decisions...' },
  { title: 'Technical Notes', name: 'technicalNotes', placeholder: 'General technical notes...' },
  { title: 'Risks', name: 'risks', placeholder: 'List identified risks and mitigation strategies...' },
  { title: 'Milestones', name: 'milestones', placeholder: 'Key project milestones...' },
  { title: 'Deployment Plan', name: 'deploymentPlan', placeholder: 'Steps for deployment...' },
  { title: 'Security Plan', name: 'securityPlan', placeholder: 'Security considerations and implementations...' },
  { title: 'Testing Plan', name: 'testingPlan', placeholder: 'Strategy for testing the system...' },
  { title: 'Maintenance Plan', name: 'maintenancePlan', placeholder: 'Post-launch maintenance strategy...' },
] as const;

type FormData = Record<(typeof SECTIONS)[number]['name'], string>;

const emptyForm = (): FormData =>
  Object.fromEntries(SECTIONS.map((s) => [s.name, ''])) as FormData;

export default function BlueprintPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { blueprint, isLoading, isSaving, error, fetchBlueprint, updateBlueprint } = useBlueprintStore();
  const [formData, setFormData] = useState<FormData>(emptyForm());

  useEffect(() => {
    fetchBlueprint(projectId);
  }, [projectId, fetchBlueprint]);

  useEffect(() => {
    if (blueprint) {
      // Use setTimeout to avoid 'synchronous setState within an effect' warning
      const timer = setTimeout(() => {
        setFormData({
          businessRequirements: blueprint.businessRequirements || '',
          functionalRequirements: blueprint.functionalRequirements || '',
          nonFunctionalRequirements: blueprint.nonFunctionalRequirements || '',
          architectureDecisions: blueprint.architectureDecisions || '',
          technicalNotes: blueprint.technicalNotes || '',
          risks: blueprint.risks || '',
          milestones: blueprint.milestones || '',
          deploymentPlan: blueprint.deploymentPlan || '',
          securityPlan: blueprint.securityPlan || '',
          testingPlan: blueprint.testingPlan || '',
          maintenancePlan: blueprint.maintenancePlan || '',
        });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [blueprint]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = () => {
    updateBlueprint(projectId, formData);
  };

  if (isLoading && !blueprint) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <Loader2 className="animate-spin text-muted" size={24} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Project Blueprint</h2>
          <p style={{ color: 'hsl(var(--foreground-muted))', fontSize: '0.875rem' }}>
            Document non-visual aspects like requirements, architecture decisions, risks, and plans.
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          Save Changes
        </button>
      </div>

      {error && (
        <div className="card" style={{ padding: '0.75rem 1rem', marginBottom: '1rem', borderColor: 'hsl(var(--danger))', color: 'hsl(var(--danger))' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {SECTIONS.map((section) => (
          <Section key={section.name} {...section} value={formData[section.name]} onChange={handleChange} />
        ))}
      </div>
    </div>
  );
}

function Section({
  title,
  name,
  value,
  onChange,
  placeholder,
}: {
  title: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
}) {
  return (
    <div className="glass" style={{ padding: '1.5rem', borderRadius: 12 }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>{title}</h3>
      <textarea
        className="input"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{ minHeight: '120px', resize: 'vertical' }}
      />
    </div>
  );
}
