import React from 'react';
import { ArrowRight, X, AlertTriangle } from 'lucide-react';
import { useTasks } from '../context/TaskContext';

interface SupabaseSetupBannerProps {
  onOpenSetupModal: () => void;
}

export const SupabaseSetupBanner: React.FC<SupabaseSetupBannerProps> = ({ onOpenSetupModal }) => {
  const { dbSchemaMissing, dismissSchemaAlert } = useTasks();

  if (!dbSchemaMissing) return null;

  return (
    <div className="setup-banner animate-fade-in">
      <div className="banner-content">
        <div className="banner-left">
          <span className="banner-badge">
            <AlertTriangle size={14} />
            <span>Supabase Setup</span>
          </span>
          <p className="banner-text">
            <strong>Table `public.tasks` is pending setup in Supabase.</strong> You are currently using full-featured Local Demo mode. Run the 30-second SQL migration to activate live Supabase cloud sync!
          </p>
        </div>
        <div className="banner-actions">
          <button
            type="button"
            className="banner-cta-btn"
            onClick={onOpenSetupModal}
          >
            <span>View SQL & Sync</span>
            <ArrowRight size={14} />
          </button>
          <button
            type="button"
            className="banner-close-btn"
            onClick={dismissSchemaAlert}
            title="Dismiss notice"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
