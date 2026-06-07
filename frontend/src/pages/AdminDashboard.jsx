import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Activity, Users, Database, AlertCircle, Loader2 } from 'lucide-react';

export const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/admin/metrics')
      .then(res => res.json())
      .then(data => {
        setMetrics(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch admin metrics", err);
        setLoading(false);
      });
  }, []);

  const userRole = localStorage.getItem('userRole') || 'user';

  if (userRole !== 'admin') {
    return (
      <div className="content-area animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '400px' }}>
        <AlertCircle size={48} color="var(--warning)" style={{ marginBottom: '16px' }} />
        <h2>Access Denied</h2>
        <p style={{ color: 'var(--text-secondary)' }}>You do not have permission to view the Admin Dashboard.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="content-area animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '400px' }}>
        <Loader2 className="animate-spin" size={48} color="var(--accent-color)" />
      </div>
    );
  }

  const { metrics: stats, usage_data: usageData } = metrics || {};

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
            <h3>Total Artifacts Generated</h3>
            <p className="stat-value">{stats?.total_artifacts || 0}</p>
          </div>
        </div>
        <div className="glass-card stat-card">
          <Database size={24} className="stat-icon" />
          <div className="stat-details">
            <h3>Estimated Tokens Consumed</h3>
            <p className="stat-value">{((stats?.tokens_consumed || 0) / 1000).toFixed(1)}k</p>
          </div>
        </div>
        <div className="glass-card stat-card">
          <Users size={24} className="stat-icon" />
          <div className="stat-details">
            <h3>Total Projects</h3>
            <p className="stat-value">{stats?.total_projects || 0}</p>
          </div>
        </div>
        <div className="glass-card stat-card">
          <AlertCircle size={24} className="stat-icon" />
          <div className="stat-details">
            <h3>Error Rate</h3>
            <p className="stat-value">{stats?.error_rate || "0.00"}%</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', marginTop: '24px' }}>
        <div className="glass-card" style={{ flex: 2 }}>
          <h2>Token Usage Over Time</h2>
          <div style={{ height: '300px', marginTop: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={usageData || []}>
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
              <BarChart data={usageData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
                <Bar dataKey="ideas" fill="var(--success)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .grid-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .stat-card { display: flex; align-items: center; gap: 16px; padding: 20px; }
        .stat-icon { color: var(--accent-color); }
        .stat-value { font-size: 1.5rem; font-weight: bold; margin-top: 4px; }
        .badge-success { background: rgba(16, 185, 129, 0.2); color: var(--success); padding: 4px 8px; border-radius: 4px; }
      `}} />
    </div>
  );
};
