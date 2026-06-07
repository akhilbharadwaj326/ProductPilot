import React from 'react';
import { Rocket } from 'lucide-react';

export const IdeaWizard = () => {
  return (
    <div className="content-area animate-fade-in">
      <h1>Turn your idea into execution</h1>
      <p>Describe your product idea, constraints, and goals. Our AI will instantly generate your PRD, user stories, and a prioritized sprint plan.</p>
      
      <div className="glass-card">
        <div className="input-group">
          <label className="input-label">Product Idea</label>
          <textarea 
            className="input-field" 
            placeholder="E.g., An AI-powered workspace that turns raw product ideas into execution-ready plans..."
          ></textarea>
        </div>

        <div className="input-group">
          <label className="input-label">Target Audience</label>
          <input 
            type="text" 
            className="input-field" 
            placeholder="E.g., Product Managers, Founders, Developers"
          />
        </div>

        <div className="input-group">
          <label className="input-label">Key Business Goals</label>
          <input 
            type="text" 
            className="input-field" 
            placeholder="E.g., Reduce planning time by 80%"
          />
        </div>

        <button className="btn" style={{ marginTop: '16px' }}>
          <Rocket size={18} />
          Generate Product Plan
        </button>
      </div>
    </div>
  );
};
