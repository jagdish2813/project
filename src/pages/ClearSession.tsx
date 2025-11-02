import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { forceLogoutAll } from '../utils/clearAuth';

const ClearSession = () => {
  const [status, setStatus] = useState('Clearing sessions...');
  const navigate = useNavigate();

  useEffect(() => {
    const clearAll = async () => {
      try {
        await forceLogoutAll();
        setStatus('All sessions cleared successfully!');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } catch (error) {
        console.error('Error clearing sessions:', error);
        setStatus('Sessions cleared (with some errors). Redirecting...');
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      }
    };

    clearAll();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Clear All Sessions</h1>
        <p className="text-gray-600 mb-6">{status}</p>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      </div>
    </div>
  );
};

export default ClearSession;
