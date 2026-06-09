'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { removeToken, getToken } from '../lib/api';

function parseJwt(token: string): any {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

function tokenToUser(token: string): User | null {
  const payload = parseJwt(token);
  if (!payload) return null;
  // Check expiry
  if (payload.exp && payload.exp * 1000 < Date.now()) {
    removeToken();
    return null;
  }
  return {
    id:          payload.id || payload._id || payload.sub || '',
    name:        payload.name || payload.email || 'Admin',
    email:       payload.email || '',
    role:        payload.role || 'admin',
    permissions: payload.permissions || {
      canCreateEvents: true, canEditEvents: true, canDeleteEvents: true,
      canCreateColloquium: true, canEditColloquium: true, canDeleteColloquium: true,
      canManageTeam: true, canManageUsers: true, canAccessAnalytics: true,
    },
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
  canEdit: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: () => {},
  refreshUser: async () => {},
  isAdmin: false,
  canEdit: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const doLogout = () => {
    removeToken();
    setUser(null);
  };

  const refreshUser = async () => {
    const token = getToken();
    setUser(token ? tokenToUser(token) : null);
    setLoading(false);
  };

  useEffect(() => { refreshUser(); }, []);

  // Auto-logout on 401 from any API call
  useEffect(() => {
    const handle = () => doLogout();
    window.addEventListener('auth:401', handle);
    return () => window.removeEventListener('auth:401', handle);
  }, []);

  const isAdmin = user?.role === 'admin';
  const canEdit = user?.role === 'admin' || user?.role === 'editor';

  return (
    <AuthContext.Provider value={{ user, loading, logout: doLogout, refreshUser, isAdmin, canEdit }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
