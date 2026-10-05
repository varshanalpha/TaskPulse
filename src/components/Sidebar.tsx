import React from 'react';
import { 
  Inbox, 
  Calendar, 
  Star, 
  CheckCircle, 
  Tag, 
  Layers, 
  TrendingUp,
  Database,
  ExternalLink,
  PlusCircle
} from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import type { FilterState, TaskPriority } from '../types';

interface SidebarProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onOpenCreateModal: () => void;
  onOpenSetupModal: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  filters,
  onFilterChange,
  onOpenCreateModal,
  onOpenSetupModal,
  mobileOpen,
  onCloseMobile,
}) => {
  const { tasks, dbSchemaMissing } = useTasks();

  // Compute live statistics for filters
  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const starredCount = tasks.filter((t) => t.is_starred).length;

  const todayStr = new Date().toISOString().split('T')[0];
  const dueTodayCount = tasks.filter((t) => {
    if (!t.due_date || t.status === 'completed') return false;
    return t.due_date.startsWith(todayStr);
  }).length;

  // Categories list
  const categories = ['Work', 'Frontend', 'Backend', 'Design', 'DevOps', 'QA', 'Personal'];
  const getCategoryCount = (cat: string) => tasks.filter((t) => t.category === cat).length;

  const priorities: { label: string; value: TaskPriority; color: string }[] = [
    { label: 'Urgent', value: 'urgent', color: 'var(--priority-urgent)' },
    { label: 'High', value: 'high', color: 'var(--priority-high)' },
    { label: 'Medium', value: 'medium', color: 'var(--priority-medium)' },
    { label: 'Low', value: 'low', color: 'var(--priority-low)' },
  ];

  const completionPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleNavClick = (updates: Partial<FilterState>) => {
    onFilterChange(updates);
    if (window.innerWidth <= 768) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div className="sidebar-backdrop" onClick={onCloseMobile} />
      )}

      <aside className={`sidebar-container ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-content">
          {/* Quick task action button */}
          <div className="sidebar-top-action">
            <button 
              type="button" 
              className="sidebar-add-btn"
              onClick={onOpenCreateModal}
            >
              <PlusCircle size={18} />
              <span>Create New Task</span>
            </button>
          </div>

          {/* Quick Nav Filters */}
          <div className="sidebar-section">
            <div className="sidebar-section-title">Navigation</div>
            <nav className="sidebar-menu">
              <button
                type="button"
                className={`sidebar-nav-item ${
                  !filters.onlyStarred && !filters.onlyDueToday && filters.status === 'all' && filters.category === 'all' && filters.priority === 'all'
                    ? 'active'
                    : ''
                }`}
                onClick={() =>
                  handleNavClick({
                    onlyStarred: false,
                    onlyDueToday: false,
                    status: 'all',
                    category: 'all',
                    priority: 'all',
                  })
                }
              >
                <div className="nav-item-left">
                  <Inbox size={17} className="nav-icon" />
                  <span>All Tasks</span>
                </div>
                <span className="nav-badge">{totalCount}</span>
              </button>

              <button
                type="button"
                className={`sidebar-nav-item ${filters.onlyDueToday ? 'active' : ''}`}
                onClick={() =>
                  handleNavClick({
                    onlyDueToday: !filters.onlyDueToday,
                    onlyStarred: false,
                  })
                }
              >
                <div className="nav-item-left">
                  <Calendar size={17} className="nav-icon due-icon" />
                  <span>Due Today</span>
                </div>
                {dueTodayCount > 0 && (
                  <span className="nav-badge badge-warning">{dueTodayCount}</span>
                )}
              </button>

              <button
                type="button"
                className={`sidebar-nav-item ${filters.onlyStarred ? 'active' : ''}`}
                onClick={() =>
                  handleNavClick({
                    onlyStarred: !filters.onlyStarred,
                    onlyDueToday: false,
                  })
                }
              >
                <div className="nav-item-left">
                  <Star size={17} className="nav-icon star-icon" />
                  <span>Starred</span>
                </div>
                <span className="nav-badge">{starredCount}</span>
              </button>

              <button
                type="button"
                className={`sidebar-nav-item ${filters.status === 'completed' ? 'active' : ''}`}
                onClick={() =>
                  handleNavClick({
                    status: filters.status === 'completed' ? 'all' : 'completed',
                  })
                }
              >
                <div className="nav-item-left">
                  <CheckCircle size={17} className="nav-icon done-icon" />
                  <span>Completed</span>
                </div>
                <span className="nav-badge">{completedCount}</span>
              </button>
            </nav>
          </div>

          {/* Categories Filter */}
          <div className="sidebar-section">
            <div className="sidebar-section-title">Categories</div>
            <div className="sidebar-menu">
              <button
                type="button"
                className={`sidebar-nav-item ${filters.category === 'all' ? 'active' : ''}`}
                onClick={() => handleNavClick({ category: 'all' })}
              >
                <div className="nav-item-left">
                  <Layers size={15} className="nav-icon" />
                  <span>All Categories</span>
                </div>
              </button>

              {categories.map((cat) => {
                const count = getCategoryCount(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    className={`sidebar-nav-item ${filters.category === cat ? 'active' : ''}`}
                    onClick={() =>
                      handleNavClick({
                        category: filters.category === cat ? 'all' : cat,
                      })
                    }
                  >
                    <div className="nav-item-left">
                      <Tag size={15} className="nav-icon" />
                      <span>{cat}</span>
                    </div>
                    {count > 0 && <span className="nav-badge">{count}</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority Filters */}
          <div className="sidebar-section">
            <div className="sidebar-section-title">Priority</div>
            <div className="priority-pills-row">
              {priorities.map((p) => {
                const count = tasks.filter((t) => t.priority === p.value).length;
                const isSelected = filters.priority === p.value;
                return (
                  <button
                    key={p.value}
                    type="button"
                    className={`priority-pill-btn ${isSelected ? 'active' : ''}`}
                    onClick={() =>
                      handleNavClick({
                        priority: isSelected ? 'all' : p.value,
                      })
                    }
                  >
                    <span
                      className="priority-dot"
                      style={{ backgroundColor: p.color }}
                    />
                    <span>{p.label}</span>
                    <span className="priority-pill-count">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mini Completion Progress Widget */}
          <div className="sidebar-progress-card glass-panel">
            <div className="progress-card-header">
              <div className="progress-title-row">
                <TrendingUp size={16} className="progress-icon" />
                <span className="progress-card-title">Completion Rate</span>
              </div>
              <span className="progress-percent-val">{completionPercent}%</span>
            </div>
            <div className="progress-bar-track">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            <div className="progress-subtext">
              {completedCount} of {totalCount} tasks completed
            </div>
          </div>

          {/* Supabase Status / Help Card */}
          <div className="sidebar-supabase-card">
            <div className="sb-card-top">
              <Database size={16} className="sb-card-icon" />
              <span className="sb-card-heading">Supabase Project</span>
            </div>
            <p className="sb-card-desc">
              Connected to Supabase PostgreSQL with real-time sync.
            </p>
            <button
              type="button"
              className="sb-setup-link-btn"
              onClick={onOpenSetupModal}
            >
              <span>{dbSchemaMissing ? '⚠️ Run SQL Migration' : 'View DB Details'}</span>
              <ExternalLink size={13} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
