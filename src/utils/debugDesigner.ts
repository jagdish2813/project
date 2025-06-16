// Debug utility to check designer profile status
import { supabase } from '../lib/supabase';

export const debugDesignerProfile = async (email: string) => {
  try {
    console.log(`Debugging designer profile for email: ${email}`);
    
    // First, check if user exists in auth
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('Error fetching users:', usersError);
      return;
    }
    
    const user = users?.find(u => u.email === email);
    if (!user) {
      console.log('User not found in auth system');
      return;
    }
    
    console.log('User found:', { id: user.id, email: user.email, name: user.user_metadata?.name });
    
    // Check if designer profile exists
    const { data: designers, error: designersError } = await supabase
      .from('designers')
      .select('*')
      .eq('user_id', user.id);
    
    if (designersError) {
      console.error('Error fetching designer profile:', designersError);
      return;
    }
    
    if (designers && designers.length > 0) {
      console.log('Designer profile found:', designers[0]);
    } else {
      console.log('No designer profile found for this user');
    }
    
    return { user, designers };
  } catch (error) {
    console.error('Debug error:', error);
  }
};

export const createDesignerProfile = async (userId: string, email: string, name: string) => {
  try {
    const designerData = {
      user_id: userId,
      name: name || 'Jagdish Apte',
      email: email,
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
      return { error };
    }

    console.log('Designer profile created successfully:', data);
    return { data, error: null };
  } catch (error: any) {
    console.error('Error in createDesignerProfile:', error);
    return { error: error.message };
  }
};