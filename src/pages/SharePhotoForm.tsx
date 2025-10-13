import React, { useState, useEffect } from 'react';
import { X, ZoomIn, Heart, Share2, Download, Calendar, MapPin, User, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useDesignerProfile } from '../hooks/useDesignerProfile';

// List of interior materials
const INTERIOR_MATERIALS = [
  'Italian Marble',
  'Teak Wood',
  'LED Lighting',
  'Granite Counters',
  'Sheesham Wood',
  'Brass Hardware',
  'Bamboo Flooring',
  'Linen Fabrics',
  'Natural Wood',
  'Carrara Marble',
  'Crystal Chandelier',
  'Velvet Upholstery'
];

const SharePhotoForm: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { designer, isDesigner, loading: designerLoading, error: designerError } = useDesignerProfile();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    imageurl: '',
    materials: [] as string[],
  });

  const categories = [
    'Living Room', 'Kitchen', 'Bedroom', 'Dining Room', 'Bathroom', 'Office', 'Entryway', 'Pooja Room', 'Kids Room', 'Other'
  ];
  const locations = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat',
    'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara',
    'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik'
  ];

  useEffect(() => {
    if (!formData.location && designer && designer.location) {
      setFormData(prev => ({ ...prev, location: designer.location }));
    }
  }, [designer, formData.location]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  // Add handler for materials selection
  const handleMaterialsChange = (material: string) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.includes(material)
        ? prev.materials.filter(m => m !== material)
        : [...prev.materials, material],
    }));
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const handleImageUploaded = (url: string) => {
    setFormData(prev => ({ ...prev, imageurl: url }));
    if (error) setError(null);
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    if (!formData.category) {
      setError('Category is required');
      return false;
    }
    if (!formData.location) {
      setError('Location is required');
      return false;
    }
    if (!formData.imageurl) {
      setError('An image is required');
      return false;
    }
    // Materials field: optional, add validation if you want to make it required
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !designer) return;
    if (!validateForm()) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('shared_gallery_items')
        .insert([{
          designerid: designer.id,
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          category: formData.category,
          location: formData.location,
          imageurl: formData.imageurl,
          materials: formData.materials, // added materials array
          isapproved: false,
        }]);
      if (error) throw error;
      setSuccess('Photo shared successfully! It will appear in the gallery after review.');
      setFormData({
        title: '',
        description: '',
        category: '',
        location: '',
        imageurl: '',
        materials: [],
      });
      setTimeout(() => navigate('/gallery'), 2000);
    } catch (error: any) {
      setError(error.message || 'Failed to share photo');
    } finally {
      setLoading(false);
    }
  };

  // UI rendering (simplified to highlight materials input)
  return (
    <form onSubmit={handleSubmit}>
      {/* ...other inputs... */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Materials Used</label>
        <div>
          {INTERIOR_MATERIALS.map(material => (
            <div key={material}>
              <input
                type="checkbox"
                checked={formData.materials.includes(material)}
                onChange={() => handleMaterialsChange(material)}
              />
              <span>{material}</span>
            </div>
          ))}
        </div>
      </div>
      {/* ...other inputs and submit button... */}
    </form>
  );
};

export default SharePhotoForm;
