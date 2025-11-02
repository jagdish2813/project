import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      // Check if user is admin
      if (session?.user) {
        const { data: adminData } = await supabase
          .from('admin_users')
          .select('id')
          .eq('user_id', session.user.id)
          .eq('is_active', true)
          .maybeSingle();

        setIsAdmin(!!adminData);
      } else {
        setIsAdmin(false);
      }

      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);

        // Check if user is admin
        if (session?.user) {
          const { data: adminData } = await supabase
            .from('admin_users')
            .select('id')
            .eq('user_id', session.user.id)
            .eq('is_active', true)
            .maybeSingle();

          setIsAdmin(!!adminData);
        } else {
          setIsAdmin(false);
        }

        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      // Sign out from Supabase first
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Supabase signOut error:', error);
      }

      // Clear Supabase-related items from storage, but not all localStorage
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sb-')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));

      // Clear session storage
      sessionStorage.clear();

      // Force redirect to home page
      window.location.href = '/';

    } catch (error) {
      console.error('Error signing out:', error);
      // Even if there's an error, still redirect to home
      window.location.href = '/';
    }
  };

  return {
    user,
    loading,
    isAdmin,
    signOut
  };
};