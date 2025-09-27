import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, User, Filter, Tag, IndianRupee as Rupee, Star, Award, Clock, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface CompletedProject {
  id: string;
  project_name: string;
  property_type: string;
  project_area: string | null;
  budget_range: string;
  timeline: string;
  requirements: string;
  location: string;
  room_types: string[];
  layout_image_url: string | null;
  assignment_status: string;
  created_at: string;
  updated_at: string;
  assigned_designer: {
    id: string;
    name: string;
    email: string;
    specialization: string;
    profile_image: string | null;
    rating: number;
    total_reviews: number;
    experience: number;
  } | null;
  accepted_quote: {
    id: string;
    total_amount: number;
    acceptance_date: string;
    title: string;
  } | null;
}

const Projects = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBudget, setSelectedBudget] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [projects, setProjects] = useState<CompletedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categories = ['All', 'Residential', 'Commercial', 'Office', 'Retail'];
  const budgetRanges = ['Under ₹5 Lakhs', '₹5-10 Lakhs', '₹10-20 Lakhs', '₹20-50 Lakhs', 'Above ₹50 Lakhs'];
  const locations = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur'];

  useEffect(() => {
    fetchCompletedProjects();
  }, []);

  const fetchCompletedProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch completed projects with designer information and accepted quotes
      const { data: projectsData, error: projectsError } = await supabase
        .from('customers')
        .select(`
          id,
          project_name,
          property_type,
          project_area,
          budget_range,
          timeline,
          requirements,
          location,
          room_types,
          layout_image_url,
          assignment_status,
          created_at,
          updated_at,
          assigned_designer:designers(
            id,
            name,
            email,
            specialization,
            profile_image,
            rating,
            total_reviews,
            experience
          )
        `)
        .eq('assignment_status', 'completed')
        .not('assigned_designer_id', 'is', null)
        .order('updated_at', { ascending: false });

      if (projectsError) throw projectsError;

      // For each project, fetch the accepted quote if any
      const projectsWithQuotes = await Promise.all(
        (projectsData || []).map(async (project) => {
          const { data: quoteData, error: quoteError } = await supabase
            .from('designer_quotes')
            .select('id, total_amount, acceptance_date, title')
            .eq('project_id', project.id)
            .eq('customer_accepted', true)
            .eq('status', 'accepted')
            .maybeSingle();

          if (quoteError) {
            console.error('Error fetching quote for project:', project.id, quoteError);
          }

          return {
            ...project,
            accepted_quote: quoteData
          };
        })
      );

      setProjects(projectsWithQuotes);
    } catch (error: any) {
      console.error('Error fetching completed projects:', error);
      setError(error.message || 'Failed to load completed projects');
    } finally {
      setLoading(false);
    }
  };

  const getProjectCategory = (propertyType: string): string => {
    if (propertyType.toLowerCase().includes('apartment') || 
        propertyType.toLowerCase().includes('villa') || 
        propertyType.toLowerCase().includes('house') ||
        propertyType.toLowerCase().includes('duplex') ||
        propertyType.toLowerCase().includes('penthouse') ||
        propertyType.toLowerCase().includes('studio')) {
      return 'Residential';
    } else if (propertyType.toLowerCase().includes('office')) {
      return 'Office';
    } else if (propertyType.toLowerCase().includes('commercial')) {
      return 'Commercial';
    } else {
      return 'Residential'; // Default
    }
  };

  const getBudgetValue = (budgetRange: string): number => {
    // Extract numeric value for filtering
    const match = budgetRange.match(/₹(\d+)/);
    if (match) {
      return parseInt(match[1]) * (budgetRange.includes('Lakhs') ? 100000 : 1);
    }
    return 0;
  };

  const filteredProjects = projects.filter(project => {
    const projectCategory = getProjectCategory(project.property_type);
    const matchesCategory = selectedCategory === 'All' || projectCategory === selectedCategory;
    
    const budgetValue = getBudgetValue(project.budget_range);
    const matchesBudget = !selectedBudget || (
      (selectedBudget === 'Under ₹5 Lakhs' && budgetValue < 500000) ||
      (selectedBudget === '₹5-10 Lakhs' && budgetValue >= 500000 && budgetValue <= 1000000) ||
      (selectedBudget === '₹10-20 Lakhs' && budgetValue > 1000000 && budgetValue <= 2000000) ||
      (selectedBudget === '₹20-50 Lakhs' && budgetValue > 2000000 && budgetValue <= 5000000) ||
      (selectedBudget === 'Above ₹50 Lakhs' && budgetValue > 5000000)
    );

    const matchesLocation = !selectedLocation || project.location === selectedLocation;

    return matchesCategory && matchesBudget && matchesLocation;
  });

  const formatCompletionDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getProjectDuration = (createdAt: string, updatedAt: string) => {
    const start = new Date(createdAt);
    const end = new Date(updatedAt);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} days`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} year${years > 1 ? 's' : ''}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading completed projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-lg mb-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <p className="font-medium">Error loading projects</p>
            </div>
            <p className="text-sm mt-1">{error}</p>
          </div>
          <button
            onClick={fetchCompletedProjects}
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
          <h1 className="text-3xl lg:text-4xl font-bold text-secondary-800 mb-4">
            Project Portfolio
          </h1>
          <p className="text-lg text-gray-600">
            Explore stunning interior design projects completed by our expert designers across India.
          </p>
          <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
            <span>Showing {filteredProjects.length} of {projects.length} completed projects</span>
            <span>•</span>
            <span>Updated in real-time</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-secondary-800">Filter Projects</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Locations</option>
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedBudget('');
                  setSelectedLocation('');
                }}
                className="w-full text-primary-600 hover:text-primary-700 font-medium py-2"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-xl shadow-lg p-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-12 h-12 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-secondary-800 mb-4">No Completed Projects Yet</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Completed projects will appear here automatically when designers mark them as completed. 
                Check back soon to see our latest work!
              </p>
              <Link to="/designers" className="btn-primary">
                Browse Designers
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <div key={project.id} className="card overflow-hidden group">
                <div className="relative">
                  <img
                    src={project.layout_image_url || 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800'}
                    alt={project.project_name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                      <Award className="w-3 h-3" />
                      <span>Completed</span>
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {getProjectCategory(project.property_type)}
                    </span>
                  </div>
                  {project.accepted_quote && (
                    <div className="absolute bottom-4 right-4">
                      <span className="bg-white/90 text-secondary-800 px-3 py-1 rounded-full text-sm font-medium">
                        ₹{project.accepted_quote.total_amount.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-semibold text-secondary-800 mb-2 group-hover:text-primary-600 transition-colors">
                    {project.project_name}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {project.requirements}
                  </p>

                  {/* Designer Info */}
                  {project.assigned_designer && (
                    <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                        {project.assigned_designer.profile_image ? (
                          <img
                            src={project.assigned_designer.profile_image}
                            alt={project.assigned_designer.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <Link 
                          to={`/designers/${project.assigned_designer.id}`}
                          className="font-medium text-primary-600 hover:text-primary-700 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {project.assigned_designer.name}
                        </Link>
                        <p className="text-sm text-gray-600">{project.assigned_designer.specialization}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < Math.floor(project.assigned_designer!.rating)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">
                            {project.assigned_designer.rating.toFixed(1)} ({project.assigned_designer.total_reviews})
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 mb-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>{project.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Rupee className="w-4 h-4" />
                      <span>{project.budget_range}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>Duration: {getProjectDuration(project.created_at, project.updated_at)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Completed: {formatCompletionDate(project.updated_at)}</span>
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Property Type:</span>
                      <span className="font-medium text-secondary-800">{project.property_type}</span>
                    </div>
                    {project.project_area && (
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Area:</span>
                        <span className="font-medium text-secondary-800">{project.project_area}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Timeline:</span>
                      <span className="font-medium text-secondary-800">{project.timeline}</span>
                    </div>
                  </div>

                  {/* Room Types */}
                  {project.room_types && project.room_types.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Rooms Designed:</p>
                      <div className="flex flex-wrap gap-1">
                        {project.room_types.slice(0, 3).map((room, index) => (
                          <span key={index} className="bg-accent-100 text-accent-800 px-2 py-1 rounded-md text-xs">
                            {room}
                          </span>
                        ))}
                        {project.room_types.length > 3 && (
                          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs">
                            +{project.room_types.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Accepted Quote Info */}
                  {project.accepted_quote && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-800">Project Value</p>
                          <p className="text-lg font-bold text-green-700">
                            ₹{project.accepted_quote.total_amount.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-green-600">
                            Completed on {formatCompletionDate(project.accepted_quote.acceptance_date)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <Link
                    to={`/project-detail/${project.id}`}
                    className="block w-full bg-primary-500 hover:bg-primary-600 text-white text-center py-3 rounded-lg font-medium transition-colors"
                  >
                    View Project Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredProjects.length === 0 && projects.length > 0 && (
          <div className="text-center py-12">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-secondary-800 mb-4">No Projects Match Your Filters</h2>
              <p className="text-gray-600 mb-6">
                Try adjusting your search criteria to see more completed projects.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedBudget('');
                  setSelectedLocation('');
                }}
                className="btn-primary"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}

        {/* Call to Action */}
        {projects.length > 0 && (
          <div className="bg-gradient-to-r from-primary-500 to-secondary-600 rounded-xl p-8 mt-12 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Inspired by these projects?
            </h2>
            <p className="text-primary-100 mb-6">
              Start your own interior design journey with our expert designers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/designers"
                className="bg-white text-primary-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Browse Designers
              </Link>
              <Link
                to="/register-customer"
                className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Start Your Project
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;