import React, { useState } from 'react';
import { 
  Plus, 
  Calendar, 
  CheckSquare, 
  Square, 
  Star, 
  Edit3, 
  Trash2, 
  AlertTriangle
} from 'lucide-react';
import type { Task, TaskStatus } from '../types';
import { useTasks } from '../context/TaskContext';

interface KanbanBoardProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onOpenCreateWithStatus: (status: TaskStatus) => void;
}

interface ColumnConfig {
  id: TaskStatus;
  title: string;
  icon: string;
  colorVar: string;
  bgVar: string;
}

const COLUMNS: ColumnConfig[] = [
  { id: 'backlog', title: 'Backlog', icon: '📋', colorVar: 'var(--status-backlog)', bgVar: 'var(--status-backlog-bg)' },
  { id: 'todo', title: 'To Do', icon: '🎯', colorVar: 'var(--status-todo)', bgVar: 'var(--status-todo-bg)' },
  { id: 'in_progress', title: 'In Progress', icon: '⚡', colorVar: 'var(--status-in_progress)', bgVar: 'var(--status-in_progress-bg)' },
  { id: 'review', title: 'In Review', icon: '🔍', colorVar: 'var(--status-review)', bgVar: 'var(--status-review-bg)' },
  { id: 'completed', title: 'Completed', icon: '✅', colorVar: 'var(--status-completed)', bgVar: 'var(--status-completed-bg)' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onEditTask,
  onOpenCreateWithStatus,
}) => {
  const { deleteTask, toggleTaskComplete, toggleStar, moveTaskStatus } = useTasks();
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedTaskId(id);
  };

  const handleDragOver = (e: React.DragEvent, columnId: TaskStatus) => {
    e.preventDefault();
    if (dragOverColumn !== columnId) {
      setDragOverColumn(columnId);
    }
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, columnId: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      moveTaskStatus(taskId, columnId);
    }
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  // Helper for overdue check
  const isOverdue = (dueDateStr?: string | null, status?: TaskStatus) => {
    if (!dueDateStr || status === 'completed') return false;
    return new Date(dueDateStr).getTime() < new Date().setHours(0, 0, 0, 0);
  };

  // Format date helper
  const formatDate = (isoString?: string | null) => {
    if (!isoString) return null;
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="kanban-board-container">
      <div className="kanban-grid">
        {COLUMNS.map((col) => {
          const columnTasks = tasks.filter((t) => t.status === col.id);
          const isOver = dragOverColumn === col.id;

          return (
            <div
              key={col.id}
              className={`kanban-column ${isOver ? 'column-drag-over' : ''}`}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              {/* Column Header */}
              <div className="kanban-column-header">
                <div className="column-title-wrap">
                  <span className="column-emoji">{col.icon}</span>
                  <h3 className="column-name">{col.title}</h3>
                  <span className="column-count-badge" style={{ backgroundColor: col.bgVar, color: col.colorVar }}>
                    {columnTasks.length}
                  </span>
                </div>
                <button
                  type="button"
                  className="column-add-btn"
                  onClick={() => onOpenCreateWithStatus(col.id)}
                  title={`Add task to ${col.title}`}
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Tasks List */}
              <div className="kanban-tasks-list">
                {columnTasks.length === 0 ? (
                  <div className="kanban-empty-state">
                    <p className="empty-state-text">No tasks here</p>
                    <button
                      type="button"
                      className="empty-add-btn"
                      onClick={() => onOpenCreateWithStatus(col.id)}
                    >
                      + Add a task
                    </button>
                  </div>
                ) : (
                  columnTasks.map((task) => {
                    const completedSubtasks = task.subtasks.filter((st) => st.completed).length;
                    const totalSubtasks = task.subtasks.length;
                    const overdue = isOverdue(task.due_date, task.status);

                    return (
                      <div
                        key={task.id}
                        className={`kanban-task-card glass-panel glass-panel-hover ${
                          task.status === 'completed' ? 'task-is-completed' : ''
                        } ${draggedTaskId === task.id ? 'is-dragging' : ''}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                      >
                        {/* Top tags row */}
                        <div className="card-top-row">
                          <div className="card-tags-left">
                            <span className={`priority-badge badge-${task.priority}`}>
                              {task.priority}
                            </span>
                            <span className="category-pill">{task.category}</span>
                          </div>
                          <div className="card-actions-right">
                            <button
                              type="button"
                              className={`star-action-btn ${task.is_starred ? 'starred' : ''}`}
                              onClick={() => toggleStar(task.id)}
                              title={task.is_starred ? 'Unstar' : 'Star'}
                            >
                              <Star
                                size={15}
                                fill={task.is_starred ? '#f59e0b' : 'none'}
                                color={task.is_starred ? '#f59e0b' : 'var(--text-muted)'}
                              />
                            </button>
                          </div>
                        </div>

                        {/* Title and quick complete */}
                        <div className="card-title-row">
                          <button
                            type="button"
                            className="card-checkbox-btn"
                            onClick={() => toggleTaskComplete(task.id)}
                            title={task.status === 'completed' ? 'Mark incomplete' : 'Mark completed'}
                          >
                            {task.status === 'completed' ? (
                              <CheckSquare size={17} className="check-done-icon" />
                            ) : (
                              <Square size={17} className="check-todo-icon" />
                            )}
                          </button>
                          <h4 
                            className={`card-task-title ${task.status === 'completed' ? 'line-through' : ''}`}
                            onClick={() => onEditTask(task)}
                          >
                            {task.title}
                          </h4>
                        </div>

                        {/* Description preview */}
                        {task.description && (
                          <p className="card-description-preview" onClick={() => onEditTask(task)}>
                            {task.description}
                          </p>
                        )}

                        {/* Subtasks Progress */}
                        {totalSubtasks > 0 && (
                          <div className="card-subtasks-progress">
                            <div className="subtasks-text-row">
                              <span>Checklist</span>
                              <span>
                                {completedSubtasks}/{totalSubtasks}
                              </span>
                            </div>
                            <div className="card-progress-bar">
                              <div
                                className="card-progress-fill"
                                style={{
                                  width: `${(completedSubtasks / totalSubtasks) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Bottom Row: Due date & Edit/Delete */}
                        <div className="card-footer-row">
                          <div className="card-footer-left">
                            {task.due_date && (
                              <span className={`due-date-pill ${overdue ? 'overdue' : ''}`}>
                                {overdue ? <AlertTriangle size={12} /> : <Calendar size={12} />}
                                <span>{formatDate(task.due_date)}</span>
                              </span>
                            )}
                          </div>

                          <div className="card-footer-right">
                            {/* Move Column dropdown */}
                            <select
                              className="quick-move-select"
                              value={task.status}
                              onChange={(e) => moveTaskStatus(task.id, e.target.value as TaskStatus)}
                              title="Move to column"
                            >
                              {COLUMNS.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.title}
                                </option>
                              ))}
                            </select>

                            <button
                              type="button"
                              className="card-mini-btn"
                              onClick={() => onEditTask(task)}
                              title="Edit task"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              type="button"
                              className="card-mini-btn delete-hover"
                              onClick={() => deleteTask(task.id)}
                              title="Delete task"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
