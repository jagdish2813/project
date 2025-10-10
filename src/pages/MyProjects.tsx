import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, MapPin, IndianRupee as Rupee, Clock, Edit, Eye, Trash2, AlertCircle, Send, Activity, Compass, FileText, CheckCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import type { Customer } from '../lib/supabase';
import AssignProjectModal from '../components/AssignProjectModal';
import SendToDesignerModal from '../components/SendToDesignerModal';
import VastuAnalysisModal from '../components/VastuAnalysisModal';

const MyProjects = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Customer | null>(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showVastuModal, setShowVastuModal] = useState(false);
  const [acceptedQuotes, setAcceptedQuotes] = useState<any[]>([]);
  const [projectQuotes, setProjectQuotes] = useState<Record<string, any>>({});

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      navigate('/');
      return;
    }
    
    fetchProjects();
  }, [user, authLoading, navigate]);

  const fetchProjects = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('customers')
        .select(`
          id, name, email, phone, location, project_name, property_type, project_area, 
          budget_range, timeline, requirements, preferred_designer, layout_image_url, 
          inspiration_links, room_types, special_requirements, status, created_at, 
          updated_at, version, assigned_designer_id, assignment_status, last_modified_by,
          assigned_designer:designers(id, name, email, specialization)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        throw error;
      }

      setProjects(data || []);
      
      // Fetch accepted quotes for these projects
      if (data && data.length > 0) {
        const projectIds = data.map(p => p.id);
        const { data: quotesData, error: quotesError } = await supabase
          .from('designer_quotes')
          .select('*')
          .in('project_id', projectIds)
          .eq('customer_accepted', true)
          .eq('status', 'accepted');
          
        if (quotesError) {
          console.error('Error fetching quotes:', quotesError);
        } else {
          setAcceptedQuotes(quotesData || []);
        }
      }
      
      // Fetch accepted quotes for each project
      if (data && data.length > 0) {
        const projectIds = data.map(p => p.id);
        const { data: quotesData, error: quotesError } = await supabase
          .from('designer_quotes')
          .select('*')
          .in('project_id', projectIds)
          .eq('customer_accepted', true)
          .eq('status', 'accepted');
          
        if (quotesError) {
          console.error('Error fetching quotes:', quotesError);
        } else if (quotesData) {
          // Create a map of project_id to quote
          const quotesMap: Record<string, any> = {};
          quotesData.forEach(quote => {
            quotesMap[quote.project_id] = quote;
          });
          setProjectQuotes(quotesMap);
        }
      }
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      setError(error.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', projectId)
        .eq('user_id', user?.id); // Extra security check

      if (error) throw error;

      // Remove from local state
      setProjects(prev => prev.filter(p => p.id !== projectId));
    } catch (error: any) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project: ' + error.message);
    }
  };

  const handleAssignToDesigner = (project: Customer) => {
    setSelectedProject(project);
    setShowAssignModal(true);
  };

  const handleSendToDesigner = (project: Customer) => {
    setSelectedProject(project);
    setShowSendModal(true);
  };

  const handleVastuAnalysis = (project: Customer) => {
    setSelectedProject(project);
    setShowVastuModal(true);
  };

  const handleAssignSuccess = () => {
    fetchProjects(); // Refresh the projects list
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-orange-100 text-orange-800';
      case 'finalized':
        return 'bg-purple-100 text-purple-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string, hasDesigner: boolean) => {
    if (!status || status === 'unassigned') {
      return hasDesigner ? 'Assigned' : 'Unassigned';
    }
    switch (status.toLowerCase()) {
      case 'assigned':
        return 'Assigned';
      case 'pending':
        return 'Pending';
      case 'finalized':
        return 'Finalized';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-secondary-800 mb-4">Please sign in to view your projects</h2>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-lg mb-4">
            <p className="font-medium">Error loading projects</p>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={fetchProjects}
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
                My Projects
              </h1>
              <p className="text-lg text-gray-600">
                Manage and track your interior design projects
              </p>
            </div>
            <button
              onClick={() => navigate('/register-customer')}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>New Project</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-xl shadow-lg p-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Plus className="w-12 h-12 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-secondary-800 mb-4">No Projects Yet</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Start your interior design journey by registering your first project. 
                Our expert designers are ready to bring your vision to life.
              </p>
              <button
                onClick={() => navigate('/register-customer')}
                className="btn-primary"
              >
                Register Your First Project
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                {/* Project Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-semibold text-secondary-800 line-clamp-2">
                      {project.project_name}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.assignment_status || 'unassigned')}`}>
                      {getStatusText(project.assignment_status || 'unassigned', !!(project as any).assigned_designer)}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {project.requirements}
                  </p>

                  <div className="space-y-2 text-sm text-gray-600">
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
                      <span>{project.timeline}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Designer Info */}
                {(project as any).assigned_designer && (
                  <div className="px-6 py-4 bg-green-50 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <Send className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-green-800">
                          Assigned to {(project as any).assigned_designer.name}
                        </p>
                        <p className="text-sm text-green-600">
                          {(project as any).assigned_designer.specialization}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Accepted Quote Information */}
                {projectQuotes[project.id] && (
                  <div className="px-6 py-4 bg-green-50 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-green-800">
                          Accepted Quote: {projectQuotes[project.id].title}
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          <p className="text-sm text-green-700 font-medium">
                            ₹{projectQuotes[project.id].total_amount.toLocaleString()}
                          </p>
                          <p className="text-xs text-green-600">
                            Accepted on {new Date(projectQuotes[project.id].acceptance_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Project Details */}
                <div className="p-6">
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Property:</span> {project.property_type}
                    </p>
                    {project.project_area && (
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Area:</span> {project.project_area}
                      </p>
                    )}
                    {project.preferred_designer && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Preferred Designer:</span> {project.preferred_designer}
                      </p>
                    )}
                  </div>

                  {/* Room Types */}
                  {project.room_types && project.room_types.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Rooms:</p>
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
                  {acceptedQuotes.find(q => q.project_id === project.id) && (
                    <div className="px-6 py-4 bg-green-50 border-b border-gray-100">
                      <div className="flex items-center space-x-3 hover:bg-green-100 p-2 rounded-lg transition-colors">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <FileText className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-green-800 flex items-center space-x-2">
                            <span>Accepted Quote: ₹{acceptedQuotes.find(q => q.project_id === project.id).total_amount.toLocaleString()}</span>
                            <CheckCircle className="w-4 h-4" />
                          </p>
                          <p className="text-sm text-green-600">
                            Accepted on {new Date(acceptedQuotes.find(q => q.project_id === project.id).acceptance_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="ml-auto">
                          <button
                            onClick={() => navigate(`/project-detail/${project.id}`)}
                            className="text-green-700 hover:text-green-800 text-sm font-medium"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => navigate(`/project-detail/${project.id}`)}
                        className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-1"
                      >
                        <Activity className="w-4 h-4" />
                        <span>View Details</span>
                      </button>
                      {projectQuotes[project.id] && (
                        <button
                          onClick={() => navigate(`/generate-quote/${project.id}`)}
                          className="bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg font-medium transition-colors"
                          title="View Quote"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      )}
                      {project.layout_image_url && (
                        <button
                          onClick={() => handleVastuAnalysis(project)}
                          className="bg-accent-500 hover:bg-accent-600 text-white py-2 px-3 rounded-lg font-medium transition-colors"
                          title="Vastu Analysis"
                        >
                          <Compass className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/edit-project/${project.id}`)}
                        className="bg-secondary-500 hover:bg-secondary-600 text-white py-2 px-3 rounded-lg font-medium transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg font-medium transition-colors"
                        title="Delete Project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {!(project as any).assigned_designer && !projectQuotes[project.id] && (
                      <button
                        onClick={() => handleSendToDesigner(project)}
                        className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                      >
                        <Send className="w-4 h-4" />
                        <span>Send to Designer</span>
                      </button>
                    )}
                    
                    {/* View Quotes Button */}
                    <button
                      onClick={() => navigate('/customer-quotes')}
                      className="w-full bg-secondary-500 hover:bg-secondary-600 text-white py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 mt-2 mb-2"
                    >
                      <FileText className="w-4 h-4" />
                      <span>View Quotes</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assign Project Modal */}
      {selectedProject && (
        <AssignProjectModal
          isOpen={showAssignModal}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedProject(null);
          }}
          project={selectedProject}
          onSuccess={handleAssignSuccess}
        />
      )}
      
      {/* Send to Designer Modal */}
      {selectedProject && (
        <SendToDesignerModal
          isOpen={showSendModal}
          onClose={() => {
            setShowSendModal(false);
            setSelectedProject(null);
          }}
          project={selectedProject}
        />
      )}
      
      {/* Vastu Analysis Modal */}
      {selectedProject && (
        <VastuAnalysisModal
          isOpen={showVastuModal}
          onClose={() => {
            setShowVastuModal(false);
            setSelectedProject(null);
          }}
          projectId={selectedProject.id}
          existingLayoutUrl={selectedProject.layout_image_url || undefined}
        />
      )}
    </div>
  );
};

export default MyProjects;