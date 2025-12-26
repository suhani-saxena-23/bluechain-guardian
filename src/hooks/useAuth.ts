import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { api } from '@/services/api';
import type { User, Session } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    try {
      const profileData = await api.profiles.get(userId);
      setProfile(profileData);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, role: string, organizationName: string, registrationNumber: string) => {
    try {
      const { user } = await api.auth.signUp(email, password, {
        role,
        organization_name: organizationName,
        registration_number: registrationNumber,
      });

      if (user) {
        await api.profiles.create({
          id: user.id,
          role,
          organization_name: organizationName,
          registration_number: registrationNumber,
          email,
        });
      }

      return { user, error: null };
    } catch (error: any) {
      return { user: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { user } = await api.auth.signIn(email, password);
      return { user, error: null };
    } catch (error: any) {
      return { user: null, error };
    }
  };

  const signOut = async () => {
    try {
      await api.auth.signOut();
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  return {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user,
  };
}
