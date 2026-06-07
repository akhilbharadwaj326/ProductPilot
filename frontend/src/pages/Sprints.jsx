import React, { useState, useEffect } from 'react';
import { CheckSquare, Play, Clock, CheckCircle2, Download, Loader } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useProject } from '../ProjectContext';

export const Sprints = () => {
  const { activeProject } = useProject();
  const [activeSprint, setActiveSprint] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActiveSprint();
  }, [activeProject]);

  const fetchActiveSprint = async () => {
    if (!activeProject) {
      setActiveSprint(null);
      setTasks([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    
    // Find active sprint, or planned sprint if no active
    let { data: sprints } = await supabase.from('sprints')
      .select('*')
      .eq('project_id', activeProject.id)
      .in('status', ['active', 'planned'])
      .order('created_at', { ascending: true });

    if (!sprints || sprints.length === 0) {
      setActiveSprint(null);
      setTasks([]);
      setIsLoading(false);
      return;
    }

    const targetSprint = sprints.find(s => s.status === 'active') || sprints[0];
    setActiveSprint(targetSprint);

    const { data: sprintTasks } = await supabase.from('tasks')
      .select('*')
      .eq('sprint_id', targetSprint.id);

    setTasks(sprintTasks || []);
    setIsLoading(false);
  };

  const handleStartSprint = async () => {
    if (!activeSprint) return;
    await supabase.from('sprints').update({ status: 'active' }).eq('id', activeSprint.id);
    setActiveSprint({ ...activeSprint, status: 'active' });
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId);
  };

  const downloadCSV = () => {
    const headers = ['ID', 'Title', 'Status', 'Effort'];
    const csvContent = [
      headers.join(','),
      ...tasks.map(t => `${t.id},"${t.content}",${t.status || 'Todo'},${t.effort || 0}`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${activeSprint?.title || 'sprint'}_tasks.csv`;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="content-area animate-fade-in" style={{ maxWidth: '1200px', textAlign: 'center', marginTop: '100px' }}>
        <Loader size={48} className="animate-spin" color="var(--accent-color)" style={{ margin: '0 auto', animation: 'spin 1s linear infinite' }} />
        <h2>Loading Sprints...</h2>
      </div>
    );
  }

  const isSprintStarted = activeSprint?.status === 'active';
  const totalPoints = tasks.reduce((sum, t) => sum + (t.effort || 0), 0);
  const donePoints = tasks.filter(t => t.status === 'Done').reduce((sum, t) => sum + (t.effort || 0), 0);
  const progressPercent = totalPoints > 0 ? Math.round((donePoints / totalPoints) * 100) : 0;

  return (
    <div className="content-area animate-fade-in" style={{ maxWidth: '1200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Active Sprints</h1>
          <p>Track the progress of your current development cycle for {activeProject?.name || 'this product'}.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={downloadCSV} style={{ background: 'var(--bg-panel)' }} disabled={!activeSprint}>
            <Download size={18} /> Download CSV
          </button>
          <button 
            className="btn" 
            onClick={handleStartSprint}
            disabled={!activeSprint || isSprintStarted}
            style={{ opacity: (!activeSprint || isSprintStarted) ? 0.5 : 1 }}
          >
            {isSprintStarted ? <Clock size={18} /> : <Play size={18} />} 
            {isSprintStarted ? 'Sprint Active' : 'Start Sprint'}
          </button>
        </div>
      </div>

      {!activeSprint ? (
        <div className="glass-card" style={{ marginTop: '32px', textAlign: 'center', padding: '40px' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No sprints found. Use the Backlog or Idea Wizard to create a sprint.</p>
        </div>
      ) : (
        <div className="glass-card" style={{ marginTop: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ margin: 0 }}>{activeSprint.title}</h2>
            {isSprintStarted && <span className="badge success">Active</span>}
          </div>
          <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ flex: 1 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Status</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', color: 'var(--accent-color)' }}>
                <Clock size={16} /> {isSprintStarted ? 'In Progress' : 'Planned'}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Progress</span>
              <div style={{ marginTop: '4px', fontWeight: 'bold' }}>{progressPercent}% ({donePoints}/{totalPoints} Points)</div>
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Goal</span>
              <div style={{ marginTop: '4px' }}>Complete all sprint stories.</div>
            </div>
          </div>

          <h3>Sprint Backlog</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            {tasks.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No tasks in this sprint.</p>}
            {tasks.map(task => (
              <div key={task.id} style={{ padding: '16px', background: 'var(--bg-card)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <CheckCircle2 size={20} color={task.status === 'Done' ? 'var(--success)' : 'var(--border-color)'} />
                  <span style={{ textDecoration: task.status === 'Done' ? 'line-through' : 'none', color: task.status === 'Done' ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                    {task.content}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <select 
                    className="input-field"
                    style={{ padding: '4px 8px', minHeight: 'auto', background: 'transparent' }}
                    value={task.status || 'Todo'}
                    onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                  >
                    <option value="Todo">Todo</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                  <span className="badge effort">{task.effort || 0} pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <style dangerouslySetInnerHTML={{__html: `
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}} />
    </div>
  );
};
