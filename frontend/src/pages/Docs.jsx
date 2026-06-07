import React, { useState, useEffect, useRef } from 'react';
import { FileText, Edit2, Save, Link as LinkIcon, CheckCircle2, AlertTriangle, Layers, Trash2, Download, FileDown, ChevronDown, ChevronRight, Loader } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useProject } from '../ProjectContext';

export const Docs = () => {
  const initialDoc = {
    title: 'Product Requirements Document',
    vision: 'A unified AI-driven workspace for instant execution.',
    problem: 'Product teams spend 40% of their time on manual documentation.',
    goals: '- Revenue: $1M ARR\n- Engagement: 1hr daily usage',
    metrics: '- Reduce planning time by 80%\n- 0% orphan tasks',
    personas: '- The Overwhelmed Ops Manager',
    inScope: '- AI PRD Generation\n- Sprint Planning',
    outOfScope: '- Real-time multiplayer editing',
    userStories: '- As a PM, I want to click generate so that I save time.',
    functionalReqs: '- Authentication\n- OpenAPI Integration',
    nonFunctionalReqs: '- 99.9% Uptime\n- SOC2 Compliance',
    userFlow: '- Login -> Enter Idea -> Review PRD -> Start Sprint',
    uxui: '- Dark mode by default\n- Minimalist design',
    acceptance: '- PRD contains 19 sections\n- Tasks mapped to Sprints',
    assumptions: '1. Users know Agile methodologies.',
    constraints: '- Timeline: 3 months\n- Budget: $50k',
    dependencies: '- OpenAI API uptime',
    risks: '- High API costs (Mitigation: caching)',
    releasePlan: '- Milestone 1: Core App (Q3)',
    openQuestions: '- Should we support Azure OpenAI?',
    appendix: '- Link to Figma',
    epics: [
      { id: 'EPIC-1', title: 'Authentication Core', sprint: 'Sprint 1', tasks: 5 },
      { id: 'EPIC-2', title: 'AI Generation Engine', sprint: 'Sprint 2', tasks: 12 }
    ]
  };

  const { activeProject } = useProject();
  const [docContent, setDocContent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [prdId, setPrdId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPrd = async () => {
      setIsLoading(true);
      if (!activeProject) {
        setDocContent(null);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.from('prds')
        .select('*')
        .eq('project_id', activeProject.id)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (data && data.length > 0) {
        setDocContent(data[0].document_data);
        setEditForm(data[0].document_data);
        setPrdId(data[0].id);
      } else {
        setDocContent(null);
        setEditForm(initialDoc);
      }
      setIsLoading(false);
    };
    fetchPrd();
  }, [activeProject]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const expandAll = () => {
    const all = {};
    sections.forEach(s => all[s.id] = true);
    all['epics'] = true;
    setExpandedSections(all);
  };

  if (isLoading) {
    return (
      <div className="content-area animate-fade-in" style={{ maxWidth: '1000px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <Loader size={48} className="spin" color="var(--accent-color)" style={{ marginBottom: '16px', animation: 'spin 1s linear infinite' }} />
        <h2>Loading PRD from Supabase...</h2>
      </div>
    );
  }

  if (!docContent) {
    return (
      <div className="content-area animate-fade-in" style={{ maxWidth: '1000px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <FileText size={48} color="var(--text-secondary)" style={{ marginBottom: '16px' }} />
        <h2>No PRD Available</h2>
        <p style={{ color: 'var(--text-secondary)' }}>You have deleted the active PRD or haven't generated one yet.</p>
        <button className="btn" style={{ marginTop: '16px' }} onClick={async () => {
          setIsLoading(true);
          const { data, error } = await supabase.from('prds').insert([{ title: initialDoc.title, document_data: initialDoc }]).select();
          if (data && data.length > 0) {
            setDocContent(data[0].document_data);
            setEditForm(data[0].document_data);
            setPrdId(data[0].id);
          }
          setIsLoading(false);
        }}>Restore Sample PRD</button>
      </div>
    );
  }

  const handleSave = async () => {
    setIsLoading(true);
    if (prdId) {
      await supabase.from('prds').update({ title: editForm.title, document_data: editForm, updated_at: new Date() }).eq('id', prdId);
    } else {
      const { data } = await supabase.from('prds').insert([{ title: editForm.title, document_data: editForm }]).select();
      if (data && data.length > 0) setPrdId(data[0].id);
    }
    setDocContent(editForm);
    setIsEditing(false);
    setIsLoading(false);
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to permanently delete this PRD from the database?")) {
      setIsLoading(true);
      if (prdId) {
        await supabase.from('prds').delete().eq('id', prdId);
      }
      setDocContent(null);
      setPrdId(null);
      setIsLoading(false);
    }
  };

  const handleDownloadWord = () => {
    expandAll();
    setTimeout(() => {
      const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>PRD</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #111; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #2c3e50; font-size: 28pt; text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #3498db; }
          h2 { color: #2980b9; font-size: 16pt; margin-top: 30px; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
          p { margin-bottom: 15px; font-size: 11pt; color: #333; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 11pt; }
          th { background-color: #f8f9fa; color: #2c3e50; font-weight: bold; }
          strong { color: #2c3e50; }
        </style>
      </head><body>`;
      const footer = "</body></html>";
      
      // We'll manually construct the Word HTML to ensure perfect formatting instead of relying on the UI's div structure
      let contentHtml = `<h1>${docContent.title}</h1>`;
      
      sections.forEach(sec => {
        contentHtml += `<h2>${sec.title}</h2>`;
        // Convert newlines to <br> for word
        const safeContent = sec.content || '';
        const formattedContent = safeContent.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        contentHtml += `<p>${formattedContent}</p>`;
      });

      contentHtml += `<h2>Feature Epics & Sprint Grouping</h2>`;
      contentHtml += `<table><thead><tr><th>Epic</th><th>Target Sprint</th><th>Task Count</th></tr></thead><tbody>`;
      docContent.epics.forEach(epic => {
        contentHtml += `<tr><td><strong>${epic.title}</strong></td><td>${epic.sprint}</td><td>${epic.tasks} Tasks</td></tr>`;
      });
      contentHtml += `</tbody></table>`;

      const sourceHTML = header + contentHtml + footer;
      const blob = new Blob(['\ufeff', sourceHTML], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${docContent.title.replace(/\s+/g, '_')}.doc`;
      link.click();
    }, 100);
  };

  const sections = [
    { id: 'exec', title: 'Executive Summary', content: docContent.vision },
    { id: 'prob', title: 'Problem Statement', content: docContent.problem },
    { id: 'goals', title: 'Goals & Objectives', content: docContent.goals },
    { id: 'metrics', title: 'Success Metrics', content: docContent.metrics },
    { id: 'personas', title: 'Target Users & Personas', content: docContent.personas },
    { id: 'scope', title: 'Scope', content: `**In Scope:**\n${docContent.inScope}\n\n**Out of Scope:**\n${docContent.outOfScope}` },
    { id: 'stories', title: 'User Stories', content: docContent.userStories },
    { id: 'func', title: 'Functional Requirements', content: docContent.functionalReqs },
    { id: 'nonfunc', title: 'Non-Functional Requirements', content: docContent.nonFunctionalReqs },
    { id: 'flow', title: 'User Flow & UX/UI', content: `**User Flow:**\n${docContent.userFlow}\n\n**UX/UI:**\n${docContent.uxui}` },
    { id: 'accept', title: 'Acceptance Criteria', content: docContent.acceptance },
    { id: 'assump', title: 'Assumptions, Constraints & Dependencies', content: `**Assumptions:**\n${docContent.assumptions}\n\n**Constraints:**\n${docContent.constraints}\n\n**Dependencies:**\n${docContent.dependencies}` },
    { id: 'risk', title: 'Risks & Mitigations', content: docContent.risks },
    { id: 'release', title: 'Release Plan', content: docContent.releasePlan },
    { id: 'open', title: 'Open Questions', content: docContent.openQuestions },
    { id: 'appx', title: 'Appendix', content: docContent.appendix },
  ];

  return (
    <div className="content-area animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1>Product Documentation</h1>
          <p>View, edit, and export your professional Product Requirements Document.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {!isEditing && (
            <>
              <button className="btn btn-secondary" style={{ background: 'var(--bg-panel)' }} onClick={handleDownloadWord}><Download size={18} /> Word</button>
              <button className="btn btn-secondary" style={{ background: 'var(--bg-panel)', color: 'var(--danger)' }} onClick={handleDelete}><Trash2 size={18} /> Delete</button>
              <button className="btn" onClick={() => { setEditForm(docContent); setIsEditing(true); }}><Edit2 size={18} /> Edit PRD</button>
            </>
          )}
        </div>
      </div>

      <div className="glass-card prd-card">
        {isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Editing PRD</h2>
              <button className="btn" onClick={handleSave}><Save size={18} /> Save All Changes</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div><label className="input-label">Title</label><input className="input-field" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} /></div>
              <div><label className="input-label">Target Users / Personas</label><input className="input-field" value={editForm.personas} onChange={e => setEditForm({...editForm, personas: e.target.value})} /></div>
            </div>
            <label className="input-label">Executive Summary</label><textarea className="input-field" value={editForm.vision} onChange={e => setEditForm({...editForm, vision: e.target.value})} />
            <label className="input-label">Problem Statement</label><textarea className="input-field" value={editForm.problem} onChange={e => setEditForm({...editForm, problem: e.target.value})} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div><label className="input-label">Goals & Objectives</label><textarea className="input-field" value={editForm.goals} onChange={e => setEditForm({...editForm, goals: e.target.value})} /></div>
              <div><label className="input-label">Success Metrics</label><textarea className="input-field" value={editForm.metrics} onChange={e => setEditForm({...editForm, metrics: e.target.value})} /></div>
              <div><label className="input-label">In Scope</label><textarea className="input-field" value={editForm.inScope} onChange={e => setEditForm({...editForm, inScope: e.target.value})} /></div>
              <div><label className="input-label">Out of Scope</label><textarea className="input-field" value={editForm.outOfScope} onChange={e => setEditForm({...editForm, outOfScope: e.target.value})} /></div>
              <div><label className="input-label">User Stories</label><textarea className="input-field" value={editForm.userStories} onChange={e => setEditForm({...editForm, userStories: e.target.value})} /></div>
              <div><label className="input-label">Functional Reqs</label><textarea className="input-field" value={editForm.functionalReqs} onChange={e => setEditForm({...editForm, functionalReqs: e.target.value})} /></div>
              <div><label className="input-label">Non-Functional Reqs</label><textarea className="input-field" value={editForm.nonFunctionalReqs} onChange={e => setEditForm({...editForm, nonFunctionalReqs: e.target.value})} /></div>
              <div><label className="input-label">User Flow</label><textarea className="input-field" value={editForm.userFlow} onChange={e => setEditForm({...editForm, userFlow: e.target.value})} /></div>
              <div><label className="input-label">UX/UI Reqs</label><textarea className="input-field" value={editForm.uxui} onChange={e => setEditForm({...editForm, uxui: e.target.value})} /></div>
              <div><label className="input-label">Acceptance Criteria</label><textarea className="input-field" value={editForm.acceptance} onChange={e => setEditForm({...editForm, acceptance: e.target.value})} /></div>
              <div><label className="input-label">Assumptions</label><textarea className="input-field" value={editForm.assumptions} onChange={e => setEditForm({...editForm, assumptions: e.target.value})} /></div>
              <div><label className="input-label">Constraints</label><textarea className="input-field" value={editForm.constraints} onChange={e => setEditForm({...editForm, constraints: e.target.value})} /></div>
              <div><label className="input-label">Dependencies</label><textarea className="input-field" value={editForm.dependencies} onChange={e => setEditForm({...editForm, dependencies: e.target.value})} /></div>
              <div><label className="input-label">Risks & Mitigations</label><textarea className="input-field" value={editForm.risks} onChange={e => setEditForm({...editForm, risks: e.target.value})} /></div>
              <div><label className="input-label">Release Plan</label><textarea className="input-field" value={editForm.releasePlan} onChange={e => setEditForm({...editForm, releasePlan: e.target.value})} /></div>
              <div><label className="input-label">Open Questions</label><textarea className="input-field" value={editForm.openQuestions} onChange={e => setEditForm({...editForm, openQuestions: e.target.value})} /></div>
            </div>
            <label className="input-label">Appendix</label><textarea className="input-field" value={editForm.appendix} onChange={e => setEditForm({...editForm, appendix: e.target.value})} />
            
            <button className="btn" style={{ alignSelf: 'flex-start', marginTop: '16px' }} onClick={handleSave}><Save size={18} /> Save All Changes</button>
          </div>
        ) : (
          <div id="prd-content" style={{ fontFamily: 'Arial, sans-serif' }}>
            <style>
              {`
                @media print {
                  body * { visibility: hidden; }
                  #prd-content, #prd-content * { visibility: visible; }
                  #prd-content { position: absolute; left: 0; top: 0; width: 100%; padding: 0 40px; }
                  .no-print { display: none !important; }
                  .prd-section-content { display: block !important; border-top: none !important; padding: 10px 0 !important; }
                  .prd-section-header svg { display: none !important; }
                  .prd-section-header { border-bottom: 1px solid #ccc !important; padding: 0 0 8px 0 !important; margin-top: 24px !important; background: transparent !important; }
                  .glass-card, .prd-card { background: transparent !important; border: none !important; box-shadow: none !important; padding: 0 !important; }
                  body { color: black !important; background: white !important; }
                  .prd-section-container { border: none !important; background: transparent !important; margin-bottom: 0 !important; }
                }
              `}
            </style>
            
            <div style={{ textAlign: 'center', marginBottom: '40px', borderBottom: '2px solid var(--border-color)', paddingBottom: '24px' }}>
              <h1 style={{ margin: '0 0 16px 0', fontSize: '2.5rem', color: 'var(--text-primary)' }}>{docContent.title}</h1>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {sections.map(section => {
                const isOpen = expandedSections[section.id];
                return (
                  <div key={section.id} className="prd-section-container" style={{ border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-panel)', overflow: 'hidden' }}>
                    <div 
                      className="prd-section-header"
                      style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', background: isOpen ? 'var(--bg-card)' : 'transparent' }}
                      onClick={() => toggleSection(section.id)}
                    >
                      {isOpen ? <ChevronDown size={20} className="no-print" /> : <ChevronRight size={20} className="no-print" />}
                      <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>{section.title}</h2>
                    </div>
                    
                    <div 
                      className="prd-section-content"
                      style={{ 
                        padding: '20px', 
                        display: isOpen ? 'block' : 'none',
                        borderTop: isOpen ? '1px solid var(--border-color)' : 'none'
                      }}
                    >
                      <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', margin: 0, color: 'var(--text-secondary)' }}>
                        {(section.content || '').replace(/\*\*(.*?)\*\*/g, '$1')} 
                      </p>
                    </div>
                  </div>
                );
              })}

              <div className="prd-section-container" style={{ border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-panel)', overflow: 'hidden', marginTop: '16px' }}>
                <div 
                  className="prd-section-header"
                  style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', background: expandedSections['epics'] ? 'var(--bg-card)' : 'transparent' }}
                  onClick={() => toggleSection('epics')}
                >
                  {expandedSections['epics'] ? <ChevronDown size={20} className="no-print" /> : <ChevronRight size={20} className="no-print" />}
                  <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>Feature Epics & Sprint Grouping</h2>
                </div>
                
                <div 
                  className="prd-section-content"
                  style={{ 
                    padding: '20px', 
                    display: expandedSections['epics'] ? 'block' : 'none',
                    borderTop: expandedSections['epics'] ? '1px solid var(--border-color)' : 'none'
                  }}
                >
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr>
                        <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', borderBottom: '2px solid var(--border-color)' }}>Epic</th>
                        <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', borderBottom: '2px solid var(--border-color)' }}>Target Sprint</th>
                        <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', borderBottom: '2px solid var(--border-color)' }}>Task Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {docContent.epics.map((epic, i) => (
                        <tr key={epic.id} style={{ borderBottom: i === docContent.epics.length - 1 ? 'none' : '1px solid var(--border-color)' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>{epic.title}</td>
                          <td style={{ padding: '12px 16px' }}><span className="badge primary">{epic.sprint}</span></td>
                          <td style={{ padding: '12px 16px' }}>{epic.tasks} Tasks</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};
