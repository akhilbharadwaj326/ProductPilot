import React, { useState } from 'react';
import { Rocket, Loader2, CheckCircle2, ChevronRight, Edit3 } from 'lucide-react';

export const IdeaWizard = () => {
  const [step, setStep] = useState(1); // 1: Idea, 2: PRD Review, 3: Epics Review, 4: Done
  const [loading, setLoading] = useState(false);
  const [projectId, setProjectId] = useState(null);
  
  // Form Data
  const [idea, setIdea] = useState('');
  const [audience, setAudience] = useState('');
  const [goals, setGoals] = useState('');
  
  // Artifacts
  const [prdArtifactId, setPrdArtifactId] = useState(null);
  const [prdData, setPrdData] = useState(null);
  const [epicsArtifactId, setEpicsArtifactId] = useState(null);
  const [epicsData, setEpicsData] = useState(null);

  const generatePRD = async () => {
    setLoading(true);
    try {
      // 1. Create Project
      const projRes = await fetch('http://localhost:8000/api/projects/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: "New Project", description: idea })
      });
      const projData = await projRes.json();
      setProjectId(projData.id);

      // 2. Generate PRD
      const prdRes = await fetch('http://localhost:8000/api/ai/generate/prd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projData.id,
          idea: idea,
          target_audience: audience,
          business_goals: goals
        })
      });
      const prdJson = await prdRes.json();
      setPrdArtifactId(prdJson.artifact_id);
      setPrdData(prdJson.data);
      setStep(2);
    } catch (err) {
      console.error(err);
      alert("Failed to generate PRD. Ensure backend is running and OPENAI_API_KEY is valid.");
    } finally {
      setLoading(false);
    }
  };

  const generateEpics = async () => {
    setLoading(true);
    try {
      const epicsRes = await fetch('http://localhost:8000/api/ai/generate/epics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artifact_id: prdArtifactId })
      });
      const epicsJson = await epicsRes.json();
      setEpicsArtifactId(epicsJson.artifact_id);
      setEpicsData(epicsJson.data);
      setStep(3);
    } catch (err) {
      console.error(err);
      alert("Failed to generate Epics.");
    } finally {
      setLoading(false);
    }
  };

  const finalizePlan = () => {
    setStep(4);
  };

  return (
    <div className="content-area animate-fade-in">
      
      {/* Progress Indicator */}
      <div className="wizard-progress" style={{ display: 'flex', gap: '12px', marginBottom: '32px', alignItems: 'center' }}>
        <div className={`step-badge ${step >= 1 ? 'active' : ''}`} style={{ color: step >= 1 ? 'var(--accent-color)' : 'var(--text-secondary)' }}>1. Discovery</div>
        <ChevronRight size={16} color="var(--border-color)" />
        <div className={`step-badge ${step >= 2 ? 'active' : ''}`} style={{ color: step >= 2 ? 'var(--accent-color)' : 'var(--text-secondary)' }}>2. PRD Review</div>
        <ChevronRight size={16} color="var(--border-color)" />
        <div className={`step-badge ${step >= 3 ? 'active' : ''}`} style={{ color: step >= 3 ? 'var(--accent-color)' : 'var(--text-secondary)' }}>3. Epics</div>
      </div>

      {step === 1 && (
        <div className="animate-fade-in">
          <h1>Turn your idea into execution</h1>
          <p>Describe your product idea, constraints, and goals. Our AI will instantly generate your PRD, user stories, and a prioritized sprint plan.</p>
          
          <div className="glass-card">
            <div className="input-group">
              <label className="input-label">Product Idea</label>
              <textarea 
                className="input-field" 
                placeholder="E.g., An AI-powered workspace that turns raw product ideas into execution-ready plans..."
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
              ></textarea>
            </div>

            <div className="input-group">
              <label className="input-label">Target Audience</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="E.g., Product Managers, Founders, Developers"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Key Business Goals</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="E.g., Reduce planning time by 80%"
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
              />
            </div>

            <button className="btn" style={{ marginTop: '16px' }} onClick={generatePRD} disabled={loading || !idea}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Rocket size={18} />}
              {loading ? 'Analyzing Idea...' : 'Generate Product Plan'}
            </button>
          </div>
        </div>
      )}

      {step === 2 && prdData && (
        <div className="animate-fade-in">
          <h1>Review Product Requirements</h1>
          <p>The AI has drafted your PRD. Review and refine it before we break it down into Epics.</p>
          
          <div className="glass-card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
               <h2>{prdData.prd?.title || "Draft PRD"}</h2>
               <button className="btn-icon" style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><Edit3 size={18} /></button>
            </div>
            
            <div style={{ marginTop: '16px' }}>
              <strong style={{ color: 'var(--text-secondary)' }}>Executive Summary</strong>
              <p style={{ marginTop: '8px', color: 'var(--text-primary)' }}>{prdData.prd?.executive_summary}</p>
            </div>

            <div style={{ marginTop: '24px' }}>
              <strong style={{ color: 'var(--text-secondary)' }}>Success Metrics</strong>
              <ul style={{ marginTop: '8px', paddingLeft: '20px', color: 'var(--text-primary)' }}>
                {prdData.prd?.success_metrics?.map((metric, idx) => (
                  <li key={idx}>{metric.metric || metric}</li>
                ))}
              </ul>
            </div>
          </div>

          <button className="btn" onClick={generateEpics} disabled={loading}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
            {loading ? 'Decomposing into Epics...' : 'Approve & Generate Epics'}
          </button>
        </div>
      )}

      {step === 3 && epicsData && (
        <div className="animate-fade-in">
          <h1>Review Epics</h1>
          <p>Your product has been broken down into major themes (Epics). Ready to plan sprints?</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            {epicsData.epics?.map((epic, idx) => (
              <div key={idx} className="glass-card" style={{ padding: '20px' }}>
                <h3 style={{ marginBottom: '8px' }}>{epic.title}</h3>
                <p style={{ fontSize: '0.9rem', marginBottom: '0' }}>{epic.description}</p>
              </div>
            ))}
          </div>

          <button className="btn" onClick={finalizePlan}>
            Go to Backlog
          </button>
        </div>
      )}

      {step === 4 && (
        <div className="animate-fade-in" style={{ textAlign: 'center', marginTop: '60px' }}>
          <CheckCircle2 size={48} color="var(--success)" style={{ marginBottom: '24px' }} />
          <h1>Plan Ready!</h1>
          <p>Your product plan is initialized. Visit the Backlog to view stories and tasks.</p>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
};
