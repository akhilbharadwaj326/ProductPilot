import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Activity, Users, Database, AlertCircle } from 'lucide-react';

const usageData = [
  { name: 'Mon', tokens: 4000, ideas: 24 },
  { name: 'Tue', tokens: 3000, ideas: 13 },
  { name: 'Wed', tokens: 5500, ideas: 38 },
  { name: 'Thu', tokens: 2780, ideas: 39 },
  { name: 'Fri', tokens: 1890, ideas: 48 },
  { name: 'Sat', tokens: 2390, ideas: 38 },
  { name: 'Sun', tokens: 3490, ideas: 43 },
];

export const AdminDashboard = () => {
  return (
    <div className="content-area animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>Admin Dashboard</h1>
        <div className="badge badge-success">System Healthy</div>
      </div>
      
      <div className="grid-cards">
        <div className="glass-card stat-card">
          <Activity size={24} className="stat-icon" />
          <div className="stat-details">
            <h3>Total API Calls</h3>
            <p className="stat-value">124.5k</p>
          </div>
        </div>
        <div className="glass-card stat-card">
          <Database size={24} className="stat-icon" />
          <div className="stat-details">
            <h3>Tokens Consumed</h3>
            <p className="stat-value">2.4M</p>
          </div>
        </div>
        <div className="glass-card stat-card">
          <Users size={24} className="stat-icon" />
          <div className="stat-details">
            <h3>Active Users</h3>
            <p className="stat-value">842</p>
          </div>
        </div>
        <div className="glass-card stat-card">
          <AlertCircle size={24} className="stat-icon" />
          <div className="stat-details">
            <h3>Error Rate</h3>
            <p className="stat-value">0.12%</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', marginTop: '24px' }}>
        <div className="glass-card" style={{ flex: 2 }}>
          <h2>Token Usage Over Time</h2>
          <div style={{ height: '300px', marginTop: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="tokens" stroke="var(--accent-color)" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="glass-card" style={{ flex: 1 }}>
          <h2>Ideas Generated</h2>
          <div style={{ height: '300px', marginTop: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
                <Bar dataKey="ideas" fill="var(--success)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
