import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Activity,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Radio,
  Cpu,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, demoLogin, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const destination = (location.state as any)?.from?.pathname || '/';

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {};
    const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

    if (!email.trim()) {
      errors.email = 'Email is required.';
    } else if (!emailRegex.test(email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) return;

    const success = await login({ email: email.trim(), password });
    if (success) {
      navigate(destination, { replace: true });
    }
  };

  const handleDemoLogin = async () => {
    clearError();
    setEmail('demo@citypulse.local');
    setPassword('Demo@1234');
    const success = await demoLogin();
    if (success) {
      navigate(destination, { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 animate-in fade-in zoom-in-95 duration-200">
        {/* Left Branding Panel (Desktop) */}
        <div className="hidden lg:flex lg:col-span-5 bg-surface-2/60 border-r border-border p-8 flex-col justify-between relative overflow-hidden">
          <div className="space-y-6 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-accent flex items-center justify-center text-white shadow-md shadow-accent/20">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-text font-heading tracking-tight leading-none">
                  CITYPULSE
                </h1>
                <span className="text-[10px] font-mono font-bold text-accent uppercase tracking-wider">
                  Smart City OS
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-bold text-text font-heading leading-snug">
                Real-Time Civic Health & Telemetry Engine
              </h2>
              <p className="text-xs text-muted leading-relaxed">
                Empowering city operators, civic taskforces, and residents with unified cross-feed intelligence and verified reporting.
              </p>
            </div>

            {/* Feature Bullets */}
            <div className="space-y-3 pt-2 text-xs font-heading">
              <div className="flex items-center gap-2.5 text-text">
                <span className="w-6 h-6 rounded-lg bg-accent/10 text-accent flex items-center justify-center flex-shrink-0 border border-accent/20">
                  <Radio className="w-3.5 h-3.5" />
                </span>
                <span>Real-Time Civic Stream Ingestion</span>
              </div>

              <div className="flex items-center gap-2.5 text-text">
                <span className="w-6 h-6 rounded-lg bg-status-calm/10 text-status-calm flex items-center justify-center flex-shrink-0 border border-status-calm/20">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </span>
                <span>AI Multi-Signal Evidence Verification</span>
              </div>

              <div className="flex items-center gap-2.5 text-text">
                <span className="w-6 h-6 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center flex-shrink-0 border border-purple-500/20">
                  <Cpu className="w-3.5 h-3.5" />
                </span>
                <span>Diurnal Anomaly & Compound Fusion</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-6 border-t border-border/60 text-[11px] font-mono text-muted flex items-center justify-between">
            <span>SLA Security Standard</span>
            <span className="text-status-calm font-bold">● ISO-8601 UTC</span>
          </div>

          {/* Decorative background glow */}
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Right Form Panel */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
          <div>
            {/* Header (Mobile Logo + Welcome Text) */}
            <div className="mb-6">
              <div className="lg:hidden flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center text-white">
                  <Activity className="w-5 h-5" />
                </div>
                <span className="font-heading font-bold text-lg text-text">
                  CITYPULSE
                </span>
              </div>

              <h2 className="text-2xl font-bold text-text font-heading tracking-tight">
                Welcome Back
              </h2>
              <p className="text-xs text-muted mt-1">
                Sign in to your CityPulse operator account to access live civic telemetry.
              </p>
            </div>

            {/* Global Error Banner */}
            {error && (
              <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Email Field */}
              <div>
                <label className="block text-xs font-bold text-text font-heading mb-1.5 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: undefined });
                    }}
                    placeholder="operator@citypulse.gov"
                    autoComplete="email"
                    className={`w-full bg-surface-2/60 focus:bg-surface border rounded-xl pl-10 pr-4 py-2.5 text-xs text-text placeholder:text-muted/60 focus:outline-none transition-all ${
                      fieldErrors.email ? 'border-rose-500 focus:border-rose-500' : 'border-border focus:border-accent'
                    }`}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-[11px] text-rose-500 mt-1 font-sans">{fieldErrors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-text font-heading uppercase tracking-wider">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[11px] text-accent hover:underline font-heading font-medium"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: undefined });
                    }}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    className={`w-full bg-surface-2/60 focus:bg-surface border rounded-xl pl-10 pr-10 py-2.5 text-xs text-text placeholder:text-muted/60 focus:outline-none transition-all ${
                      fieldErrors.password ? 'border-rose-500 focus:border-rose-500' : 'border-border focus:border-accent'
                    }`}
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
                {fieldErrors.password && (
                  <p className="text-[11px] text-rose-500 mt-1 font-sans">{fieldErrors.password}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-accent text-white hover:bg-accent-hover font-heading font-bold text-xs shadow-md shadow-accent/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <span className="relative px-3 bg-surface text-[10px] font-mono text-muted uppercase">
                OR
              </span>
            </div>

            {/* Demo Account Button for Judges */}
            <div className="p-3.5 rounded-2xl bg-surface-2/50 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-text font-heading flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                  <span>DEMO OPERATOR ACCOUNT</span>
                </div>
                <div className="text-[10px] text-muted font-mono mt-0.5">
                  demo@citypulse.local • Demo@1234
                </div>
              </div>

              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-xl bg-accent/10 hover:bg-accent text-accent hover:text-white border border-accent/30 text-xs font-heading font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer flex-shrink-0"
              >
                <span>Login as Demo</span>
              </button>
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="pt-6 border-t border-border mt-6 text-center text-xs text-muted">
            Don't have an operator account?{' '}
            <Link to="/register" className="text-accent font-heading font-bold hover:underline">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
