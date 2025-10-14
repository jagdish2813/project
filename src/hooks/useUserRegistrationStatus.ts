import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export const useUserRegistrationStatus = () => {
  const { user } = useAuth();
  const [hasDesignerProfile, setHasDesignerProfile] = useState(false);
  const [hasCustomerProject, setHasCustomerProject] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRegistrationStatus = async () => {
      if (!user) {
        setHasDesignerProfile(false);
        setHasCustomerProject(false);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Check if user has a designer profile
        const { data: designerData, error: designerError } = await supabase
          .from('designers')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (designerError && designerError.code !== 'PGRST116') {
          console.error('Error checking designer profile:', designerError);
        }

        setHasDesignerProfile(!!designerData);

        // Only check customer projects if user is NOT a designer
        // This prevents unnecessary calls when designers are editing their profiles
        if (!designerData) {
          const { data: customerData, error: customerError } = await supabase
            .from('customers')
            .select('id')
            .eq('user_id', user.id)
            .;
            //.maybeSingle();

          if (customerError && customerError.code !== 'PGRST116') {
            console.error('Error checking customer projects:', customerError);
          }

          setHasCustomerProject(!!customerData);
        } else { 
          // User is a designer, so we don't need to check customer projects
          setHasCustomerProject(false);
        }
      } catch (error) {
        console.error('Error checking registration status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkRegistrationStatus();
  }, [user]);

  return {
    hasDesignerProfile,
    hasCustomerProject,
    hasAnyRegistration: hasDesignerProfile || hasCustomerProject,
    loading
  };
};