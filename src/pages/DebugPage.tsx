import React, { useState, useEffect } from 'react';
import { debugDesignerProfile, createDesignerProfile } from '../utils/debugDesigner';
import { supabase } from '../lib/supabase';

const DebugPage = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get current user on component mount
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getCurrentUser();
  }, []);

  const handleDebug = async () => {
    setLoading(true);
    try {
      const result = await debugDesignerProfile();
      setResult(result);
    } catch (error: any) {
      console.error('Debug error:', error);
      setResult({ error: error.message || 'Unknown error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfile = async () => {
    setLoading(true);
    try {
      const createResult = await createDesignerProfile();
      setResult(createResult);
    } catch (error: any) {
      console.error('Create profile error:', error);
      setResult({ error: error.message || 'Unknown error occurred' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-secondary-800 mb-6">Debug Designer Profile</h1>
          
          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Current User Status</h3>
              {currentUser ? (
                <div className="text-sm text-blue-700">
                  <p><strong>Email:</strong> {currentUser.email}</p>
                  <p><strong>ID:</strong> {currentUser.id}</p>
                  <p><strong>Name:</strong> {currentUser.user_metadata?.name || 'Not set'}</p>
                </div>
              ) : (
                <p className="text-red-600">No user logged in. Please log in to use debug functions.</p>
              )}
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={handleDebug}
                disabled={loading || !currentUser}
                className="btn-primary disabled:opacity-50"
              >
                {loading ? 'Debugging...' : 'Debug Current User Profile'}
              </button>
              
              <button
                onClick={handleCreateProfile}
                disabled={loading || !currentUser}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Designer Profile'}
              </button>
            </div>
            
            {!currentUser && (
              <p className="text-sm text-gray-600 mt-2">
                Please log in first to use the debug functions.
              </p>
            )}
          </div>

          {result && (
            <div className="bg-gray-100 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">Debug Result:</h3>
              <div className="text-sm overflow-auto">
                {result.error && (
                  <div className="bg-red-50 border border-red-200 rounded p-3 mb-3">
                    <p className="text-red-800 font-medium">Error:</p>
                    <p className="text-red-700">{result.error}</p>
                  </div>
                )}
                {result.message && (
                  <div className="bg-green-50 border border-green-200 rounded p-3 mb-3">
                    <p className="text-green-800 font-medium">Message:</p>
                    <p className="text-green-700">{result.message}</p>
                  </div>
                )}
                <pre className="bg-white border rounded p-3 text-xs">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DebugPage;