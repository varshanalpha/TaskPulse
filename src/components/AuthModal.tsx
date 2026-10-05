import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User as UserIcon, 
  LogIn, 
  UserPlus, 
  Sparkles, 
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { signIn, signUp, enterDemoMode } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please fill in both email and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { error, data } = await signUp(email, password, fullName);
        if (error) {
          setErrorMessage(error.message);
        } else {
          if (data?.session) {
            setSuccessMessage('Account created and signed in successfully!');
            setTimeout(onClose, 800);
          } else {
            setSuccessMessage('Account created! Please check your email to confirm registration or sign in directly.');
          }
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          setErrorMessage(error.message);
        } else {
          setSuccessMessage('Signed in successfully!');
          setTimeout(onClose, 600);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestDemo = () => {
    enterDemoMode();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-container auth-modal-container glass-panel animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="auth-header-title">
            <h2 className="modal-title">
              {isSignUp ? 'Create Supabase Account' : 'Welcome to TaskPulse'}
            </h2>
            <p className="auth-header-desc">
              {isSignUp 
                ? 'Sign up with email to isolate and sync your personal tasks.' 
                : 'Sign in to access your Supabase cloud tasks.'}
            </p>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="auth-tab-switch">
          <button
            type="button"
            className={`auth-tab-btn ${!isSignUp ? 'active' : ''}`}
            onClick={() => {
              setIsSignUp(false);
              setErrorMessage('');
              setSuccessMessage('');
            }}
          >
            <LogIn size={16} />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${isSignUp ? 'active' : ''}`}
            onClick={() => {
              setIsSignUp(true);
              setErrorMessage('');
              setSuccessMessage('');
            }}
          >
            <UserPlus size={16} />
            <span>Sign Up</span>
          </button>
        </div>

        {/* Alerts */}
        {errorMessage && (
          <div className="form-alert-error">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="form-alert-success">
            <CheckCircle2 size={16} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {isSignUp && (
            <div className="form-group">
              <label className="form-label" htmlFor="full-name">
                Full Name
              </label>
              <div className="input-with-icon">
                <UserIcon size={16} className="input-icon" />
                <input
                  id="full-name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Varshan"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="auth-email">
              Email Address <span className="required-star">*</span>
            </label>
            <div className="input-with-icon">
              <Mail size={16} className="input-icon" />
              <input
                id="auth-email"
                type="email"
                className="form-input"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="auth-password">
              Password <span className="required-star">*</span>
            </label>
            <div className="input-with-icon">
              <Lock size={16} className="input-icon" />
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary auth-submit-btn"
            disabled={loading}
          >
            {loading ? 'Processing...' : isSignUp ? 'Create Supabase Account' : 'Sign In with Supabase'}
          </button>
        </form>

        {/* Guest / Demo Mode Quick Access */}
        <div className="auth-divider">
          <span>OR</span>
        </div>

        <button
          type="button"
          className="btn-guest-mode"
          onClick={handleGuestDemo}
        >
          <Sparkles size={16} className="sparkle-icon" />
          <span>Continue as Guest (Instant Demo Mode)</span>
        </button>
      </div>
    </div>
  );
};
