import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Shield, AlertCircle, CheckCircle } from 'lucide-react';

export default function AdminSignup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    email: 'admin@gmail.com',
    password: 'Welcome@123'
  });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Step 1: Sign up the user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            role: 'admin'
          }
        }
      });

      if (signUpError) throw signUpError;

      if (!signUpData.user) {
        throw new Error('User creation failed');
      }

      // Step 2: Create admin_users entry
      const { error: adminError } = await supabase
        .from('admin_users')
        .insert({
          user_id: signUpData.user.id,
          email: formData.email,
          role: 'super_admin',
          permissions: {
            manage_deals: true,
            manage_users: true,
            view_earnings: true,
            manage_designers: true
          },
          is_active: true
        });

      if (adminError) throw adminError;

      setMessage({
        type: 'success',
        text: 'Admin account created successfully! Redirecting to admin dashboard...'
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/admin');
      }, 2000);

    } catch (error: any) {
      console.error('Error creating admin:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Failed to create admin account. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-sky-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-sky-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Create Admin Account</h2>
            <p className="mt-2 text-sm text-gray-600">
              Set up your administrative access
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors"
                placeholder="admin@gmail.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors"
                placeholder="Enter password"
              />
            </div>

            {message && (
              <div
                className={`flex items-center gap-3 p-4 rounded-lg ${
                  message.type === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {message.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                )}
                <p className="text-sm">{message.text}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-600 text-white py-3 px-4 rounded-lg hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus className="h-5 w-5" />
                  Create Admin Account
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Back to Home
            </button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Admin Permissions</h3>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Manage designer deals and promotions</li>
              <li>• View and manage all users</li>
              <li>• Access earnings and analytics</li>
              <li>• Manage designer verifications</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
