import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, X, Edit2, Save } from 'lucide-react';

const initialData = {
  tasks: {
    'task-1': { id: 'task-1', content: 'Implement Google OAuth frontend', priority: 'High', effort: 3 },
    'task-2': { id: 'task-2', content: 'Design Admin Dashboard UI', priority: 'Medium', effort: 5 },
    'task-3': { id: 'task-3', content: 'Scaffold FastAPI backend', priority: 'High', effort: 8 },
    'task-4': { id: 'task-4', content: 'Create Database schemas', priority: 'Medium', effort: 5 },
  },
  columns: {
    'backlog': {
      id: 'backlog',
      title: 'Product Backlog',
      taskIds: ['task-1', 'task-2', 'task-3', 'task-4'],
    },
    'sprint-1': {
      id: 'sprint-1',
      title: 'Sprint 1',
      taskIds: [],
    },
  },
  columnOrder: ['backlog', 'sprint-1'],
};

export const Backlog = () => {
  const [data, setData] = useState(initialData);
  const [editingTask, setEditingTask] = useState(null);

  const onDragEnd = result => {
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
  };

  const handleEditSave = (e) => {
    e.preventDefault();
    setData({
      ...data,
      tasks: {
        ...data.tasks,
        [editingTask.id]: editingTask
      }
    });
    setEditingTask(null);
  };

  return (
    <div className="content-area animate-fade-in" style={{ maxWidth: '1400px' }}>
      <h1>Backlog & Sprint Planner</h1>
      <p>Drag and drop AI-generated stories into your upcoming sprints. Click any card to edit it.</p>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ display: 'flex', gap: '24px', marginTop: '32px' }}>
          {data.columnOrder.map(columnId => {
            const column = data.columns[columnId];
            const tasks = column.taskIds.map(taskId => data.tasks[taskId]);
            
            return (
              <div key={column.id} className="glass-card dnd-column" style={{ flex: 1, minHeight: '500px' }}>
                <h3 style={{ marginBottom: '16px' }}>{column.title} <span className="badge">{tasks.length}</span></h3>
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
                                <p style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>{task.content}</p>
                                <div className="task-meta">
                                  <span className={`badge ${task.priority.toLowerCase()}`}>{task.priority}</span>
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
                    value={editingTask.priority}
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
                    value={editingTask.effort}
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
    </div>
  );
};
