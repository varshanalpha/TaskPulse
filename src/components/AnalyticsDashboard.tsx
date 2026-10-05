import React from 'react';
import { 
  CheckCircle2, 
  Layers, 
  Award, 
  Sparkles,
  Zap,
  Target,
  Plus,
  AlertTriangle
} from 'lucide-react';
import type { Task } from '../types';

interface AnalyticsDashboardProps {
  tasks: Task[];
  onOpenCreate: () => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ tasks, onOpenCreate }) => {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
  const todo = tasks.filter((t) => t.status === 'todo').length;
  const backlog = tasks.filter((t) => t.status === 'backlog').length;
  const review = tasks.filter((t) => t.status === 'review').length;

  const urgent = tasks.filter((t) => t.priority === 'urgent').length;
  const high = tasks.filter((t) => t.priority === 'high').length;
  const medium = tasks.filter((t) => t.priority === 'medium').length;
  const low = tasks.filter((t) => t.priority === 'low').length;

  const now = new Date().setHours(0, 0, 0, 0);
  const overdue = tasks.filter((t) => {
    if (!t.due_date || t.status === 'completed') return false;
    return new Date(t.due_date).getTime() < now;
  }).length;

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Productivity score based on completed tasks, on-time completion, and active tasks
  const productivityScore = Math.min(100, Math.round(completionRate * 0.7 + (total > 0 && overdue === 0 ? 30 : 15)));

  // Categories breakdown
  const categoryMap = tasks.reduce<Record<string, number>>((acc, t) => {
    const cat = t.category || 'General';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const categoryList = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);

  return (
    <div className="analytics-container animate-fade-in">
      {/* Top Banner / Welcome */}
      <div className="analytics-hero glass-panel">
        <div className="analytics-hero-left">
          <div className="analytics-badge">
            <Sparkles size={14} />
            <span>Productivity Intelligence</span>
          </div>
          <h2 className="analytics-hero-title">Task Performance & Workflow Health</h2>
          <p className="analytics-hero-subtitle">
            Track completion velocity, identify overdue bottlenecks, and optimize your delivery pipeline.
          </p>
          <div style={{ marginTop: '0.85rem' }}>
            <button
              type="button"
              className="create-task-btn"
              onClick={onOpenCreate}
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Create New Task</span>
            </button>
          </div>
        </div>
        <div className="analytics-score-card">
          <div className="score-ring">
            <span className="score-number">{productivityScore}</span>
            <span className="score-max">/100</span>
          </div>
          <div className="score-label">
            <Award size={16} className="score-icon" />
            <span>Productivity Score</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-cards-grid">
        <div className="kpi-card glass-panel glass-panel-hover">
          <div className="kpi-header">
            <span className="kpi-title">Total Tasks</span>
            <div className="kpi-icon-wrap bg-blue-subtle">
              <Layers size={18} className="text-blue" />
            </div>
          </div>
          <div className="kpi-value">{total}</div>
          <div className="kpi-footnote">Active backlog & board items</div>
        </div>

        <div className="kpi-card glass-panel glass-panel-hover">
          <div className="kpi-header">
            <span className="kpi-title">Completed</span>
            <div className="kpi-icon-wrap bg-emerald-subtle">
              <CheckCircle2 size={18} className="text-emerald" />
            </div>
          </div>
          <div className="kpi-value text-emerald">{completed}</div>
          <div className="kpi-footnote">{completionRate}% total completion rate</div>
        </div>

        <div className="kpi-card glass-panel glass-panel-hover">
          <div className="kpi-header">
            <span className="kpi-title">In Progress</span>
            <div className="kpi-icon-wrap bg-purple-subtle">
              <Zap size={18} className="text-purple" />
            </div>
          </div>
          <div className="kpi-value text-purple">{inProgress}</div>
          <div className="kpi-footnote">Currently being executed</div>
        </div>

        <div className="kpi-card glass-panel glass-panel-hover">
          <div className="kpi-header">
            <span className="kpi-title">Overdue Alerts</span>
            <div className="kpi-icon-wrap bg-rose-subtle">
              <AlertTriangle size={18} className="text-rose" />
            </div>
          </div>
          <div className={`kpi-value ${overdue > 0 ? 'text-rose' : 'text-emerald'}`}>
            {overdue}
          </div>
          <div className="kpi-footnote">
            {overdue > 0 ? 'Requires immediate attention' : 'All deadlines are on track!'}
          </div>
        </div>
      </div>

      {/* Visual Charts / Breakdown Grid */}
      <div className="analytics-details-grid">
        {/* Status Distribution */}
        <div className="analytics-panel glass-panel">
          <h3 className="panel-title">
            <Target size={18} />
            <span>Workflow Status Distribution</span>
          </h3>

          <div className="status-bars-container">
            {[
              { label: 'Completed', count: completed, color: 'var(--status-completed)', bg: 'var(--status-completed-bg)' },
              { label: 'In Progress', count: inProgress, color: 'var(--status-in_progress)', bg: 'var(--status-in_progress-bg)' },
              { label: 'In Review', count: review, color: 'var(--status-review)', bg: 'var(--status-review-bg)' },
              { label: 'To Do', count: todo, color: 'var(--status-todo)', bg: 'var(--status-todo-bg)' },
              { label: 'Backlog', count: backlog, color: 'var(--status-backlog)', bg: 'var(--status-backlog-bg)' },
            ].map((item) => {
              const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
              return (
                <div key={item.label} className="status-bar-row">
                  <div className="status-bar-meta">
                    <span className="bar-label">{item.label}</span>
                    <span className="bar-counts">
                      <strong>{item.count}</strong> ({pct}%)
                    </span>
                  </div>
                  <div className="bar-track">
                    <div 
                      className="bar-fill" 
                      style={{ width: `${pct}%`, backgroundColor: item.color }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="analytics-panel glass-panel">
          <h3 className="panel-title">
            <AlertTriangle size={18} />
            <span>Priority Breakdown</span>
          </h3>

          <div className="priority-bars-container">
            {[
              { label: 'Urgent', count: urgent, color: 'var(--priority-urgent)' },
              { label: 'High', count: high, color: 'var(--priority-high)' },
              { label: 'Medium', count: medium, color: 'var(--priority-medium)' },
              { label: 'Low', count: low, color: 'var(--priority-low)' },
            ].map((p) => {
              const pct = total > 0 ? Math.round((p.count / total) * 100) : 0;
              return (
                <div key={p.label} className="status-bar-row">
                  <div className="status-bar-meta">
                    <span className="bar-label">{p.label} Priority</span>
                    <span className="bar-counts">
                      <strong>{p.count}</strong> ({pct}%)
                    </span>
                  </div>
                  <div className="bar-track">
                    <div 
                      className="bar-fill" 
                      style={{ width: `${pct}%`, backgroundColor: p.color }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="analytics-panel glass-panel full-width-panel">
          <h3 className="panel-title">
            <Layers size={18} />
            <span>Categories Distribution</span>
          </h3>

          <div className="category-tags-grid">
            {categoryList.map(([cat, count]) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={cat} className="category-metric-card">
                  <div className="cat-name">{cat}</div>
                  <div className="cat-stat">
                    <span className="cat-count">{count}</span>
                    <span className="cat-percent">{pct}%</span>
                  </div>
                  <div className="cat-bar">
                    <div className="cat-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
