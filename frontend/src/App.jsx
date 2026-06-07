import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Rocket, LayoutDashboard, FileText, Users, CheckSquare, Layers, Map, Settings, LogOut } from 'lucide-react';
import { AuthPage } from './Auth';
import './index.css';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Idea Wizard', path: '/', icon: <Rocket size={18} /> },
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

const IdeaWizard = () => {
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

const MainLayout = ({ children }) => {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <header className="topbar">
          <div className="topbar-title">Workspace / Idea Wizard</div>
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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/signup" element={<AuthPage mode="signup" />} />
        <Route path="/" element={<MainLayout><IdeaWizard /></MainLayout>} />
        <Route path="*" element={
          <MainLayout>
            <div className="content-area animate-fade-in">
              <h2>Coming Soon</h2>
              <p>This section is under construction.</p>
            </div>
          </MainLayout>
        } />
      </Routes>
    </Router>
  );
}

export default App;
