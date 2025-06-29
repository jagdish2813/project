import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, User, Filter, Tag, Rupee } from 'lucide-react';

const Projects = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBudget, setSelectedBudget] = useState('');

  const projects = [
    {
      id: 1,
      title: 'Modern Mumbai Apartment',
      designer: 'Priya Sharma',
      designerId: 1,
      category: 'Residential',
      location: 'Mumbai',
      budget: '₹8,50,000',
      duration: '3 months',
      completedDate: 'March 2024',
      area: '1,200 sq ft',
      image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'A contemporary 3BHK apartment with clean lines, neutral palette, and smart storage solutions.',
      materials: ['Italian Marble', 'Teak Wood', 'Quartz Countertops', 'LED Lighting'],
      tags: ['Modern', 'Minimalist', '3BHK']
    },
    {
      id: 2,
      title: 'Traditional Delhi Villa',
      designer: 'Rajesh Kumar',
      designerId: 2,
      category: 'Residential',
      location: 'Delhi',
      budget: '₹15,00,000',
      duration: '5 months',
      completedDate: 'February 2024',
      area: '2,500 sq ft',
      image: 'https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Classic Indian villa design with traditional elements and modern amenities.',
      materials: ['Rajasthani Stone', 'Sheesham Wood', 'Brass Fixtures', 'Handwoven Textiles'],
      tags: ['Traditional', 'Villa', 'Indian']
    },
    {
      id: 3,
      title: 'Minimalist Bangalore Home',
      designer: 'Anita Desai',
      designerId: 3,
      category: 'Residential',
      location: 'Bangalore',
      budget: '₹6,00,000',
      duration: '2 months',
      completedDate: 'April 2024',
      area: '900 sq ft',
      image: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Zen-inspired minimalist design with clean lines and natural materials.',
      materials: ['Bamboo Flooring', 'White Oak', 'Natural Stone', 'Linen Fabrics'],
      tags: ['Minimalist', 'Zen', '2BHK']
    },
    {
      id: 4,
      title: 'Luxury Gurgaon Penthouse',
      designer: 'Vikram Singh',
      designerId: 4,
      category: 'Residential',
      location: 'Gurgaon',
      budget: '₹25,00,000',
      duration: '8 months',
      completedDate: 'January 2024',
      area: '3,500 sq ft',
      image: 'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Opulent penthouse with premium finishes and bespoke furniture.',
      materials: ['Carrara Marble', 'Walnut Veneer', 'Crystal Chandeliers', 'Silk Wallpapers'],
      tags: ['Luxury', 'Penthouse', 'Premium']
    },
    {
      id: 5,
      title: 'Eco-Friendly Hyderabad House',
      designer: 'Meera Reddy',
      designerId: 5,
      category: 'Residential',
      location: 'Hyderabad',
      budget: '₹7,50,000',
      duration: '4 months',
      completedDate: 'March 2024',
      area: '1,800 sq ft',
      image: 'https://images.pexels.com/photos/1571461/pexels-photo-1571461.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Sustainable design using eco-friendly materials and energy-efficient solutions.',
      materials: ['Reclaimed Wood', 'Cork Flooring', 'Solar Panels', 'Organic Cotton'],
      tags: ['Eco-Friendly', 'Sustainable', 'Green']
    },
    {
      id: 6,
      title: 'Industrial Pune Loft',
      designer: 'Arjun Patel',
      designerId: 6,
      category: 'Residential',
      location: 'Pune',
      budget: '₹9,00,000',
      duration: '3.5 months',
      completedDate: 'February 2024',
      area: '1,400 sq ft',
      image: 'https://images.pexels.com/photos/1599791/pexels-photo-1599791.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Industrial-style loft with exposed brick, metal elements, and urban aesthetics.',
      materials: ['Exposed Brick', 'Steel Beams', 'Concrete Floors', 'Edison Bulbs'],
      tags: ['Industrial', 'Loft', 'Urban']
    }
  ];

  const categories = ['Residential', 'Commercial', 'Office', 'Retail'];
  const budgetRanges = ['Under ₹5L', '₹5L - ₹10L', '₹10L - ₹20L', 'Above ₹20L'];

  const filteredProjects = projects.filter(project => {
    const matchesCategory = !selectedCategory || project.category === selectedCategory;
    const matchesBudget = !selectedBudget || (
      (selectedBudget === 'Under ₹5L' && parseInt(project.budget.replace(/[₹,]/g, '')) < 500000) ||
      (selectedBudget === '₹5L - ₹10L' && parseInt(project.budget.replace(/[₹,]/g, '')) >= 500000 && parseInt(project.budget.replace(/[₹,]/g, '')) <= 1000000) ||
      (selectedBudget === '₹10L - ₹20L' && parseInt(project.budget.replace(/[₹,]/g, '')) > 1000000 && parseInt(project.budget.replace(/[₹,]/g, '')) <= 2000000) ||
      (selectedBudget === 'Above ₹20L' && parseInt(project.budget.replace(/[₹,]/g, '')) > 2000000)
    );

    return matchesCategory && matchesBudget;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-secondary-800 mb-4">
            Project Portfolio
          </h1>
          <p className="text-lg text-gray-600">
            Explore stunning interior design projects completed by our expert designers across India.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-secondary-800">Filter Projects</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Budget Range</label>
              <select
                value={selectedBudget}
                onChange={(e) => setSelectedBudget(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Budgets</option>
                {budgetRanges.map(range => (
                  <option key={range} value={range}>{range}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setSelectedBudget('');
                }}
                className="w-full text-primary-600 hover:text-primary-700 font-medium py-2"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <Link key={project.id} to={`/projects/${project.id}`} className="card overflow-hidden group">
              <div className="relative">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {project.category}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="bg-white/90 text-secondary-800 px-3 py-1 rounded-full text-sm font-medium">
                    {project.budget}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-semibold text-secondary-800 mb-2 group-hover:text-primary-600 transition-colors">
                  {project.title}
                </h3>
                
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {project.description}
                </p>

                <div className="flex items-center space-x-2 mb-3 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <Link 
                    to={`/designers/${project.designerId}`}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {project.designer}
                  </Link>
                </div>

                <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{project.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{project.completedDate}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-600">{project.area}</span>
                  <span className="text-sm text-gray-600">{project.duration}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {project.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="bg-accent-100 text-accent-800 px-2 py-1 rounded-md text-xs font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No projects found matching your criteria. Try adjusting your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;