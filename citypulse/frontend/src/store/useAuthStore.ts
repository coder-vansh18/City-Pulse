import { create } from 'zustand';
import { User, LoginCredentials, RegisterCredentials } from '../types/auth';
import { authClient } from '../api/authClient';

interface AuthStoreState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (payload: RegisterCredentials) => Promise<boolean>;
  demoLogin: () => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthStoreState>((set, get) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('citypulse_auth_token') : null,
  isAuthenticated: false,
  isLoading: true, // starts loading while verifying token on startup
  error: null,

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authClient.login(credentials);
      set({
        user: res.user,
        token: res.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.message || 'Invalid email or password.',
      });
      return false;
    }
  },

  register: async (payload: RegisterCredentials) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authClient.register(payload);
      set({
        user: res.user,
        token: res.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.message || 'Registration failed. Please check your details.',
      });
      return false;
    }
  },

  demoLogin: async () => {
    return get().login({
      email: 'demo@citypulse.local',
      password: 'Demo@1234',
    });
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authClient.logout();
    } finally {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  checkAuth: async () => {
    const token = localStorage.getItem('citypulse_auth_token');
    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      const user = await authClient.getMe();
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      // Invalid/expired token
      localStorage.removeItem('citypulse_auth_token');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  clearError: () => set({ error: null }),
  setUser: (user) => set({ user, isAuthenticated: !!user }),
}));
