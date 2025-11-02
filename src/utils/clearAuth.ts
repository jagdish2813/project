import { supabase } from '../lib/supabase';

export const forceLogoutAll = async () => {
  try {
    // Sign out from Supabase
    await supabase.auth.signOut();

    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();

    // Clear all cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    console.log('All users logged out successfully');

    // Reload the page to clear all state
    window.location.href = '/';
  } catch (error) {
    console.error('Error during force logout:', error);
    // Still clear everything
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  }
};
