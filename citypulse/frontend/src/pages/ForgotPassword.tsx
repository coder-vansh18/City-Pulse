import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { authClient } from '../api/authClient';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [demoToken, setDemoToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await authClient.forgotPassword(email.trim());
      setMessage(res.message);
      if (res.demo_token) {
        setDemoToken(res.demo_token);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit password reset request.');
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
            Reset Password
          </h1>
          <p className="text-xs text-muted mt-1 leading-relaxed">
            Enter your operator email address and we'll dispatch a secure password reset link.
          </p>
        </div>

        {/* Success Notice */}
        {message && (
          <div className="mb-5 p-4 rounded-2xl bg-status-calm/10 border border-status-calm/30 text-status-calm text-xs space-y-2 animate-in fade-in">
            <div className="flex items-center gap-2 font-bold font-heading">
              <CheckCircle2 className="w-4 h-4" />
              <span>Reset Link Dispatched</span>
            </div>
            <p className="leading-relaxed font-sans">{message}</p>

            {demoToken && (
              <div className="mt-3 pt-3 border-t border-status-calm/20">
                <span className="text-[10px] uppercase font-mono block text-muted">
                  Demo Quick Link:
                </span>
                <Link
                  to={`/reset-password/${demoToken}`}
                  className="text-accent hover:underline font-mono font-bold text-[11px] break-all"
                >
                  Proceed to Reset Password Page →
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Error Notice */}
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!message && (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-xs font-bold text-text font-heading mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@citypulse.gov"
                  autoComplete="email"
                  className="w-full bg-surface-2/60 focus:bg-surface border border-border focus:border-accent rounded-xl pl-10 pr-4 py-2.5 text-xs text-text placeholder:text-muted/60 focus:outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-accent text-white hover:bg-accent-hover font-heading font-bold text-xs shadow-md shadow-accent/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  <span>Sending Link...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="pt-5 border-t border-border mt-6 text-center text-xs text-muted">
          <Link
            to="/login"
            className="text-muted hover:text-text font-heading font-semibold inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
