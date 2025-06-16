import React, { useState } from 'react';
import { debugDesignerProfile, createDesignerProfile } from '../utils/debugDesigner';
import { supabase } from '../lib/supabase';

const DebugPage = () => {
  const [email, setEmail] = useState('som2813@gmail.com');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleDebug = async () => {
    setLoading(true);
    try {
      const result = await debugDesignerProfile(email);
      setResult(result);
    } catch (error) {
      console.error('Debug error:', error);
      setResult({ error: error });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfile = async () => {
    setLoading(true);
    try {
      // First get the user
      const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
      
      if (usersError) {
        setResult({ error: 'Cannot access users - admin privileges required' });
        setLoading(false);
        return;
      }
      
      const user = users?.find(u => u.email === email);
      if (!user) {
        setResult({ error: 'User not found' });
        setLoading(false);
        return;
      }

      const createResult = await createDesignerProfile(user.id, user.email!, user.user_metadata?.name || 'Jagdish Apte');
      setResult(createResult);
    } catch (error) {
      console.error('Create profile error:', error);
      setResult({ error: error });
    } finally {
      setLoading(false);
    }
  };

  const handleDirectInsert = async () => {
    setLoading(true);
    try {
      // Get current user (assuming Jagdish is logged in)
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        setResult({ error: 'No authenticated user found. Please make sure Jagdish is logged in.' });
        setLoading(false);
        return;
      }

      // Check if designer profile already exists
      const { data: existingDesigner, error: checkError } = await supabase
        .from('designers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        setResult({ error: 'Error checking existing profile: ' + checkError.message });
        setLoading(false);
        return;
      }

      if (existingDesigner) {
        setResult({ message: 'Designer profile already exists', designer: existingDesigner });
        setLoading(false);
        return;
      }

      // Create designer profile for current user
      const designerData = {
        user_id: user.id,
        name: user.user_metadata?.name || 'Jagdish Apte',
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
        setResult({ error: 'Error creating designer profile: ' + error.message });
      } else {
        setResult({ message: 'Designer profile created successfully!', designer: data });
      }
    } catch (error: any) {
      setResult({ error: 'Unexpected error: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-secondary-800 mb-6">Debug Designer Profile</h1>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email to Debug
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter email address"
              />
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={handleDebug}
                disabled={loading}
                className="btn-primary disabled:opacity-50"
              >
                {loading ? 'Debugging...' : 'Debug Profile'}
              </button>
              
              <button
                onClick={handleDirectInsert}
                disabled={loading}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Profile for Current User'}
              </button>
            </div>
          </div>

          {result && (
            <div className="bg-gray-100 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">Debug Result:</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DebugPage;