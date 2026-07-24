'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useBlueprintStore } from '@/stores/useBlueprintStore';
import { Loader2, Save } from 'lucide-react';

export default function BlueprintPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { blueprint, isLoading, isSaving, fetchBlueprint, updateBlueprint } = useBlueprintStore();
  
  // Local state for the form
  const [formData, setFormData] = useState({
    architectureDecisions: '',
    technicalNotes: '',
    risks: '',
    milestones: '',
    deploymentPlan: '',
    securityPlan: '',
    testingPlan: '',
    maintenancePlan: '',
  });

  useEffect(() => {
    fetchBlueprint(projectId);
  }, [projectId, fetchBlueprint]);

  useEffect(() => {
    if (blueprint) {
      setFormData({
        architectureDecisions: blueprint.architectureDecisions || '',
        technicalNotes: blueprint.technicalNotes || '',
        risks: blueprint.risks || '',
        milestones: blueprint.milestones || '',
        deploymentPlan: blueprint.deploymentPlan || '',
        securityPlan: blueprint.securityPlan || '',
        testingPlan: blueprint.testingPlan || '',
        maintenancePlan: blueprint.maintenancePlan || '',
      });
    }
  }, [blueprint]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
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
            Document non-visual aspects like architecture decisions, risks, and plans.
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          Save Changes
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <Section title="Architecture Decisions (ADR)" name="architectureDecisions" value={formData.architectureDecisions} onChange={handleChange} placeholder="Record key architecture decisions..." />
        <Section title="Technical Notes" name="technicalNotes" value={formData.technicalNotes} onChange={handleChange} placeholder="General technical notes..." />
        <Section title="Risks" name="risks" value={formData.risks} onChange={handleChange} placeholder="List identified risks and mitigation strategies..." />
        <Section title="Milestones" name="milestones" value={formData.milestones} onChange={handleChange} placeholder="Key project milestones..." />
        <Section title="Deployment Plan" name="deploymentPlan" value={formData.deploymentPlan} onChange={handleChange} placeholder="Steps for deployment..." />
        <Section title="Security Plan" name="securityPlan" value={formData.securityPlan} onChange={handleChange} placeholder="Security considerations and implementations..." />
        <Section title="Testing Plan" name="testingPlan" value={formData.testingPlan} onChange={handleChange} placeholder="Strategy for testing the system..." />
        <Section title="Maintenance Plan" name="maintenancePlan" value={formData.maintenancePlan} onChange={handleChange} placeholder="Post-launch maintenance strategy..." />
      </div>
    </div>
  );
}

function Section({ title, name, value, onChange, placeholder }: any) {
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
