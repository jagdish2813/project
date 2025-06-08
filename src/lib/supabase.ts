import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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