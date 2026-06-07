import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Rocket, LayoutDashboard, FileText, Users, CheckSquare, Layers, Map, Settings, LogOut, ShieldAlert } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Idea Wizard', path: '/', icon: <Rocket size={18} /> },
    { name: 'Admin Dashboard', path: '/admin', icon: <ShieldAlert size={18} /> },
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'PRD & Docs', path: '/docs', icon: <FileText size={18} /> },
    { name: 'Personas', path: '/personas', icon: <Users size={18} /> },
    { name: 'Backlog', path: '/backlog', icon: <Layers size={18} /> },
    { name: 'Sprints', path: '/sprints', icon: <CheckSquare size={18} /> },
    { name: 'Roadmap', path: '/roadmap', icon: <Map size={18} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={18} /> },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Rocket className="logo-icon" size={24} />
        ProductPilot
      </div>
      <nav className="sidebar-nav" style={{ flex: 1 }}>
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            {item.icon}
            {item.name}
          </Link>
        ))}
      </nav>
      <div className="sidebar-footer" style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
        <Link to="/login" className="nav-item">
          <LogOut size={18} />
          Sign Out
        </Link>
      </div>
    </aside>
  );
};

export const MainLayout = ({ children }) => {
  const location = useLocation();
  const titleMap = {
    '/': 'Idea Wizard',
    '/admin': 'Admin Dashboard',
    '/backlog': 'Backlog',
    '/roadmap': 'Roadmap',
    '/dashboard': 'Dashboard',
    '/docs': 'PRD & Docs',
    '/personas': 'Personas',
    '/sprints': 'Sprints'
  };
  const title = titleMap[location.pathname] || 'Workspace';

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <header className="topbar">
          <div className="topbar-title">Workspace / {title}</div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Draft Mode</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              A
            </div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
};
