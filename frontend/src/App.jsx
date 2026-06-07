import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthPage } from './Auth';
import { MainLayout } from './layouts/MainLayout';
import { IdeaWizard } from './pages/IdeaWizard';
import { AdminDashboard } from './pages/AdminDashboard';
import { Backlog } from './pages/Backlog';
import { Roadmap } from './pages/Roadmap';
import { Personas } from './pages/Personas';
import { Docs } from './pages/Docs';
import { Sprints } from './pages/Sprints';
import { Dashboard } from './pages/Dashboard';
import { Priority } from './pages/Priority';
import { Settings } from './pages/Settings';
import { ProjectProvider } from './ProjectContext';
import './index.css';
import './Dashboard.css';

function App() {
  return (
    <ProjectProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/signup" element={<AuthPage mode="signup" />} />
          <Route path="/" element={<MainLayout><IdeaWizard /></MainLayout>} />
          <Route path="/admin" element={<MainLayout><AdminDashboard /></MainLayout>} />
          <Route path="/backlog" element={<MainLayout><Backlog /></MainLayout>} />
          <Route path="/roadmap" element={<MainLayout><Roadmap /></MainLayout>} />
          <Route path="/personas" element={<MainLayout><Personas /></MainLayout>} />
          <Route path="/docs" element={<MainLayout><Docs /></MainLayout>} />
          <Route path="/sprints" element={<MainLayout><Sprints /></MainLayout>} />
          <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
          <Route path="/priority" element={<MainLayout><Priority /></MainLayout>} />
          <Route path="/settings" element={<MainLayout><Settings /></MainLayout>} />
          <Route path="*" element={
            <MainLayout>
              <div className="content-area animate-fade-in">
                <h2>Coming Soon</h2>
                <p>This section is under construction. We are working hard to build the backend logic to power this page!</p>
              </div>
            </MainLayout>
          } />
        </Routes>
      </Router>
    </ProjectProvider>
  );
}

export default App;
