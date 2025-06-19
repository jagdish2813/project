import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear any form data from localStorage/sessionStorage
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear any cached form data
      const forms = document.querySelectorAll('form');
      forms.forEach(form => {
        if (form instanceof HTMLFormElement) {
          form.reset();
        }
      });
      
      // Clear all input fields on the page
      const inputs = document.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        if (input instanceof HTMLInputElement || 
            input instanceof HTMLTextAreaElement || 
            input instanceof HTMLSelectElement) {
          input.value = '';
        }
      });
      
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
    signOut
  };
};