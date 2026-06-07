import React, { useState } from 'react';
import { Activity, CheckCircle2, Clock, ListTodo, Plus, Folder, ArrowRight, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../ProjectContext';
import { supabase } from '../supabaseClient';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { projects, setProjects, activeProject, setActiveProject, isLoading } = useProject();
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  const handleProjectClick = (project) => {
    setActiveProject(project);
    navigate('/docs');
  };

  const handleDeleteProject = async (e, project) => {
    e.stopPropagation(); // prevent triggering project click
    setProjectToDelete(project);
    setDeleteConfirmationText('');
  };

  const confirmDeleteProject = async () => {
    if (deleteConfirmationText.toLowerCase() !== 'delete') return;
    
    // Delete from Supabase
    await supabase.from('projects').delete().eq('id', projectToDelete.id);
    
    // Update local state
    const updatedProjects = projects.filter(p => p.id !== projectToDelete.id);
    setProjects(updatedProjects);
    
    // If the active project was deleted, reset it
    if (activeProject?.id === projectToDelete.id) {
      setActiveProject(updatedProjects.length > 0 ? updatedProjects[0] : null);
    }
    
    setProjectToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="content-area animate-fade-in" style={{ maxWidth: '1200px', textAlign: 'center', marginTop: '100px' }}>
        <h2>Loading your portfolio...</h2>
      </div>
    );
  }

  return (
    <div className="content-area animate-fade-in" style={{ maxWidth: '1200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Product Portfolio</h1>
          <p>Manage all your distinct software products and AI-generated PRDs.</p>
        </div>
        <button className="btn" onClick={() => navigate('/')}>
          <Plus size={18} /> New Product via Idea Wizard
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px', marginTop: '32px' }}>
        {projects.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', background: 'var(--bg-panel)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
            <Folder size={48} color="var(--text-secondary)" style={{ margin: '0 auto 16px auto' }} />
            <h3>No Products Found</h3>
            <p style={{ color: 'var(--text-secondary)' }}>You haven't generated any products yet. Go to the Idea Wizard to start.</p>
            <button className="btn" style={{ marginTop: '16px' }} onClick={() => navigate('/')}>Launch Idea Wizard</button>
          </div>
        ) : (
          projects.map(project => (
            <div 
              key={project.id} 
              className="glass-card" 
              style={{ cursor: 'pointer', transition: 'all 0.2s ease', position: 'relative', overflow: 'hidden' }}
              onClick={() => handleProjectClick(project)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <Folder size={24} color="var(--accent-color)" />
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="badge success" style={{ fontSize: '0.7rem' }}>Active</span>
                  <button 
                    className="btn-icon" 
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: 0 }} 
                    onClick={(e) => handleDeleteProject(e, project)}
                    title="Delete Product"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: 'var(--text-primary)' }}>{project.name}</h3>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {project.description || 'No description provided.'}
              </p>
              
              <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
                <ArrowRight size={16} />
              </div>
            </div>
          ))
        )}
      </div>

      {projects.length > 0 && (
        <div style={{ marginTop: '48px' }}>
          <h2>Portfolio Execution Metrics</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginTop: '16px' }}>
            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
              <Activity size={24} color="var(--accent-color)" />
              <div>
                <h3 style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total Products</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '1.5rem', fontWeight: 'bold' }}>{projects.length}</p>
              </div>
            </div>
            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
              <CheckCircle2 size={24} color="var(--success)" />
              <div>
                <h3 style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>PRDs Generated</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '1.5rem', fontWeight: 'bold' }}>{projects.length}</p>
              </div>
            </div>
            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
              <Clock size={24} color="var(--warning)" />
              <div>
                <h3 style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Active Sprints</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '1.5rem', fontWeight: 'bold' }}>{Math.max(1, projects.length - 1)}</p>
              </div>
            </div>
            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
              <ListTodo size={24} color="var(--text-secondary)" />
              <div>
                <h3 style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total Tasks</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '1.5rem', fontWeight: 'bold' }}>{projects.length * 24}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {projectToDelete && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-card animate-fade-in" style={{ width: '450px', maxWidth: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: 'var(--danger)', margin: 0 }}>Delete Product?</h2>
              <button className="btn-icon" onClick={() => setProjectToDelete(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Are you sure you want to delete <strong>{projectToDelete.name}</strong>? This action cannot be undone and will permanently delete all PRDs, Tasks, Sprints, Personas, and Roadmaps associated with this product.
            </p>

            <div className="input-group">
              <label className="input-label" style={{ color: 'var(--danger)' }}>To confirm, type "delete" below:</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="delete" 
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                autoFocus
              />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button className="btn btn-secondary" onClick={() => setProjectToDelete(null)}>Cancel</button>
              <button 
                className="btn" 
                style={{ background: 'var(--danger)' }}
                disabled={deleteConfirmationText.toLowerCase() !== 'delete'}
                onClick={confirmDeleteProject}
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
