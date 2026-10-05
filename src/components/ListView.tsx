import React, { useState } from 'react';
import { 
  CheckSquare, 
  Square, 
  Star, 
  Calendar, 
  AlertTriangle, 
  ChevronDown, 
  ChevronRight, 
  Edit3, 
  Trash2, 
  CheckCircle2,
  ArrowUpDown
} from 'lucide-react';
import type { Task, TaskPriority, TaskStatus, FilterState } from '../types';
import { useTasks } from '../context/TaskContext';

interface ListViewProps {
  tasks: Task[];
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onEditTask: (task: Task) => void;
  onOpenCreate: () => void;
}

export const ListView: React.FC<ListViewProps> = ({
  tasks,
  filters,
  onFilterChange,
  onEditTask,
  onOpenCreate,
}) => {
  const { deleteTask, toggleTaskComplete, toggleSubtask, toggleStar, moveTaskStatus, updateTask } = useTasks();
  const [expandedTaskIds, setExpandedTaskIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedTaskIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSort = (field: 'title' | 'status' | 'priority' | 'due_date') => {
    if (filters.sortBy === field) {
      onFilterChange({ sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' });
    } else {
      onFilterChange({ sortBy: field, sortOrder: 'asc' });
    }
  };

  const isOverdue = (dueDateStr?: string | null, status?: TaskStatus) => {
    if (!dueDateStr || status === 'completed') return false;
    return new Date(dueDateStr).getTime() < new Date().setHours(0, 0, 0, 0);
  };

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return 'No due date';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="list-view-container glass-panel">
      {/* Table Header */}
      <div className="list-table-header">
        <div className="col-checkbox">#</div>
        <div 
          className="col-title sortable" 
          onClick={() => handleSort('title')}
        >
          <span>Task Title</span>
          <ArrowUpDown size={14} className="sort-icon" />
        </div>
        <div 
          className="col-status sortable"
          onClick={() => handleSort('status')}
        >
          <span>Status</span>
          <ArrowUpDown size={14} className="sort-icon" />
        </div>
        <div 
          className="col-priority sortable"
          onClick={() => handleSort('priority')}
        >
          <span>Priority</span>
          <ArrowUpDown size={14} className="sort-icon" />
        </div>
        <div className="col-category">Category</div>
        <div 
          className="col-due sortable"
          onClick={() => handleSort('due_date')}
        >
          <span>Due Date</span>
          <ArrowUpDown size={14} className="sort-icon" />
        </div>
        <div className="col-actions">Actions</div>
      </div>

      {/* Rows */}
      <div className="list-table-body">
        {tasks.length === 0 ? (
          <div className="list-empty-state">
            <div className="empty-icon-wrap">
              <CheckCircle2 size={36} className="empty-icon-svg" />
            </div>
            <h3>No tasks match your filters</h3>
            <p>Try adjusting your search criteria or add a new task.</p>
            <button
              type="button"
              className="btn-primary"
              onClick={onOpenCreate}
            >
              + Create New Task
            </button>
          </div>
        ) : (
          tasks.map((task) => {
            const hasSubtasks = task.subtasks && task.subtasks.length > 0;
            const isExpanded = !!expandedTaskIds[task.id];
            const overdue = isOverdue(task.due_date, task.status);
            const completedCount = (task.subtasks || []).filter((s) => s.completed).length;

            return (
              <React.Fragment key={task.id}>
                <div 
                  className={`list-row ${task.status === 'completed' ? 'row-completed' : ''} ${
                    isExpanded ? 'row-expanded' : ''
                  }`}
                >
                  {/* Checkbox & Star */}
                  <div className="col-checkbox cell-center">
                    <button
                      type="button"
                      className="table-check-btn"
                      onClick={() => toggleTaskComplete(task.id)}
                      title={task.status === 'completed' ? 'Mark incomplete' : 'Mark complete'}
                    >
                      {task.status === 'completed' ? (
                        <CheckSquare size={17} className="check-done-icon" />
                      ) : (
                        <Square size={17} className="check-todo-icon" />
                      )}
                    </button>
                    <button
                      type="button"
                      className={`table-star-btn ${task.is_starred ? 'starred' : ''}`}
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

                  {/* Title & Description & Subtask toggle */}
                  <div className="col-title">
                    <div className="title-text-group">
                      <div className="title-top-line">
                        {hasSubtasks && (
                          <button
                            type="button"
                            className="expand-subtasks-toggle"
                            onClick={() => toggleExpand(task.id)}
                            title="Toggle subtasks checklist"
                          >
                            {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                          </button>
                        )}
                        <span 
                          className={`task-row-title ${task.status === 'completed' ? 'line-through' : ''}`}
                          onClick={() => onEditTask(task)}
                        >
                          {task.title}
                        </span>
                      </div>
                      {task.description && (
                        <p className="task-row-desc" onClick={() => onEditTask(task)}>
                          {task.description}
                        </p>
                      )}
                      {hasSubtasks && (
                        <span className="subtasks-badge-inline" onClick={() => toggleExpand(task.id)}>
                          {completedCount}/{task.subtasks.length} checklist items
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status Dropdown */}
                  <div className="col-status">
                    <select
                      className={`status-select-pill status-${task.status}`}
                      value={task.status}
                      onChange={(e) => moveTaskStatus(task.id, e.target.value as TaskStatus)}
                    >
                      <option value="backlog">Backlog</option>
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="review">In Review</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  {/* Priority Dropdown */}
                  <div className="col-priority">
                    <select
                      className={`priority-select-pill priority-${task.priority}`}
                      value={task.priority}
                      onChange={(e) => updateTask(task.id, { priority: e.target.value as TaskPriority })}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  {/* Category */}
                  <div className="col-category">
                    <span className="category-pill-table">{task.category || 'General'}</span>
                  </div>

                  {/* Due Date */}
                  <div className="col-due">
                    <span className={`due-date-pill-table ${overdue ? 'overdue' : ''}`}>
                      {overdue ? <AlertTriangle size={13} /> : <Calendar size={13} />}
                      <span>{formatDate(task.due_date)}</span>
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="col-actions">
                    <div className="action-buttons-group">
                      <button
                        type="button"
                        className="table-action-icon-btn"
                        onClick={() => onEditTask(task)}
                        title="Edit task"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        type="button"
                        className="table-action-icon-btn delete-hover"
                        onClick={() => deleteTask(task.id)}
                        title="Delete task"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Subtasks Row */}
                {isExpanded && hasSubtasks && (
                  <div className="subtasks-expanded-row">
                    <div className="subtasks-expanded-container">
                      <div className="subtasks-expanded-title">Checklist items:</div>
                      <div className="subtasks-expanded-grid">
                        {task.subtasks.map((st) => (
                          <div key={st.id} className="subtask-expanded-item">
                            <button
                              type="button"
                              className="subtask-mini-check"
                              onClick={() => toggleSubtask(task.id, st.id)}
                            >
                              {st.completed ? (
                                <CheckSquare size={15} className="checked-icon" />
                              ) : (
                                <Square size={15} className="unchecked-icon" />
                              )}
                            </button>
                            <span className={st.completed ? 'completed' : ''}>
                              {st.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })
        )}
      </div>
    </div>
  );
};
