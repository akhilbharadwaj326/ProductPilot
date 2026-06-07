import React, { useState, useEffect } from 'react';
import { Users, Edit2, Save, Plus, Trash2, Loader } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useProject } from '../ProjectContext';

export const Personas = () => {
  const { activeProject } = useProject();
  const [personas, setPersonas] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPersonas();
  }, [activeProject]);

  const fetchPersonas = async () => {
    if (!activeProject) {
      setPersonas([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const { data } = await supabase.from('personas')
      .select('*')
      .eq('project_id', activeProject.id)
      .order('created_at', { ascending: true });
    setPersonas(data || []);
    setIsLoading(false);
  };

  const handleEdit = (p) => {
    setEditingId(p.id);
    setEditForm(p);
  };

  const handleSave = async () => {
    if (editingId && typeof editingId === 'string') {
      // update
      await supabase.from('personas').update({
        name: editForm.name,
        role: editForm.role,
        goals: editForm.goals,
        pain_points: editForm.pain_points
      }).eq('id', editingId);
    } else {
      // create
      await supabase.from('personas').insert([{
        project_id: activeProject.id,
        name: editForm.name,
        role: editForm.role,
        goals: editForm.goals,
        pain_points: editForm.pain_points
      }]);
    }
    setEditingId(null);
    fetchPersonas();
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this persona?')) {
      await supabase.from('personas').delete().eq('id', id);
      fetchPersonas();
    }
  };

  const handleAdd = () => {
    const newPersona = { id: 'new', name: 'New Persona', role: 'Role', goals: '', pain_points: '' };
    setPersonas([...personas, newPersona]);
    handleEdit(newPersona);
  };

  if (isLoading) {
    return (
      <div className="content-area animate-fade-in" style={{ maxWidth: '1000px', textAlign: 'center', marginTop: '100px' }}>
        <Loader size={48} className="animate-spin" color="var(--accent-color)" style={{ margin: '0 auto', animation: 'spin 1s linear infinite' }} />
        <h2>Loading Personas...</h2>
      </div>
    );
  }

  return (
    <div className="content-area animate-fade-in" style={{ maxWidth: '1000px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>User Personas</h1>
          <p>Define and manage the target audience for {activeProject?.name || 'this product'}.</p>
        </div>
        <button className="btn" onClick={handleAdd} disabled={!activeProject}><Plus size={18} /> Add Persona</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '32px' }}>
        {personas.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No personas defined. Click "Add Persona" to create one.</p>}
        {personas.map(p => (
          <div key={p.id} className="glass-card">
            {editingId === p.id ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <input className="input-field" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} placeholder="Persona Name" />
                <input className="input-field" value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})} placeholder="Role / Archetype" />
                <textarea className="input-field" value={editForm.goals} onChange={e => setEditForm({...editForm, goals: e.target.value})} placeholder="Goals" />
                <textarea className="input-field" value={editForm.pain_points} onChange={e => setEditForm({...editForm, pain_points: e.target.value})} placeholder="Pain Points & Frustrations" />
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn" onClick={handleSave}><Save size={18} /> Save</button>
                  <button className="btn btn-secondary" onClick={() => { setEditingId(null); fetchPersonas(); }}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, right: 0, display: 'flex', gap: '8px' }}>
                  <button className="btn-icon" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={() => handleEdit(p)}><Edit2 size={18} /></button>
                  <button className="btn-icon" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--danger)' }} onClick={() => handleDelete(p.id)}><Trash2 size={18} /></button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={24} color="white" /></div>
                  <div>
                    <h2 style={{ margin: 0 }}>{p.name}</h2>
                    <span style={{ color: 'var(--text-secondary)' }}>{p.role}</span>
                  </div>
                </div>
                <div style={{ marginTop: '16px' }}>
                  <strong>Goals:</strong>
                  <p style={{ whiteSpace: 'pre-wrap', marginTop: '4px', color: 'var(--text-secondary)' }}>{p.goals}</p>
                </div>
                <div style={{ marginTop: '16px' }}>
                  <strong>Pain Points / Frustrations:</strong>
                  <p style={{ whiteSpace: 'pre-wrap', marginTop: '4px', color: 'var(--text-secondary)' }}>{p.pain_points}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}} />
    </div>
  );
};
