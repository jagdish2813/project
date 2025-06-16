import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { Designer } from '../lib/supabase';

export const useDesignerProfile = () => {
  const { user } = useAuth();
  const [designer, setDesigner] = useState<Designer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchDesignerProfile();
    } else {
      setDesigner(null);
      setLoading(false);
    }
  }, [user]);

  const fetchDesignerProfile = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching designer profile for user:', user.id, user.email);
      
      const { data, error } = await supabase
        .from('designers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle(); // Use maybeSingle instead of limit(1)

      if (error) {
        console.error('Supabase error:', error);
        setError(error.message);
        setDesigner(null);
      } else {
        console.log('Designer profile data:', data);
        setDesigner(data);
      }
    } catch (error: any) {
      console.error('Error fetching designer profile:', error);
      setError(error.message);
      setDesigner(null);
    } finally {
      setLoading(false);
    }
  };

  const updateDesignerProfile = async (updates: Partial<Designer>) => {
    if (!user || !designer) return { error: 'No designer profile found' };

    try {
      console.log('Updating designer profile with:', updates);
      
      const { data, error } = await supabase
        .from('designers')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      console.log('Profile updated successfully:', data);
      
      // Update local state with new data
      setDesigner(data);
      return { error: null };
    } catch (error: any) {
      console.error('Error updating designer profile:', error);
      return { error: error.message };
    }
  };

  return {
    designer,
    loading,
    error,
    isDesigner: !!designer,
    updateDesignerProfile,
    refreshProfile: fetchDesignerProfile
  };
};