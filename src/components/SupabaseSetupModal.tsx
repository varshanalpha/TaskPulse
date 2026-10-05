import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Copy, 
  Check, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  Code2,
  Sparkles
} from 'lucide-react';
import { supabase, SUPABASE_PROJECT_URL, SUPABASE_SQL_URL } from '../lib/supabase';
import { useTasks } from '../context/TaskContext';

interface SupabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SQL_SCHEMA = `-- 1. Create tasks table in Supabase
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('backlog', 'todo', 'in_progress', 'review', 'completed')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    category TEXT DEFAULT 'Work',
    due_date TIMESTAMPTZ,
    subtasks JSONB DEFAULT '[]'::jsonb,
    is_starred BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Indexes for high performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
CREATE POLICY "Users can view their tasks" ON public.tasks
  FOR SELECT TO authenticated, anon USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR user_id IS NULL
  );

CREATE POLICY "Users can create tasks" ON public.tasks
  FOR INSERT TO authenticated, anon WITH CHECK (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR user_id IS NULL
  );

CREATE POLICY "Users can update their tasks" ON public.tasks
  FOR UPDATE TO authenticated, anon USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR user_id IS NULL
  );

CREATE POLICY "Users can delete their tasks" ON public.tasks
  FOR DELETE TO authenticated, anon USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR user_id IS NULL
  );

-- 5. Enable Realtime updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;`;

export const SupabaseSetupModal: React.FC<SupabaseSetupModalProps> = ({ isOpen, onClose }) => {
  const { dbSchemaMissing, isUsingLocalStorage, refreshTasks } = useTasks();
  const [copied, setCopied] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const { error } = await supabase.from('tasks').select('id').limit(1);
      if (error) {
        if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
          setTestResult({
            success: false,
            message: "Table 'public.tasks' still not found. Please paste and run the SQL below in the Supabase SQL editor.",
          });
        } else {
          setTestResult({
            success: false,
            message: `Supabase error: ${error.message}`,
          });
        }
      } else {
        setTestResult({
          success: true,
          message: 'Success! The public.tasks table is active and verified.',
        });
        await refreshTasks();
      }
    } catch (e: any) {
      setTestResult({
        success: false,
        message: e.message || 'Failed to connect to Supabase.',
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-container setup-modal-container glass-panel animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="setup-header-left">
            <div className="setup-badge-icon">
              <Database size={22} className="text-primary" />
            </div>
            <div>
              <h2 className="modal-title">Supabase Database Integration</h2>
              <p className="setup-header-desc">
                Project URL: <code className="code-pill">{SUPABASE_PROJECT_URL}</code>
              </p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Current Status Pill */}
        <div className={`status-callout ${dbSchemaMissing || isUsingLocalStorage ? 'callout-warning' : 'callout-success'}`}>
          {dbSchemaMissing || isUsingLocalStorage ? (
            <>
              <AlertTriangle size={20} className="callout-icon-warning" />
              <div>
                <strong>SQL Migration Pending:</strong> The Supabase project is connected, but the <code>tasks</code> table hasn't been created in Supabase yet.
                The app is currently using <strong>Local Storage Demo Mode</strong> so you can test all features immediately!
              </div>
            </>
          ) : (
            <>
              <CheckCircle2 size={20} className="callout-icon-success" />
              <div>
                <strong>Supabase Live & Synchronized:</strong> The <code>public.tasks</code> table is live with real-time updates and RLS security active.
              </div>
            </>
          )}
        </div>

        {/* Test Result Message */}
        {testResult && (
          <div className={`test-result-banner ${testResult.success ? 'test-success' : 'test-failure'}`}>
            {testResult.success ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            <span>{testResult.message}</span>
          </div>
        )}

        {/* 3-Step Setup Instructions */}
        <div className="setup-steps-section">
          <h3 className="setup-section-title">
            <Sparkles size={16} />
            <span>Enable Live Supabase DB in 30 Seconds</span>
          </h3>

          <div className="steps-flow">
            <div className="step-card">
              <span className="step-num">1</span>
              <div className="step-body">
                <h4>Open Supabase SQL Editor</h4>
                <p>Click below to open your project's new SQL query tab.</p>
                <a 
                  href={SUPABASE_SQL_URL} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="open-sql-link"
                >
                  <span>Open SQL Editor</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>

            <div className="step-card">
              <span className="step-num">2</span>
              <div className="step-body">
                <h4>Copy & Run Migration SQL</h4>
                <p>Paste the SQL query below and click the green <strong>"Run"</strong> button in Supabase.</p>
                <button 
                  type="button" 
                  className="copy-sql-btn"
                  onClick={handleCopy}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy SQL Schema'}</span>
                </button>
              </div>
            </div>

            <div className="step-card">
              <span className="step-num">3</span>
              <div className="step-body">
                <h4>Verify Connection</h4>
                <p>Click "Test & Sync" to switch from local mode to live database sync.</p>
                <button
                  type="button"
                  className="btn-primary test-btn"
                  onClick={handleTestConnection}
                  disabled={testing}
                >
                  <RefreshCw size={14} className={testing ? 'animate-spin' : ''} />
                  <span>{testing ? 'Testing...' : 'Test & Sync Connection'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Code Snippet Viewer */}
        <div className="sql-code-viewer">
          <div className="code-viewer-header">
            <div className="code-title">
              <Code2 size={15} />
              <span>supabase_schema.sql</span>
            </div>
            <button type="button" className="code-copy-btn" onClick={handleCopy}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="code-block">
            <code>{SQL_SCHEMA}</code>
          </pre>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Continue in Current Mode
          </button>
        </div>
      </div>
    </div>
  );
};
