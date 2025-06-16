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
      
      const { data, error } = await supabase
        .from('designers')
        .select('*')
        .eq('user_id', user.id)
        .limit(1);

      if (error) {
        console.error('Supabase error:', error);
        setError(error.message);
        setDesigner(null);
      } else {
        // Check if data array contains any elements
        if (data && data.length > 0) {
          setDesigner(data[0]);
        } else {
          // No designer profile found - this is expected for non-designers
          setDesigner(null);
        }
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
      const { error } = await supabase
        .from('designers')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;

      // Refresh the profile data
      await fetchDesignerProfile();
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