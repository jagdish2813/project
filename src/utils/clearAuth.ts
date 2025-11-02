import { supabase } from '../lib/supabase';

export const forceLogoutAll = async () => {
  try {
    console.log('Starting force logout...');

    // First, sign out from Supabase to invalidate the session on the server
    const { error } = await supabase.auth.signOut({ scope: 'global' });

    if (error) {
      console.error('Supabase signOut error:', error);
    }

    // Get all localStorage keys before clearing
    const allKeys = Object.keys(localStorage);
    console.log('LocalStorage keys before clear:', allKeys);

    // Clear all storage completely
    localStorage.clear();
    sessionStorage.clear();

    // Double check - remove any Supabase-specific keys
    const supabaseKeys = [
      'supabase.auth.token',
      'sb-auth-token',
      'sb-access-token',
      'sb-refresh-token'
    ];

    supabaseKeys.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    // Clear all cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    console.log('All users logged out successfully');
    console.log('LocalStorage after clear:', Object.keys(localStorage));

    // Use location.replace instead of href to prevent back button issues
    window.location.replace('/');
  } catch (error) {
    console.error('Error during force logout:', error);
    // Still clear everything even on error
    localStorage.clear();
    sessionStorage.clear();
    window.location.replace('/');
  }
};
