import React, { useState, useEffect } from 'react';
import { X, Send, AlertCircle, CheckCircle, ChevronDown, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import type { Customer } from '../lib/supabase';

interface Designer {
  id: string;
  name: string;
  email: string;
  location: string;
  profile_image: string | null;
  specialization: string;
}

interface SendToDesignerModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Customer;
}

const SendToDesignerModal: React.FC<SendToDesignerModalProps> = ({ isOpen, onClose, project }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [designers, setDesigners] = useState<Designer[]>([]);
  const [selectedDesigners, setSelectedDesigners] = useState<Designer[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [fetchingDesigners, setFetchingDesigners] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchDesigners();
    }
  }, [isOpen]);

  const fetchDesigners = async () => {
    setFetchingDesigners(true);
    try {
      const { data, error } = await supabase
        .from('designers')
        .select('id, name, email, location, profile_image, specialization')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setDesigners(data || []);
    } catch (error: any) {
      console.error('Error fetching designers:', error);
      setError('Failed to load designers');
    } finally {
      setFetchingDesigners(false);
    }
  };

  const toggleDesignerSelection = (designer: Designer) => {
    setSelectedDesigners(prev => {
      const isSelected = prev.some(d => d.id === designer.id);
      if (isSelected) {
        return prev.filter(d => d.id !== designer.id);
      } else {
        return [...prev, designer];
      }
    });
    if (error) setError(null);
  };

  const removeDesigner = (designerId: string) => {
    setSelectedDesigners(prev => prev.filter(d => d.id !== designerId));
  };

  const validateForm = () => {
    if (selectedDesigners.length === 0) {
      setError('Please select at least one designer');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const shareDataArray = selectedDesigners.map(designer => ({
        project_id: project.id,
        customer_id: user.id,
        designer_id: designer.id,
        designer_email: designer.email,
        designer_phone: null,
        message: message.trim() || null,
        status: 'sent'
      }));

      const { error } = await supabase
        .from('project_shares')
        .insert(shareDataArray);

      if (error) throw error;

      setSuccess(true);

      setTimeout(() => {
        setSelectedDesigners([]);
        setMessage('');
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (error: any) {
      console.error('Error sending project to designer:', error);
      setError(error.message || 'Failed to send project to designers');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setSelectedDesigners([]);
      setMessage('');
      setError(null);
      setSuccess(false);
      setIsDropdownOpen(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-secondary-800">
            Send Project to Designer
          </h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-secondary-800 mb-2">Project Sent Successfully!</h3>
            <p className="text-gray-600">
              Your project details have been sent to the designer. They will contact you soon.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-secondary-800 mb-2">Project: {project.project_name}</h3>
              <p className="text-gray-600 text-sm">
                Share your project details with a designer to get personalized consultation and quotes.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Designers *
                </label>

                {selectedDesigners.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedDesigners.map(designer => (
                      <div
                        key={designer.id}
                        className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                      >
                        {designer.profile_image ? (
                          <img
                            src={designer.profile_image}
                            alt={designer.name}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center text-xs">
                            {designer.name.charAt(0)}
                          </div>
                        )}
                        <span>{designer.name}</span>
                        <button
                          type="button"
                          onClick={() => removeDesigner(designer.id)}
                          className="hover:text-blue-900"
                          disabled={loading}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    disabled={loading || fetchingDesigners}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 flex items-center justify-between hover:border-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
                  >
                    <span className="text-gray-700">
                      {fetchingDesigners ? 'Loading designers...' : 'Choose designers'}
                    </span>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isDropdownOpen && !fetchingDesigners && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                      {designers.length === 0 ? (
                        <div className="px-4 py-8 text-center text-gray-500">
                          No designers available
                        </div>
                      ) : (
                        designers.map(designer => {
                          const isSelected = selectedDesigners.some(d => d.id === designer.id);
                          return (
                            <button
                              key={designer.id}
                              type="button"
                              onClick={() => toggleDesignerSelection(designer)}
                              className="w-full px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-left border-b border-gray-100 last:border-b-0"
                            >
                              {designer.profile_image ? (
                                <img
                                  src={designer.profile_image}
                                  alt={designer.name}
                                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                  <span className="text-gray-600 font-medium">
                                    {designer.name.charAt(0)}
                                  </span>
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 truncate">{designer.name}</div>
                                <div className="text-sm text-gray-500 truncate">{designer.location}</div>
                                <div className="text-xs text-gray-400 truncate">{designer.specialization}</div>
                              </div>
                              {isSelected && (
                                <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Personal Message (Optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Add a personal message for the designers..."
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'Sending...' : 'Send Project'}</span>
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default SendToDesignerModal;