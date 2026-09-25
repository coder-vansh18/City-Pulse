import {
  User,
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
} from '../types/auth';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function fetchAuthJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const token = localStorage.getItem('citypulse_auth_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options?.headers as Record<string, string>),
  };

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // sends HttpOnly cookies when available
  });

  if (!res.ok) {
    let errorDetail = 'Authentication request failed.';
    try {
      const errJson = await res.json();
      errorDetail = errJson.detail || errJson.message || errorDetail;
    } catch {
      // fallback
    }
    throw new Error(errorDetail);
  }

  return res.json() as Promise<T>;
}

export const authClient = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const data = await fetchAuthJson<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (data.token) {
      localStorage.setItem('citypulse_auth_token', data.token);
    }
    return data;
  },

  register: async (payload: RegisterCredentials): Promise<AuthResponse> => {
    const data = await fetchAuthJson<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (data.token) {
      localStorage.setItem('citypulse_auth_token', data.token);
    }
    return data;
  },

  logout: async (): Promise<void> => {
    try {
      await fetchAuthJson<{ ok: boolean }>('/api/auth/logout', {
        method: 'POST',
      });
    } catch {
      // ignore network errors on logout
    } finally {
      localStorage.removeItem('citypulse_auth_token');
    }
  },

  getMe: async (): Promise<User> => {
    return fetchAuthJson<User>('/api/auth/me');
  },

  forgotPassword: async (email: string): Promise<{ ok: boolean; message: string; demo_token?: string }> => {
    return fetchAuthJson<{ ok: boolean; message: string; demo_token?: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (token: string, newPassword: string): Promise<{ ok: boolean; message: string }> => {
    return fetchAuthJson<{ ok: boolean; message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, new_password: newPassword }),
    });
  },
};
