import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Password rules validation
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber;
  const doPasswordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

    if (!name.trim()) {
      errors.name = 'Full name is required.';
    }

    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!emailRegex.test(email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (!isPasswordValid) {
      errors.password = 'Password does not meet the security criteria.';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Confirm your password.';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) return;

    const success = await register({
      name: name.trim(),
      email: email.trim(),
      password,
    });

    if (success) {
      navigate('/', { replace: true });
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
            Create Operator Account
          </h1>
          <p className="text-xs text-muted mt-1">
            Join the CityPulse municipal monitoring & civic telemetry network.
          </p>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-text font-heading mb-1 uppercase tracking-wider">
              Full Name
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: '' });
                }}
                placeholder="Alex Sharma"
                autoComplete="name"
                className={`w-full bg-surface-2/60 focus:bg-surface border rounded-xl pl-10 pr-4 py-2 text-xs text-text placeholder:text-muted/60 focus:outline-none transition-all ${
                  fieldErrors.name ? 'border-rose-500 focus:border-rose-500' : 'border-border focus:border-accent'
                }`}
              />
            </div>
            {fieldErrors.name && (
              <p className="text-[11px] text-rose-500 mt-1 font-sans">{fieldErrors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-text font-heading mb-1 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                }}
                placeholder="operator@citypulse.gov"
                autoComplete="email"
                className={`w-full bg-surface-2/60 focus:bg-surface border rounded-xl pl-10 pr-4 py-2 text-xs text-text placeholder:text-muted/60 focus:outline-none transition-all ${
                  fieldErrors.email ? 'border-rose-500 focus:border-rose-500' : 'border-border focus:border-accent'
                }`}
              />
            </div>
            {fieldErrors.email && (
              <p className="text-[11px] text-rose-500 mt-1 font-sans">{fieldErrors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-text font-heading mb-1 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
                }}
                placeholder="••••••••••••"
                autoComplete="new-password"
                className={`w-full bg-surface-2/60 focus:bg-surface border rounded-xl pl-10 pr-10 py-2 text-xs text-text placeholder:text-muted/60 focus:outline-none transition-all ${
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

          {/* Real-time Password Requirements Checklist */}
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
            <label className="block text-xs font-bold text-text font-heading mb-1 uppercase tracking-wider">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (fieldErrors.confirmPassword) setFieldErrors({ ...fieldErrors, confirmPassword: '' });
                }}
                placeholder="••••••••••••"
                autoComplete="new-password"
                className={`w-full bg-surface-2/60 focus:bg-surface border rounded-xl pl-10 pr-4 py-2 text-xs text-text placeholder:text-muted/60 focus:outline-none transition-all ${
                  fieldErrors.confirmPassword ? 'border-rose-500 focus:border-rose-500' : 'border-border focus:border-accent'
                }`}
              />
            </div>
            {fieldErrors.confirmPassword && (
              <p className="text-[11px] text-rose-500 mt-1 font-sans">{fieldErrors.confirmPassword}</p>
            )}
            {confirmPassword && doPasswordsMatch && (
              <p className="text-[11px] text-status-calm mt-1 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Passwords match
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-accent text-white hover:bg-accent-hover font-heading font-bold text-xs shadow-md shadow-accent/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-4"
          >
            {isLoading ? (
              <>
                <Activity className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="pt-5 border-t border-border mt-5 text-center text-xs text-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-accent font-heading font-bold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
