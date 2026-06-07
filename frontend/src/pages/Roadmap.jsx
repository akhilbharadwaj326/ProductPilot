import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const data = [
  { name: 'Google Auth', effort: 3, value: 8 },
  { name: 'Admin Dashboard', effort: 5, value: 6 },
  { name: 'FastAPI Scaffold', effort: 8, value: 9 },
  { name: 'Drag & Drop UI', effort: 6, value: 7 },
  { name: 'Dark Mode Themes', effort: 2, value: 4 },
];

export const Roadmap = () => {
  return (
    <div className="content-area animate-fade-in">
      <h1>Priority Matrix</h1>
      <p>AI-calculated Value vs. Effort mapping to help you identify quick wins and strategic initiatives.</p>
      
      <div className="glass-card" style={{ marginTop: '32px' }}>
        <div style={{ height: '500px', position: 'relative' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis type="number" dataKey="effort" name="Effort" stroke="var(--text-secondary)" domain={[0, 10]} label={{ value: 'Effort (Points)', position: 'insideBottomRight', offset: -10, fill: 'var(--text-secondary)' }} />
              <YAxis type="number" dataKey="value" name="Value" stroke="var(--text-secondary)" domain={[0, 10]} label={{ value: 'Business Value', angle: -90, position: 'insideLeft', fill: 'var(--text-secondary)' }} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
              <ReferenceLine x={5} stroke="var(--text-secondary)" strokeDasharray="3 3" />
              <ReferenceLine y={5} stroke="var(--text-secondary)" strokeDasharray="3 3" />
              <Scatter name="Features" data={data} fill="var(--accent-color)" />
            </ScatterChart>
          </ResponsiveContainer>
          
          <div style={{ position: 'absolute', top: 10, left: 30, color: 'var(--success)', fontWeight: 'bold', opacity: 0.7 }}>Quick Wins</div>
          <div style={{ position: 'absolute', top: 10, right: 30, color: 'var(--accent-color)', fontWeight: 'bold', opacity: 0.7 }}>Strategic</div>
          <div style={{ position: 'absolute', bottom: 30, left: 30, color: 'var(--text-secondary)', fontWeight: 'bold', opacity: 0.7 }}>Low Priority</div>
          <div style={{ position: 'absolute', bottom: 30, right: 30, color: 'var(--warning)', fontWeight: 'bold', opacity: 0.7 }}>Time Sinks</div>
        </div>
      </div>
    </div>
  );
};
