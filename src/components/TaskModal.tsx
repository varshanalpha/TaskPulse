import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckSquare, 
  Square, 
  Plus, 
  Trash2, 
  AlertCircle,
  Star
} from 'lucide-react';
import type { Task, TaskFormData, TaskStatus, TaskPriority, Subtask } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TaskFormData) => Promise<boolean>;
  initialTask?: Task | null;
  defaultStatus?: TaskStatus;
}

const CATEGORY_OPTIONS = ['Work', 'Frontend', 'Backend', 'Design', 'DevOps', 'QA', 'Personal', 'General'];

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTask,
  defaultStatus = 'todo',
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [category, setCategory] = useState('Work');
  const [dueDate, setDueDate] = useState('');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskInput, setNewSubtaskInput] = useState('');
  const [isStarred, setIsStarred] = useState(false);
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description || '');
      setStatus(initialTask.status);
      setPriority(initialTask.priority);
      setCategory(initialTask.category || 'Work');
      setDueDate(initialTask.due_date ? initialTask.due_date.split('T')[0] : '');
      setSubtasks(initialTask.subtasks || []);
      setIsStarred(!!initialTask.is_starred);
    } else {
      setTitle('');
      setDescription('');
      setStatus(defaultStatus);
      setPriority('medium');
      setCategory('Work');
      setDueDate('');
      setSubtasks([]);
      setIsStarred(false);
    }
    setValidationError('');
    setNewSubtaskInput('');
  }, [initialTask, defaultStatus, isOpen]);

  if (!isOpen) return null;

  const handleAddSubtask = () => {
    if (!newSubtaskInput.trim()) return;
    const newSt: Subtask = {
      id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: newSubtaskInput.trim(),
      completed: false,
    };
    setSubtasks((prev) => [...prev, newSt]);
    setNewSubtaskInput('');
  };

  const handleToggleSubtask = (id: string) => {
    setSubtasks((prev) =>
      prev.map((st) => (st.id === id ? { ...st, completed: !st.completed } : st))
    );
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks((prev) => prev.filter((st) => st.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setValidationError('Please enter a task title');
      return;
    }

    setSaving(true);
    const formData: TaskFormData = {
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      category,
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
      subtasks,
      is_starred: isStarred,
    };

    const success = await onSave(formData);
    setSaving(false);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-container glass-panel animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-left">
            <h2 className="modal-title">
              {initialTask ? 'Edit Task' : 'Create New Task'}
            </h2>
            <button
              type="button"
              className={`modal-star-btn ${isStarred ? 'starred' : ''}`}
              onClick={() => setIsStarred(!isStarred)}
              title={isStarred ? 'Unstar task' : 'Star task'}
            >
              <Star size={18} fill={isStarred ? '#f59e0b' : 'none'} color={isStarred ? '#f59e0b' : 'currentColor'} />
            </button>
          </div>
          <button 
            type="button" 
            className="modal-close-btn" 
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="modal-form">
          {validationError && (
            <div className="form-alert-error">
              <AlertCircle size={16} />
              <span>{validationError}</span>
            </div>
          )}

          {/* Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="task-title">
              Task Title <span className="required-star">*</span>
            </label>
            <input
              id="task-title"
              type="text"
              className="form-input"
              placeholder="e.g., Integrate Supabase Realtime channel"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (validationError) setValidationError('');
              }}
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="task-description">
              Description / Notes
            </label>
            <textarea
              id="task-description"
              className="form-textarea"
              rows={3}
              placeholder="Provide background context, criteria, or API links..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Grid row: Status & Priority */}
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">
                Status
              </label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
              >
                <option value="backlog">📋 Backlog</option>
                <option value="todo">🎯 To Do</option>
                <option value="in_progress">⚡ In Progress</option>
                <option value="review">🔍 In Review</option>
                <option value="completed">✅ Completed</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Priority
              </label>
              <select
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
              >
                <option value="low">🟢 Low</option>
                <option value="medium">🔵 Medium</option>
                <option value="high">🟠 High</option>
                <option value="urgent">🔴 Urgent</option>
              </select>
            </div>
          </div>

          {/* Grid row: Category & Due Date */}
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">
                Category
              </label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="task-due-date">
                Due Date
              </label>
              <input
                id="task-due-date"
                type="date"
                className="form-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          {/* Checklist / Subtasks */}
          <div className="form-group">
            <div className="subtasks-header-row">
              <label className="form-label">
                Subtasks / Checklist ({subtasks.filter((st) => st.completed).length}/{subtasks.length})
              </label>
            </div>

            <div className="subtask-add-row">
              <input
                type="text"
                className="form-input subtask-input"
                placeholder="Add subtask and press enter..."
                value={newSubtaskInput}
                onChange={(e) => setNewSubtaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
              />
              <button
                type="button"
                className="btn-secondary add-subtask-btn"
                onClick={handleAddSubtask}
              >
                <Plus size={16} />
                <span>Add</span>
              </button>
            </div>

            {subtasks.length > 0 && (
              <div className="subtasks-list">
                {subtasks.map((st) => (
                  <div key={st.id} className="subtask-item">
                    <button
                      type="button"
                      className="subtask-check-btn"
                      onClick={() => handleToggleSubtask(st.id)}
                    >
                      {st.completed ? (
                        <CheckSquare size={16} className="checked-icon" />
                      ) : (
                        <Square size={16} className="unchecked-icon" />
                      )}
                    </button>
                    <span className={`subtask-title ${st.completed ? 'completed' : ''}`}>
                      {st.title}
                    </span>
                    <button
                      type="button"
                      className="subtask-delete-btn"
                      onClick={() => handleRemoveSubtask(st.id)}
                      title="Remove subtask"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : initialTask ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
