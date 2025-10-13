import React, { useState, useEffect } from 'react';
import { X, ZoomIn, Heart, Share2, Download, Calendar, MapPin, User, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useDesignerProfile } from '../hooks/useDesignerProfile';

interface GalleryItem {
  id: string;
  title: string;
  designer: string;
  designerId: string;
  location: string;
  category: string;
  date: string;
  image: string;
  description: string;
  materials?: string[];
  projectId?: string;
  is_approved?: boolean;
}

const Gallery = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDesigner, loading: designerLoading } = useDesignerProfile();
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [allGalleryItems, setAllGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    'All', 'Living Room', 'Kitchen', 'Bedroom', 'Dining Room', 'Bathroom', 
    'Office', 'Entryway', 'Pooja Room', 'Kids Room', 'Other'
  ];

  // Mock data for initial display
  const mockGalleryItems: GalleryItem[] = [
    {
      id: 'mock-1',
      title: 'Modern Living Room',
      designer: 'Priya Sharma',
      designerId: '550e8400-e29b-41d4-a716-446655440001', // Example UUID
      location: 'Mumbai',
      category: 'Living Room',
      date: 'March 2024',
      image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'A contemporary living space with clean lines and neutral tones.',
      materials: ['Italian Marble', 'Teak Wood', 'LED Lighting'],
      projectId: 'proj1',
      is_approved: true
    },
    {
      id: 'mock-2',
      title: 'Traditional Kitchen',
      designer: 'Rajesh Kumar',
      designerId: '550e8400-e29b-41d4-a716-446655440002', // Example UUID
      location: 'Delhi',
      category: 'Kitchen',
      date: 'February 2024',
      image: 'https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Classic Indian kitchen design with modern functionality.',
      materials: ['Granite Counters', 'Sheesham Wood', 'Brass Hardware'],
      projectId: 'proj2',
      is_approved: true
    },
    {
      id: 'mock-3',
      title: 'Minimalist Bedroom',
      designer: 'Anita Desai',
      designerId: '550e8400-e29b-41d4-a716-446655440003', // Example UUID
      location: 'Bangalore',
      category: 'Bedroom',
      date: 'April 2024',
      image: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Serene bedroom with clean aesthetics and natural materials.',
      materials: ['Bamboo Flooring', 'Linen Fabrics', 'Natural Wood'],
      projectId: 'proj3',
      is_approved: true
    },
    {
      id: 'mock-4',
      title: 'Luxury Dining Room',
      designer: 'Vikram Singh',
      designerId: '550e8400-e29b-41d4-a716-446655440004', // Example UUID
      location: 'Gurgaon',
      category: 'Dining Room',
      date: 'January 2024',
      image: 'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Opulent dining space with crystal chandeliers and marble finishes.',
      materials: ['Carrara Marble', 'Crystal Chandelier', 'Velvet Upholstery'],
      projectId: 'proj4',
      is_approved: true
    },
  ];

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const fetchGalleryItems = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('shared_gallery_items')
        .select(`
          *,
          designer:designers(id, name)
        `)
        .eq('is_approved', false) // Only show approved items
        .order('created_at', { ascending: false });

      if (error) throw error;
		
	  let item = null;
	  item = data;
      const sharedItems: GalleryItem[] = (data || []).map(item => ({
        id: item.id,
        title: item.title,
        designer: item.designer?.name || 'Unknown Designer',
        designerId: item.designer?.designer_id || '',
        location: item.location,
        category: item.category,
        date: new Date(item.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        image: item.image_url,
        description: item.description || '',
        is_approved: item.is_approved
      }));
      
      // Combine mock data with fetched data
      setAllGalleryItems([...mockGalleryItems, ...sharedItems]);

    } catch (error: any) {
      console.error('Error fetching gallery items:', error);
      setError(error.message || 'Failed to load gallery items');
      // Fallback to only mock data if there's an error
      setAllGalleryItems(mockGalleryItems);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = selectedCategory === 'All' 
    ? allGalleryItems 
    : allGalleryItems.filter(item => item.category === selectedCategory);

  const shareDesigner = async (item: GalleryItem) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${item.title} by ${item.designer}`,
          text: `Check out this amazing design project: "${item.title}" by ${item.designer} on TheHomeDesigners!`,
          url: `${window.location.origin}/gallery` // Or a specific project detail page if available
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/gallery`);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading gallery...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-lg mb-4">
            <p className="font-medium">Error loading gallery</p>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={fetchGalleryItems}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-secondary-800 mb-4">
                Design Gallery
              </h1>
              <p className="text-lg text-gray-600">
                Explore our collection of stunning interior designs. Get inspired by detailed work from across India.
              </p>
            </div>
            {user && isDesigner && (
              <button
                onClick={() => navigate('/share-photo')}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Share Your Photo</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-primary-50 hover:text-primary-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div 
              key={item.id}
              className="group relative bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedImage(item)}
            >
              <div className="relative overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <ZoomIn className="w-8 h-8 text-white" />
                </div>
                <div className="absolute top-3 right-3">
                  <span className="bg-primary-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                    {item.category}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-semibold text-secondary-800 mb-2 group-hover:text-primary-600 transition-colors">
                  {item.title}
                </h3>
                
                <div className="flex items-center space-x-2 mb-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <Link to={`/designers/${item.designerId}`} className="hover:text-primary-600">
                    <span>{item.designer}</span>
                  </Link>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{item.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{item.date}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No images found in this category.
            </p>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh] bg-white rounded-xl overflow-hidden">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white rounded-full p-2 transition-colors"
            >
              <X className="w-6 h-6 text-gray-800" />
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
              <div className="lg:col-span-2 relative">
                <img
                  src={selectedImage.image}
                  alt={selectedImage.title}
                  className="w-full h-64 lg:h-full object-cover"
                />
              </div>

              <div className="p-6 overflow-y-auto">
                <h2 className="text-2xl font-bold text-secondary-800 mb-4">
                  {selectedImage.title}
                </h2>

                <p className="text-gray-600 mb-6">
                  {selectedImage.description}
                </p>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-primary-600" />
                    <div>
                      <p className="font-medium text-secondary-800">{selectedImage.designer}</p>
                      <p className="text-sm text-gray-600">Interior Designer</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-primary-600" />
                    <span className="text-gray-700">{selectedImage.location}</span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-primary-600" />
                    <span className="text-gray-700">{selectedImage.date}</span>
                  </div>
                </div>

                {selectedImage.materials && selectedImage.materials.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-secondary-800 mb-3">Materials Used</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedImage.materials.map((material: string, index: number) => (
                        <span key={index} className="bg-accent-100 text-accent-800 px-3 py-1 rounded-full text-sm">
                          {material}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
                    <Heart className="w-4 h-4" />
                    <span>Save</span>
                  </button>
                  <button 
                    onClick={() => shareDesigner(selectedImage)}
                    className="flex-1 bg-secondary-500 hover:bg-secondary-600 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;