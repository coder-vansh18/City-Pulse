import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { authClient } from '../api/authClient';

export const ResetPassword: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Password rules validation
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Invalid reset token.');
      return;
    }

    if (!isPasswordValid) {
      setError('Please fulfill all password security requirements.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await authClient.resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md bg-surface border border-border rounded-3xl shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-10 h-10 rounded-2xl bg-accent flex items-center justify-center text-white mx-auto mb-3 shadow-md shadow-accent/20">
            <Activity className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-text font-heading tracking-tight">
            Create New Password
          </h1>
          <p className="text-xs text-muted mt-1 leading-relaxed">
            Enter a strong new password for your CityPulse operator account.
          </p>
        </div>

        {/* Success Notice */}
        {success && (
          <div className="mb-5 p-4 rounded-2xl bg-status-calm/10 border border-status-calm/30 text-status-calm text-xs space-y-2 animate-in fade-in text-center">
            <CheckCircle2 className="w-6 h-6 mx-auto text-status-calm" />
            <div className="font-bold font-heading text-sm">Password Updated!</div>
            <p className="font-sans">
              Redirecting you to the sign in page in a moment...
            </p>
          </div>
        )}

        {/* Error Notice */}
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* New Password */}
            <div>
              <label className="block text-xs font-bold text-text font-heading mb-1.5 uppercase tracking-wider">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="new-password"
                  className="w-full bg-surface-2/60 focus:bg-surface border border-border focus:border-accent rounded-xl pl-10 pr-10 py-2.5 text-xs text-text placeholder:text-muted/60 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-muted hover:text-text absolute right-3 top-1/2 -translate-y-1/2 transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Checklist */}
            <div className="p-3 rounded-xl bg-surface-2/40 border border-border/60 space-y-1 text-[11px] font-mono">
              <span className="text-[10px] text-muted font-heading font-bold uppercase block mb-1">
                Password Requirements:
              </span>
              <div className="grid grid-cols-2 gap-1">
                <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-status-calm' : 'text-muted'}`}>
                  <CheckCircle2 className="w-3 h-3" />
                  <span>8+ Characters</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasUppercase ? 'text-status-calm' : 'text-muted'}`}>
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Uppercase (A-Z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasLowercase ? 'text-status-calm' : 'text-muted'}`}>
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Lowercase (a-z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-status-calm' : 'text-muted'}`}>
                  <CheckCircle2 className="w-3 h-3" />
                  <span>One Number (0-9)</span>
                </div>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-text font-heading mb-1.5 uppercase tracking-wider">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="new-password"
                  className="w-full bg-surface-2/60 focus:bg-surface border border-border focus:border-accent rounded-xl pl-10 pr-4 py-2.5 text-xs text-text placeholder:text-muted/60 focus:outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-accent text-white hover:bg-accent-hover font-heading font-bold text-xs shadow-md shadow-accent/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-4"
            >
              {isLoading ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <span>Reset Password</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="pt-5 border-t border-border mt-6 text-center text-xs text-muted">
          <Link to="/login" className="text-accent font-heading font-semibold hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
