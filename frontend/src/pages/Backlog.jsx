import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, X, Edit2, Save, Trash2, Plus, Play, CheckSquare, Loader } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useProject } from '../ProjectContext';

export const Backlog = () => {
  const { activeProject } = useProject();
  const [data, setData] = useState({ tasks: {}, columns: {}, columnOrder: [] });
  const [editingTask, setEditingTask] = useState(null);
  const [newTaskContent, setNewTaskContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBacklogData();
  }, [activeProject]);

  const fetchBacklogData = async () => {
    if (!activeProject) {
      setData({ tasks: {}, columns: {}, columnOrder: [] });
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    
    // Fetch sprints
    const { data: sprints } = await supabase.from('sprints')
      .select('*')
      .eq('project_id', activeProject.id)
      .order('created_at', { ascending: true });

    // Fetch tasks
    const { data: dbTasks } = await supabase.from('tasks')
      .select('*')
      .eq('project_id', activeProject.id);

    const newTasks = {};
    const newColumns = {
      'backlog': {
        id: 'backlog',
        title: 'Product Backlog',
        taskIds: [],
        isSprint: false
      }
    };
    const newColumnOrder = ['backlog'];

    if (dbTasks) {
      dbTasks.forEach(task => {
        newTasks[task.id] = task;
        if (!task.sprint_id) {
          newColumns['backlog'].taskIds.push(task.id);
        }
      });
    }

    if (sprints) {
      sprints.forEach(sprint => {
        newColumns[sprint.id] = {
          id: sprint.id,
          title: sprint.title,
          taskIds: dbTasks?.filter(t => t.sprint_id === sprint.id).map(t => t.id) || [],
          isSprint: true,
          status: sprint.status
        };
        newColumnOrder.push(sprint.id);
      });
    }

    setData({ tasks: newTasks, columns: newColumns, columnOrder: newColumnOrder });
    setIsLoading(false);
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const start = data.columns[source.droppableId];
    const finish = data.columns[destination.droppableId];

    if (start === finish) {
      const newTaskIds = Array.from(start.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = { ...start, taskIds: newTaskIds };
      setData({ ...data, columns: { ...data.columns, [newColumn.id]: newColumn } });
      return;
    }

    const startTaskIds = Array.from(start.taskIds);
    startTaskIds.splice(source.index, 1);
    const newStart = { ...start, taskIds: startTaskIds };

    const finishTaskIds = Array.from(finish.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId);
    const newFinish = { ...finish, taskIds: finishTaskIds };

    setData({
      ...data,
      columns: { ...data.columns, [newStart.id]: newStart, [newFinish.id]: newFinish },
    });

    // Update backend sprint_id
    await supabase.from('tasks').update({ 
      sprint_id: destination.droppableId === 'backlog' ? null : destination.droppableId 
    }).eq('id', draggableId);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    setData({
      ...data,
      tasks: { ...data.tasks, [editingTask.id]: editingTask }
    });
    
    await supabase.from('tasks').update({
      content: editingTask.content,
      priority: editingTask.priority,
      effort: editingTask.effort
    }).eq('id', editingTask.id);
    
    setEditingTask(null);
  };

  const handleDeleteTask = async (taskId, columnId, e) => {
    e.stopPropagation();
    const newTasks = { ...data.tasks };
    delete newTasks[taskId];

    const newColumnTaskIds = data.columns[columnId].taskIds.filter(id => id !== taskId);

    setData({
      ...data,
      tasks: newTasks,
      columns: { ...data.columns, [columnId]: { ...data.columns[columnId], taskIds: newColumnTaskIds } }
    });

    await supabase.from('tasks').delete().eq('id', taskId);
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskContent.trim() || !activeProject) return;

    const { data: newDbTask } = await supabase.from('tasks').insert([{
      project_id: activeProject.id,
      content: newTaskContent,
      priority: 'Medium',
      effort: 3,
      status: 'Todo'
    }]).select();

    if (newDbTask && newDbTask.length > 0) {
      const task = newDbTask[0];
      const newBacklogTaskIds = Array.from(data.columns['backlog'].taskIds);
      newBacklogTaskIds.unshift(task.id);

      setData({
        ...data,
        tasks: { ...data.tasks, [task.id]: task },
        columns: { ...data.columns, 'backlog': { ...data.columns['backlog'], taskIds: newBacklogTaskIds } }
      });
      setNewTaskContent('');
    }
  };

  const handleAddSprint = async () => {
    const sprintCount = Object.keys(data.columns).filter(k => data.columns[k].isSprint).length + 1;
    
    const { data: newDbSprint } = await supabase.from('sprints').insert([{
      project_id: activeProject.id,
      title: `Sprint ${sprintCount}`,
      status: 'planned'
    }]).select();

    if (newDbSprint && newDbSprint.length > 0) {
      const sprint = newDbSprint[0];
      const newSprint = { id: sprint.id, title: sprint.title, taskIds: [], isSprint: true, status: sprint.status };

      setData({
        ...data,
        columns: { ...data.columns, [sprint.id]: newSprint },
        columnOrder: [...data.columnOrder, sprint.id]
      });
    }
  };

  const handleStartSprint = async (sprintId) => {
    setData({
      ...data,
      columns: { ...data.columns, [sprintId]: { ...data.columns[sprintId], status: 'active' } }
    });
    await supabase.from('sprints').update({ status: 'active' }).eq('id', sprintId);
  };

  const handleEndSprint = async (sprintId) => {
    const sprintTasks = data.columns[sprintId].taskIds;
    let nextSprintId = data.columnOrder[data.columnOrder.indexOf(sprintId) + 1];
    
    let newData = { ...data };

    if (!nextSprintId) {
      const sprintCount = Object.keys(data.columns).filter(k => data.columns[k].isSprint).length + 1;
      const { data: newDbSprint } = await supabase.from('sprints').insert([{
        project_id: activeProject.id, title: `Sprint ${sprintCount}`, status: 'planned'
      }]).select();
      
      if (newDbSprint && newDbSprint.length > 0) {
        nextSprintId = newDbSprint[0].id;
        const newSprint = { id: nextSprintId, title: newDbSprint[0].title, taskIds: [], isSprint: true, status: 'planned' };
        newData.columns[nextSprintId] = newSprint;
        newData.columnOrder.push(nextSprintId);
      }
    }

    if (nextSprintId && sprintTasks.length > 0) {
      newData.columns[nextSprintId].taskIds = [...sprintTasks, ...newData.columns[nextSprintId].taskIds];
      
      // update backend tasks to new sprint
      for (const taskId of sprintTasks) {
        await supabase.from('tasks').update({ sprint_id: nextSprintId }).eq('id', taskId);
      }
    }

    delete newData.columns[sprintId];
    newData.columnOrder = newData.columnOrder.filter(id => id !== sprintId);
    
    await supabase.from('sprints').update({ status: 'completed' }).eq('id', sprintId);

    setData(newData);
    alert(`Sprint ended! Unfinished tasks were forwarded to next sprint.`);
  };

  if (isLoading) {
    return (
      <div className="content-area animate-fade-in" style={{ maxWidth: '1400px', textAlign: 'center', marginTop: '100px' }}>
        <Loader size={48} className="animate-spin" color="var(--accent-color)" style={{ margin: '0 auto', animation: 'spin 1s linear infinite' }} />
        <h2>Loading Backlog...</h2>
      </div>
    );
  }

  return (
    <div className="content-area animate-fade-in" style={{ maxWidth: '1400px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Backlog & Sprint Planner</h1>
          <p>Drag and drop AI-generated stories into your upcoming sprints. Start and end sprints here.</p>
        </div>
        <button className="btn" onClick={handleAddSprint} disabled={!activeProject}><Plus size={18} /> Add Sprint</button>
      </div>
      
      <form onSubmit={handleAddTask} style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
        <input 
          type="text" 
          className="input-field" 
          placeholder="Add a new story to the backlog..." 
          value={newTaskContent}
          onChange={(e) => setNewTaskContent(e.target.value)}
          style={{ flex: 1 }}
          disabled={!activeProject}
        />
        <button type="submit" className="btn" disabled={!activeProject}>Add Story</button>
      </form>

      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ display: 'flex', gap: '24px', marginTop: '32px', overflowX: 'auto', paddingBottom: '20px' }}>
          {data.columnOrder.map(columnId => {
            const column = data.columns[columnId];
            const tasks = column.taskIds.map(taskId => data.tasks[taskId]);
            
            return (
              <div key={column.id} className="glass-card dnd-column" style={{ minWidth: '400px', flex: 1, minHeight: '500px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0 }}>
                    {column.title} <span className="badge">{tasks.length}</span>
                    {column.status === 'active' && <span className="badge success" style={{ marginLeft: '8px' }}>Active</span>}
                  </h3>
                  
                  {column.isSprint && (
                    <div>
                      {column.status === 'planned' && (
                        <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem' }} onClick={() => handleStartSprint(column.id)}>
                          <Play size={14} /> Start Sprint
                        </button>
                      )}
                      {column.status === 'active' && (
                        <button className="btn" style={{ padding: '4px 8px', fontSize: '0.8rem' }} onClick={() => handleEndSprint(column.id)}>
                          <CheckSquare size={14} /> End Sprint
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <Droppable droppableId={column.id}>
                  {(provided) => (
                    <div 
                      ref={provided.innerRef} 
                      {...provided.droppableProps}
                      className="dnd-task-list"
                      style={{ minHeight: '300px' }}
                    >
                      {tasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`dnd-task ${snapshot.isDragging ? 'dragging' : ''}`}
                            >
                              <div {...provided.dragHandleProps} className="drag-handle">
                                <GripVertical size={16} />
                              </div>
                              <div className="task-content" onClick={() => setEditingTask(task)} style={{ cursor: 'pointer', flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <p style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: 'var(--text-primary)' }}>{task.content}</p>
                                  <button 
                                    className="btn-icon" 
                                    style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: 0 }}
                                    onClick={(e) => handleDeleteTask(task.id, column.id, e)}
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span className={`badge ${(task.priority || 'Medium').toLowerCase()}`}>{task.priority}</span>
                                  <span className="badge effort">{task.effort} pts</span>
                                </div>
                              </div>
                              <div style={{ padding: '8px', color: 'var(--text-secondary)', cursor: 'pointer' }} onClick={() => setEditingTask(task)}>
                                <Edit2 size={14} />
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Editing Modal */}
      {editingTask && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-card animate-fade-in" style={{ width: '500px', maxWidth: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>Edit Story</h2>
              <button className="btn-icon" onClick={() => setEditingTask(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleEditSave}>
              <div className="input-group">
                <label className="input-label">Content</label>
                <textarea 
                  className="input-field" 
                  value={editingTask.content}
                  onChange={(e) => setEditingTask({...editingTask, content: e.target.value})}
                  required
                  style={{ minHeight: '80px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label className="input-label">Priority</label>
                  <select 
                    className="input-field"
                    value={editingTask.priority || 'Medium'}
                    onChange={(e) => setEditingTask({...editingTask, priority: e.target.value})}
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label className="input-label">Effort (Points)</label>
                  <input 
                    type="number"
                    className="input-field"
                    value={editingTask.effort || 0}
                    onChange={(e) => setEditingTask({...editingTask, effort: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="submit" className="btn">
                  <Save size={18} />
                  Save Changes
                </button>
              </div>
            </form>
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
