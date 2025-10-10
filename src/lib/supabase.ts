import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isValidUrl = (url: string) => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const hasValidCredentials =
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'your_supabase_project_url_here' &&
  supabaseAnonKey !== 'your_supabase_anon_key_here' &&
  isValidUrl(supabaseUrl);

export const supabase = hasValidCredentials
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockClient();

function createMockClient(): any {
  console.warn('Supabase credentials not configured. Please click "Connect to Supabase" to set up your project.');

  return {
    auth: {
      signUp: () => Promise.resolve({ 
        data: { user: null, session: null }, 
        error: { message: 'Please connect to Supabase to enable authentication. Click "Connect to Supabase" in the top right.' } 
      }),
      signInWithPassword: () => Promise.resolve({ 
        data: { user: null, session: null }, 
        error: { message: 'Please connect to Supabase to enable authentication. Click "Connect to Supabase" in the top right.' } 
      }),
      signOut: () => Promise.resolve({ error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    from: (table: string) => ({
      select: (columns?: string) => ({
        eq: (column: string, value: any) => ({
          order: (column: string, options?: any) => Promise.resolve({ data: [], error: null }),
          single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
          maybeSingle: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
        }),
        order: (column: string, options?: any) => Promise.resolve({ data: [], error: null }),
        single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        maybeSingle: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
      }),
      insert: (data: any) => ({
        select: () => ({
          single: () => Promise.resolve({ 
            data: null, 
            error: { message: 'Please connect to Supabase to enable database operations. Click "Connect to Supabase" in the top right.' } 
          })
        })
      }),
      update: (data: any) => ({
        eq: (column: string, value: any) => ({
          select: () => ({
            single: () => Promise.resolve({ 
              data: null, 
              error: { message: 'Please connect to Supabase to enable database operations. Click "Connect to Supabase" in the top right.' } 
            })
          })
        })
      }),
      delete: () => ({
        eq: (column: string, value: any) => Promise.resolve({ 
          data: null, 
          error: { message: 'Please connect to Supabase to enable database operations. Click "Connect to Supabase" in the top right.' } 
        })
      })
    })
  };
}

export type Designer = {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  specialization: string;
  experience: number;
  location: string;
  bio?: string;
  website?: string;
  starting_price?: string;
  profile_image?: string;
  portfolio_images: string[];
  services: string[];
  materials_expertise: string[];
  awards: string[];
  rating: number;
  total_reviews: number;
  total_projects: number;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Customer = {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  project_name: string;
  property_type: string;
  project_area?: string;
  budget_range: string;
  timeline: string;
  requirements: string;
  preferred_designer?: string;
  layout_image_url?: string;
  inspiration_links: string[];
  room_types: string[];
  special_requirements?: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type ProjectShare = {
  id: string;
  project_id: string;
  customer_id: string;
  designer_email: string;
  designer_phone?: string;
  message?: string;
  status: string;
  created_at: string;
  updated_at: string;
};