import React, { useState, useEffect } from 'react';
import { AlertCircle, Target, ArrowUp, ArrowRight, ArrowDown, Loader } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useProject } from '../ProjectContext';

export const Priority = () => {
  const { activeProject } = useProject();
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, [activeProject]);

  const fetchTasks = async () => {
    if (!activeProject) {
      setTasks([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const { data } = await supabase.from('tasks')
      .select('*')
      .eq('project_id', activeProject.id)
      .order('created_at', { ascending: false });

    // Simulate business value score out of 10 based on Priority and low effort
    const enrichedTasks = (data || []).map(t => {
      let value = 5;
      if (t.priority === 'High') value = 8;
      if (t.priority === 'Medium') value = 5;
      if (t.priority === 'Low') value = 2;
      
      // Bonus points for lower effort (quick wins)
      if (t.effort <= 3) value += 2;
      else if (t.effort >= 8) value -= 2;
      
      return { ...t, value: Math.max(1, Math.min(10, value)) };
    });

    setTasks(enrichedTasks);
    setIsLoading(false);
  };

  const updatePriority = async (taskId, newPriority) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, priority: newPriority } : t));
    await supabase.from('tasks').update({ priority: newPriority }).eq('id', taskId);
    fetchTasks(); // refresh to recalculate values
  };

  const sortedTasks = [...tasks].sort((a, b) => b.value - a.value);

  if (isLoading) {
    return (
      <div className="content-area animate-fade-in" style={{ maxWidth: '1200px', textAlign: 'center', marginTop: '100px' }}>
        <Loader size={48} className="animate-spin" color="var(--accent-color)" style={{ margin: '0 auto', animation: 'spin 1s linear infinite' }} />
        <h2>Loading Priorities...</h2>
      </div>
    );
  }

  return (
    <div className="content-area animate-fade-in" style={{ maxWidth: '1200px' }}>
      <h1>Priority Board</h1>
      <p>Evaluate and adjust the priority of your tasks based on business value and effort for {activeProject?.name || 'this product'}.</p>

      {tasks.length === 0 ? (
        <div className="glass-card" style={{ marginTop: '32px', textAlign: 'center', padding: '40px' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No tasks found. Use the Idea Wizard or Backlog to create tasks.</p>
        </div>
      ) : (
        <div className="glass-card" style={{ marginTop: '32px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '16px 8px', color: 'var(--text-secondary)' }}>Task</th>
                <th style={{ padding: '16px 8px', color: 'var(--text-secondary)' }}>Priority</th>
                <th style={{ padding: '16px 8px', color: 'var(--text-secondary)' }}>Effort (Pts)</th>
                <th style={{ padding: '16px 8px', color: 'var(--text-secondary)' }}>AI Value Score</th>
                <th style={{ padding: '16px 8px', color: 'var(--text-secondary)' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedTasks.map(task => (
                <tr key={task.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '16px 8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Target size={16} color="var(--accent-color)" style={{ flexShrink: 0 }} />
                      <span>{task.content}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 8px' }}>
                    <span className={`badge ${(task.priority || 'Medium').toLowerCase()}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      {task.priority === 'High' ? <ArrowUp size={12} /> : task.priority === 'Medium' ? <ArrowRight size={12} /> : <ArrowDown size={12} />}
                      {task.priority || 'Medium'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 8px' }}><span className="badge effort">{task.effort || 0} pts</span></td>
                  <td style={{ padding: '16px 8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong>{task.value} / 10</strong>
                      <div style={{ width: '60px', height: '6px', background: 'var(--bg-panel)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${task.value * 10}%`, height: '100%', background: task.value >= 8 ? 'var(--success)' : task.value >= 5 ? 'var(--warning)' : 'var(--danger)' }} />
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 8px' }}>
                    <select 
                      className="input-field" 
                      style={{ padding: '4px 8px', minHeight: 'auto', background: 'transparent' }}
                      value={task.priority || 'Medium'}
                      onChange={(e) => updatePriority(task.id, e.target.value)}
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <style dangerouslySetInnerHTML={{__html: `
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}} />
    </div>
  );
};
