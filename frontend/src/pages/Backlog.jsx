import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical } from 'lucide-react';

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

  return (
    <div className="content-area animate-fade-in" style={{ maxWidth: '1400px' }}>
      <h1>Backlog & Sprint Planner</h1>
      <p>Drag and drop AI-generated stories into your upcoming sprints.</p>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ display: 'flex', gap: '24px', marginTop: '32px' }}>
          {data.columnOrder.map(columnId => {
            const column = data.columns[columnId];
            const tasks = column.taskIds.map(taskId => data.tasks[taskId]);
            
            return (
              <div key={column.id} className="glass-card dnd-column">
                <h3>{column.title} <span className="badge">{tasks.length}</span></h3>
                <Droppable droppableId={column.id}>
                  {(provided) => (
                    <div 
                      ref={provided.innerRef} 
                      {...provided.droppableProps}
                      className="dnd-task-list"
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
                              <div className="task-content">
                                <p>{task.content}</p>
                                <div className="task-meta">
                                  <span className={`badge ${task.priority.toLowerCase()}`}>{task.priority}</span>
                                  <span className="badge effort">{task.effort} pts</span>
                                </div>
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
    </div>
  );
};
