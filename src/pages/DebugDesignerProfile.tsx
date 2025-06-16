import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useDesignerProfile } from '../hooks/useDesignerProfile';
import { supabase } from '../lib/supabase';
import { RefreshCw, User, Database, CheckCircle, XCircle } from 'lucide-react';

const DebugDesignerProfile = () => {
  const { user } = useAuth();
  const { designer, loading, error, isDesigner, refreshProfile } = useDesignerProfile();
  const [manualCheck, setManualCheck] = useState<any>(null);
  const [checking, setChecking] = useState(false);

  const handleManualCheck = async () => {
    if (!user) return;
    
    setChecking(true);
    try {
      console.log('Manual check for user:', user.id, user.email);
      
      // Direct database query
      const { data, error, count } = await supabase
        .from('designers')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id);

      console.log('Manual check result:', { data, error, count });
      
      setManualCheck({
        data,
        error,
        count,
        query: `SELECT * FROM designers WHERE user_id = '${user.id}'`
      });
    } catch (err: any) {
      console.error('Manual check error:', err);
      setManualCheck({ error: err.message });
    } finally {
      setChecking(false);
    }
  };

  const handleRefresh = () => {
    refreshProfile();
    setManualCheck(null);
  };

  useEffect(() => {
    if (user) {
      handleManualCheck();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-secondary-800 mb-4">Please sign in to debug</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-secondary-800">Debug Designer Profile</h1>
            <button
              onClick={handleRefresh}
              disabled={loading || checking}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${(loading || checking) ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Current User Info */}
          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-blue-800 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Current User Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">User ID:</span>
                <div className="font-mono bg-white p-2 rounded mt-1">{user.id}</div>
              </div>
              <div>
                <span className="font-medium">Email:</span>
                <div className="font-mono bg-white p-2 rounded mt-1">{user.email}</div>
              </div>
              <div>
                <span className="font-medium">Name:</span>
                <div className="font-mono bg-white p-2 rounded mt-1">{user.user_metadata?.name || 'Not set'}</div>
              </div>
              <div>
                <span className="font-medium">Created:</span>
                <div className="font-mono bg-white p-2 rounded mt-1">{new Date(user.created_at).toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Hook Status */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">useDesignerProfile Hook Status</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <span className="font-medium">Loading:</span>
                <span className={`px-2 py-1 rounded text-sm ${loading ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                  {loading ? 'True' : 'False'}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="font-medium">Is Designer:</span>
                <span className={`px-2 py-1 rounded text-sm flex items-center space-x-1 ${isDesigner ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {isDesigner ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  <span>{isDesigner ? 'True' : 'False'}</span>
                </span>
              </div>
              {error && (
                <div className="flex items-start space-x-3">
                  <span className="font-medium">Error:</span>
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">{error}</span>
                </div>
              )}
            </div>
          </div>

          {/* Designer Data from Hook */}
          <div className="bg-green-50 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-green-800 mb-4">Designer Data (from Hook)</h2>
            {designer ? (
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">ID:</span> {designer.id}</div>
                <div><span className="font-medium">Name:</span> {designer.name}</div>
                <div><span className="font-medium">Email:</span> {designer.email}</div>
                <div><span className="font-medium">Specialization:</span> {designer.specialization}</div>
                <div><span className="font-medium">Location:</span> {designer.location}</div>
                <div><span className="font-medium">Active:</span> {designer.is_active ? 'Yes' : 'No'}</div>
                <div><span className="font-medium">Verified:</span> {designer.is_verified ? 'Yes' : 'No'}</div>
              </div>
            ) : (
              <p className="text-gray-600">No designer data found</p>
            )}
          </div>

          {/* Manual Database Check */}
          <div className="bg-purple-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-purple-800 mb-4 flex items-center">
              <Database className="w-5 h-5 mr-2" />
              Manual Database Check
            </h2>
            <button
              onClick={handleManualCheck}
              disabled={checking}
              className="mb-4 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
            >
              {checking ? 'Checking...' : 'Run Manual Check'}
            </button>
            
            {manualCheck && (
              <div className="space-y-4">
                <div>
                  <span className="font-medium">Query:</span>
                  <div className="font-mono bg-white p-2 rounded mt-1 text-sm">{manualCheck.query}</div>
                </div>
                <div>
                  <span className="font-medium">Count:</span>
                  <span className="ml-2 px-2 py-1 bg-white rounded">{manualCheck.count}</span>
                </div>
                {manualCheck.error && (
                  <div>
                    <span className="font-medium text-red-600">Error:</span>
                    <div className="bg-red-100 text-red-800 p-2 rounded mt-1">{manualCheck.error}</div>
                  </div>
                )}
                {manualCheck.data && (
                  <div>
                    <span className="font-medium">Raw Data:</span>
                    <pre className="bg-white p-4 rounded mt-1 text-xs overflow-auto max-h-64">
                      {JSON.stringify(manualCheck.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Recommendations */}
          <div className="bg-yellow-50 rounded-lg p-6 mt-6">
            <h2 className="text-xl font-semibold text-yellow-800 mb-4">Recommendations</h2>
            <div className="space-y-2 text-sm">
              {!isDesigner && manualCheck?.count > 0 && (
                <div className="bg-yellow-100 p-3 rounded">
                  <strong>Issue Found:</strong> Designer record exists in database but hook is not detecting it.
                  This could be a caching issue or RLS policy problem.
                </div>
              )}
              {!isDesigner && manualCheck?.count === 0 && (
                <div className="bg-blue-100 p-3 rounded">
                  <strong>No Issue:</strong> No designer record found in database. User needs to register as a designer.
                </div>
              )}
              {isDesigner && (
                <div className="bg-green-100 p-3 rounded">
                  <strong>Working Correctly:</strong> Designer profile is properly loaded and accessible.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugDesignerProfile;