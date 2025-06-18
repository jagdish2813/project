import React, { useState } from 'react';
import { X, Mail, Phone, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import type { Customer } from '../lib/supabase';

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
  const [formData, setFormData] = useState({
    designer_email: '',
    designer_phone: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const validateForm = () => {
    if (!formData.designer_email.trim()) {
      setError('Designer email is required');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.designer_email.trim())) {
      setError('Please enter a valid email address');
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
      const shareData = {
        project_id: project.id,
        customer_id: user.id,
        designer_email: formData.designer_email.trim().toLowerCase(),
        designer_phone: formData.designer_phone.trim() || null,
        message: formData.message.trim() || null,
        status: 'sent'
      };

      const { error } = await supabase
        .from('project_shares')
        .insert([shareData]);

      if (error) throw error;

      setSuccess(true);
      
      // Reset form and close modal after success
      setTimeout(() => {
        setFormData({
          designer_email: '',
          designer_phone: '',
          message: ''
        });
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (error: any) {
      console.error('Error sending project to designer:', error);
      setError(error.message || 'Failed to send project to designer');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        designer_email: '',
        designer_phone: '',
        message: ''
      });
      setError(null);
      setSuccess(false);
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
                  Designer Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="designer_email"
                    value={formData.designer_email}
                    onChange={handleInputChange}
                    className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="designer@example.com"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Designer Phone Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    name="designer_phone"
                    value={formData.designer_phone}
                    onChange={handleInputChange}
                    className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="+91 98765 43210"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Personal Message (Optional)
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Add a personal message for the designer..."
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