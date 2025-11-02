// Debug utility to check designer profile status
import { supabase } from '../lib/supabase';

export const debugAuthState = () => {
  console.log('=== DEBUG AUTH STATE ===');
  console.log('LocalStorage keys:', Object.keys(localStorage));

  // Check for Supabase auth keys
  const authKeys = Object.keys(localStorage).filter(key =>
    key.includes('supabase') || key.includes('sb-')
  );

  console.log('Supabase auth keys found:', authKeys);

  authKeys.forEach(key => {
    const value = localStorage.getItem(key);
    try {
      const parsed = JSON.parse(value || '{}');
      console.log(`${key}:`, parsed);

      // Check if there's user info
      if (parsed.user) {
        console.log('User found in storage:', {
          id: parsed.user.id,
          email: parsed.user.email
        });
      }
    } catch (e) {
      console.log(`${key}: (raw)`, value);
    }
  });

  console.log('=======================');
};

// Add to window for easy debugging
if (typeof window !== 'undefined') {
  (window as any).debugAuthState = debugAuthState;
}

export const debugDesignerProfile = async (email?: string) => {
  try {
    // Get the currently authenticated user instead of using admin functions
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting current user:', userError);
      return { error: 'Error getting current user: ' + userError.message };
    }
    
    if (!user) {
      console.log('No authenticated user found');
      return { error: 'No authenticated user found. Please log in first.' };
    }
    
    console.log('Current user:', { id: user.id, email: user.email, name: user.user_metadata?.name });
    
    // If email is provided and doesn't match current user, show warning
    if (email && email !== user.email) {
      console.warn(`Email ${email} provided but current user is ${user.email}. Debugging current user instead.`);
    }
    
    // Check if designer profile exists for current user
    const { data: designers, error: designersError } = await supabase
      .from('designers')
      .select('*')
      .eq('user_id', user.id);
    
    if (designersError) {
      console.error('Error fetching designer profile:', designersError);
      return { error: 'Error fetching designer profile: ' + designersError.message };
    }
    
    if (designers && designers.length > 0) {
      console.log('Designer profile found:', designers[0]);
      return { user, designer: designers[0], message: 'Designer profile found' };
    } else {
      console.log('No designer profile found for this user');
      return { user, designer: null, message: 'No designer profile found for current user' };
    }
  } catch (error: any) {
    console.error('Debug error:', error);
    return { error: 'Debug error: ' + error.message };
  }
};

export const createDesignerProfile = async () => {
  try {
    // Get the currently authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { error: 'No authenticated user found. Please log in first.' };
    }

    // Check if designer profile already exists
    const { data: existingDesigner, error: checkError } = await supabase
      .from('designers')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      return { error: 'Error checking existing profile: ' + checkError.message };
    }

    if (existingDesigner) {
      return { error: 'Designer profile already exists', designer: existingDesigner };
    }

    const designerData = {
      user_id: user.id,
      name: user.user_metadata?.name || user.email?.split('@')[0] || 'Designer',
      email: user.email!,
      phone: '+91 98765 43218',
      specialization: 'Modern & Contemporary',
      experience: 5,
      location: 'Mumbai',
      bio: 'Experienced interior designer with a passion for creating beautiful and functional spaces.',
      website: '',
      starting_price: '₹40,000',
      profile_image: '',
      portfolio_images: [],
      services: ['Space Planning', 'Interior Design', 'Furniture Selection'],
      materials_expertise: ['Wood', 'Glass', 'Metal'],
      awards: [],
      rating: 4.5,
      total_reviews: 0,
      total_projects: 0,
      is_verified: true,
      is_active: true
    };

    const { data, error } = await supabase
      .from('designers')
      .insert([designerData])
      .select()
      .single();

    if (error) {
      console.error('Error creating designer profile:', error);
      return { error: 'Error creating designer profile: ' + error.message };
    }

    console.log('Designer profile created successfully:', data);
    return { data, error: null, message: 'Designer profile created successfully!' };
  } catch (error: any) {
    console.error('Error in createDesignerProfile:', error);
    return { error: 'Unexpected error: ' + error.message };
  }
};