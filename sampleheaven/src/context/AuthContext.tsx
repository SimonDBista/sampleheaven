"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, User, supabase, isRealSupabaseConfigured, interactionService, profileService } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (usernameOrEmail: string, password?: string) => Promise<{ data: User | null; error: string | null }>;
  signup: (username: string, email: string, password?: string) => Promise<{ data: User | null; error: string | null }>;
  logout: () => Promise<void>;
  updateUserRole: (role: 'Buyer' | 'Seller') => Promise<User | null>;
  updateUserProfile: (data: { username?: string; profile_picture_url?: string }) => Promise<User | null>;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const updateSession = (u: User | null) => {
    setUser(u);
    if (typeof window !== 'undefined') {
      if (u) {
        localStorage.setItem('samplegoldmine_user_session_v2', JSON.stringify(u));
      } else {
        localStorage.removeItem('samplegoldmine_user_session_v2');
      }
    }
  };

  const refreshUser = () => {
    updateSession(authService.getCurrentUser());
  };

  useEffect(() => {
    if (isRealSupabaseConfigured && supabase) {
      const client = supabase;
      setIsLoading(true);
      // 1. Get initial session
      client.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          // fetch user profile from public.users table
          client
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()
            .then(({ data, error }) => {
              if (!error && data) {
                const appUser: User = {
                  id: data.id,
                  email: data.email,
                  username: data.username,
                  role: data.role,
                  created_at: data.created_at,
                  isVerified: data.is_verified,
                  isSuspended: data.is_suspended,
                  profile_picture_url: data.profile_picture_url || ''
                };
                updateSession(appUser);
                interactionService.syncUserInteractions(appUser.id);
              } else {
                const tempUser: User = {
                  id: session.user.id,
                  email: session.user.email || '',
                  username: session.user.user_metadata?.username || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
                  role: null,
                  created_at: new Date().toISOString()
                };
                updateSession(tempUser);
                interactionService.syncUserInteractions(tempUser.id);
              }
              setIsLoading(false);
            });
        } else {
          updateSession(null);
          setIsLoading(false);
        }
      }).catch(() => {
        setIsLoading(false);
      });

      // 2. Listen for auth state changes
      const { data: { subscription } } = client.auth.onAuthStateChange(async (event, session) => {
        setIsLoading(true);
        if (session?.user) {
          const { data, error } = await client
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (!error && data) {
            const appUser: User = {
              id: data.id,
              email: data.email,
              username: data.username,
              role: data.role,
              created_at: data.created_at,
              isVerified: data.is_verified,
              isSuspended: data.is_suspended,
              profile_picture_url: data.profile_picture_url || ''
            };
            updateSession(appUser);
            await interactionService.syncUserInteractions(appUser.id);
          } else {
            const tempUser: User = {
              id: session.user.id,
              email: session.user.email || '',
              username: session.user.user_metadata?.username || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
              role: null,
              created_at: new Date().toISOString()
            };
            updateSession(tempUser);
            await interactionService.syncUserInteractions(tempUser.id);
          }
        } else {
          updateSession(null);
        }
        setIsLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      refreshUser();
      setIsLoading(false);
    }
  }, []);

  const login = async (usernameOrEmail: string, password?: string) => {
    setIsLoading(true);
    try {
      const res = await authService.logIn(usernameOrEmail, password);
      if (res.data) {
        updateSession(res.data);
        await interactionService.syncUserInteractions(res.data.id);
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (username: string, email: string, password?: string) => {
    setIsLoading(true);
    try {
      const res = await authService.signUp(username, email, password);
      if (res.data) {
        updateSession(res.data);
        await interactionService.syncUserInteractions(res.data.id);
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logOut();
      updateSession(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('samplegoldmine_liked_products_v2');
        localStorage.removeItem('samplegoldmine_followed_creators_v2');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (role: 'Buyer' | 'Seller') => {
    if (!user) return null;
    setIsLoading(true);
    try {
      const updated = await authService.setUserRole(user.id, role);
      if (updated) {
        updateSession(updated);
      }
      return updated;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (data: { username?: string; profile_picture_url?: string }) => {
    if (!user) return null;
    setIsLoading(true);
    try {
      const updated = await profileService.updateUserProfile(user.id, data);
      if (updated) {
        updateSession(updated);
      }
      return updated;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, updateUserRole, updateUserProfile, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
