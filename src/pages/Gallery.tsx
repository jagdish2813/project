import React, { useState } from 'react';
import { X, ZoomIn, Heart, Share2, Download, Calendar, MapPin, User } from 'lucide-react';

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const galleryItems = [
    {
      id: 1,
      title: 'Modern Living Room',
      designer: 'Priya Sharma',
      designerId: 1,
      location: 'Mumbai',
      category: 'Living Room',
      date: 'March 2024',
      image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'A contemporary living space with clean lines and neutral tones.',
      materials: ['Italian Marble', 'Teak Wood', 'LED Lighting'],
      projectId: 1
    },
    {
      id: 2,
      title: 'Traditional Kitchen',
      designer: 'Rajesh Kumar',
      designerId: 2,
      location: 'Delhi',
      category: 'Kitchen',
      date: 'February 2024',
      image: 'https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Classic Indian kitchen design with modern functionality.',
      materials: ['Granite Counters', 'Sheesham Wood', 'Brass Hardware'],
      projectId: 2
    },
    {
      id: 3,
      title: 'Minimalist Bedroom',
      designer: 'Anita Desai',
      designerId: 3,
      location: 'Bangalore',
      category: 'Bedroom',
      date: 'April 2024',
      image: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Serene bedroom with clean aesthetics and natural materials.',
      materials: ['Bamboo Flooring', 'Linen Fabrics', 'Natural Wood'],
      projectId: 3
    },
    {
      id: 4,
      title: 'Luxury Dining Room',
      designer: 'Vikram Singh',
      designerId: 4,
      location: 'Gurgaon',
      category: 'Dining Room',
      date: 'January 2024',
      image: 'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Opulent dining space with crystal chandeliers and marble finishes.',
      materials: ['Carrara Marble', 'Crystal Chandelier', 'Velvet Upholstery'],
      projectId: 4
    },
    {
      id: 5,
      title: 'Eco-Friendly Bathroom',
      designer: 'Meera Reddy',
      designerId: 5,
      location: 'Hyderabad',
      category: 'Bathroom',
      date: 'March 2024',
      image: 'https://images.pexels.com/photos/1571461/pexels-photo-1571461.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Sustainable bathroom design with natural materials.',
      materials: ['Bamboo Vanity', 'Natural Stone', 'Cork Flooring'],
      projectId: 5
    },
    {
      id: 6,
      title: 'Industrial Office Space',
      designer: 'Arjun Patel',
      designerId: 6,
      location: 'Pune',
      category: 'Office',
      date: 'February 2024',
      image: 'https://images.pexels.com/photos/1599791/pexels-photo-1599791.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Urban office with exposed elements and industrial aesthetics.',
      materials: ['Exposed Brick', 'Steel Frames', 'Concrete Floors'],
      projectId: 6
    },
    {
      id: 7,
      title: 'Contemporary Entryway',
      designer: 'Priya Sharma',
      designerId: 1,
      location: 'Mumbai',
      category: 'Entryway',
      date: 'March 2024',
      image: 'https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Welcoming entrance with modern design elements.',
      materials: ['Marble Flooring', 'Glass Partitions', 'LED Strips'],
      projectId: 1
    },
    {
      id: 8,
      title: 'Traditional Pooja Room',
      designer: 'Rajesh Kumar',
      designerId: 2,
      location: 'Delhi',
      category: 'Pooja Room',
      date: 'February 2024',
      image: 'https://images.pexels.com/photos/1571459/pexels-photo-1571459.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Sacred space with traditional Indian design elements.',
      materials: ['Teak Wood', 'Brass Idols', 'Marble Platform'],
      projectId: 2
    }
  ];

  const categories = ['All', 'Living Room', 'Kitchen', 'Bedroom', 'Dining Room', 'Bathroom', 'Office', 'Entryway', 'Pooja Room'];

  const filteredItems = selectedCategory === 'All' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-secondary-800 mb-4">
            Design Gallery
          </h1>
          <p className="text-lg text-gray-600">
            Explore our collection of stunning interior designs. Get inspired by detailed work from across India.
          </p>
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
                  <span>{item.designer}</span>
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

                <div className="flex space-x-3">
                  <button className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
                    <Heart className="w-4 h-4" />
                    <span>Save</span>
                  </button>
                  <button className="flex-1 bg-secondary-500 hover:bg-secondary-600 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
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