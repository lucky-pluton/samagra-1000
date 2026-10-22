import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { fetchApi } from '../lib/api';
import type { Profile } from '../../../shared/types';

interface AuthContextType {
  user: any | null;
  profile: Profile | null;
  loading: boolean;
  isConfigured: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error?: string; message?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string; message?: string }>;
  updateDisplayName: (newName: string) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function initAuth() {
      if (isSupabaseConfigured) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setUser(session.user);
            localStorage.setItem('samagra_user_id', session.user.id);
            await loadProfile(session.user.id);
          } else {
            initDefaultDemoUser();
          }
        } catch (err) {
          console.error('[Auth Error]', err);
          initDefaultDemoUser();
        }
      } else {
        initDefaultDemoUser();
      }
      setLoading(false);
    }

    initAuth();

    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          localStorage.setItem('samagra_user_id', session.user.id);
          await loadProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
      });
      return () => subscription.unsubscribe();
    }
  }, []);

  function initDefaultDemoUser() {
    const storedId = localStorage.getItem('samagra_user_id') || '00000000-0000-0000-0000-000000000001';
    localStorage.setItem('samagra_user_id', storedId);
    loadProfile(storedId);
  }

  async function loadProfile(_userId: string) {
    try {
      const res = await fetchApi<{ success: boolean; profile: Profile }>('/auth/profile');
      if (res.profile) {
        setProfile(res.profile);
      }
    } catch {
      setProfile({
        id: '00000000-0000-0000-0000-000000000001',
        display_name: 'PioneerCoder',
        email: 'pioneer@samagra.annam.ai',
        is_verified: true,
        is_admin: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
  }

  const signUp = async (email: string, password: string, displayName: string) => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName }
        }
      });
      if (error) return { error: error.message };

      if (data.user) {
        await fetchApi('/auth/profile', {
          method: 'POST',
          body: JSON.stringify({ display_name: displayName, email })
        });
      }
      return { message: 'Registration successful! Please check your email to verify your account.' };
    } else {
      const mockId = `usr-${Date.now()}`;
      localStorage.setItem('samagra_user_id', mockId);
      const newProf = await fetchApi<{ success: boolean; profile: Profile }>('/auth/profile', {
        method: 'POST',
        body: JSON.stringify({ display_name: displayName, email })
      });
      setProfile(newProf.profile);
      setUser({ id: mockId, email });
      return { message: 'Local session created.' };
    }
  };

  const signIn = async (email: string, password: string) => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      if (data.user) {
        setUser(data.user);
        localStorage.setItem('samagra_user_id', data.user.id);
        await loadProfile(data.user.id);
      }
      return {};
    } else {
      setUser({ id: localStorage.getItem('samagra_user_id') || '00000000-0000-0000-0000-000000000001', email });
      return {};
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) return { error: error.message };
      return { message: 'Password recovery email sent.' };
    } else {
      return { message: 'Password reset email simulated for local development.' };
    }
  };

  const updateDisplayName = async (newName: string) => {
    try {
      const res = await fetchApi<{ success: boolean; profile: Profile }>('/auth/profile', {
        method: 'POST',
        body: JSON.stringify({ display_name: newName })
      });
      setProfile(res.profile);
      return {};
    } catch (err: any) {
      return { error: err.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isConfigured: isSupabaseConfigured,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updateDisplayName
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
