import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, UserPlus, Clock, MapPin, IndianRupee as Rupee, User, Phone, Mail, AlertCircle, Compass } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useDesignerProfile } from '../hooks/useDesignerProfile';
import { useProjectTracking } from '../hooks/useProjectTracking';
import { supabase } from '../lib/supabase';
import type { Customer } from '../lib/supabase';
import ProjectActivityLog from '../components/ProjectActivityLog';
import ProjectVersionHistory from '../components/ProjectVersionHistory';
import AssignProjectModal from '../components/AssignProjectModal';
import VastuAnalysisModal from '../components/VastuAnalysisModal';

const ProjectDetailWithTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { designer, isDesigner, loading: designerLoading } = useDesignerProfile();
  const { activities, versions, assignments, loading: trackingLoading, refreshData } = useProjectTracking(id);
  
  const [project, setProject] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showVastuModal, setShowVastuModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'activity' | 'versions'>('details');

  useEffect(() => {
    if (id && user && !designerLoading) {
      fetchProject();
    }
  }, [id, user, designerLoading, isDesigner, designer]);

  const fetchProject = async () => {
    if (!id || !user) return;

    try {
      setLoading(true);
      setError(null);

      console.log('Fetching project with ID:', id);
      console.log('User info:', { userId: user.id, isDesigner, designerId: designer?.id });

      // Build query that works with RLS policies
      let query = supabase
        .from('customers')
        .select(`
          *,
          assigned_designer:designers(id, name, email, phone, specialization)
        `)
        .eq('id', id);

      // The RLS policies will automatically filter based on:
      // 1. user_id = uid() for customers
      // 2. assigned_designer_id matching the designer's ID for designers
      // So we don't need to add additional filters here

      const { data, error } = await query.maybeSingle();

      console.log('Query result:', { data, error });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      if (!data) {
        throw new Error('Project not found or you do not have access to this project');
      }

      setProject(data);
    } catch (error: any) {
      console.error('Error fetching project:', error);
      setError(error.message || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignSuccess = () => {
    fetchProject();
    refreshData();
  };

  const isProjectOwner = project?.user_id === user?.id;
  const isAssignedDesigner = isDesigner && project?.assigned_designer_id === designer?.id;
  const canEdit = isProjectOwner || isAssignedDesigner;

  if (loading || designerLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-lg mb-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <p className="font-medium">Error loading project</p>
            </div>
            <p className="text-sm mt-1">{error || 'Project not found'}</p>
          </div>
          <button
            onClick={() => navigate(isDesigner ? '/customer-projects' : '/my-projects')}
            className="btn-primary"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate(isDesigner ? '/customer-projects' : '/my-projects')}
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-secondary-800 mb-2">
                {project.project_name}
              </h1>
              <div className="flex items-center space-x-4 text-gray-600">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{project.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Rupee className="w-4 h-4" />
                  <span>{project.budget_range}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{project.timeline}</span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              {canEdit && (
                <button
                  onClick={() => navigate(`/edit-project/${project.id}`)}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Project</span>
                </button>
              )}
              
              {isProjectOwner && !project.assigned_designer_id && (
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Assign Designer</span>
                </button>
              )}
              
              {project.layout_image_url && (
                <button
                  onClick={() => setShowVastuModal(true)}
                  className="bg-accent-500 hover:bg-accent-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  <Compass className="w-4 h-4" />
                  <span>Vastu Analysis</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {['details', 'activity', 'versions'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                    activeTab === tab
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab === 'details' ? 'Project Details' : tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* Project Status */}
                {project.assigned_designer_id && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800">
                          Assigned to {(project as any).assigned_designer?.name}
                        </p>
                        <p className="text-sm text-green-600">
                          Specialization: {(project as any).assigned_designer?.specialization}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-sm">
                          <a
                            href={`mailto:${(project as any).assigned_designer?.email}`}
                            className="flex items-center space-x-1 text-green-600 hover:text-green-700"
                          >
                            <Mail className="w-3 h-3" />
                            <span>{(project as any).assigned_designer?.email}</span>
                          </a>
                          {(project as any).assigned_designer?.phone && (
                            <a
                              href={`tel:${(project as any).assigned_designer?.phone}`}
                              className="flex items-center space-x-1 text-green-600 hover:text-green-700"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{(project as any).assigned_designer?.phone}</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Project Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-secondary-800 mb-4">Basic Information</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Property Type</p>
                        <p className="text-gray-600">{project.property_type}</p>
                      </div>
                      {project.project_area && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">Project Area</p>
                          <p className="text-gray-600">{project.project_area}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-700">Status</p>
                        <p className="text-gray-600">{project.status}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-secondary-800 mb-4">Contact Information</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Customer Name</p>
                        <p className="text-gray-600">{project.name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Email</p>
                        <p className="text-gray-600">{project.email}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Phone</p>
                        <p className="text-gray-600">{project.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Requirements */}
                <div>
                  <h3 className="text-lg font-semibold text-secondary-800 mb-4">Project Requirements</h3>
                  <p className="text-gray-600 leading-relaxed">{project.requirements}</p>
                </div>

                {/* Room Types */}
                {project.room_types && project.room_types.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-secondary-800 mb-4">Rooms to Design</h3>
                    <div className="flex flex-wrap gap-2">
                      {project.room_types.map((room, index) => (
                        <span key={index} className="bg-accent-100 text-accent-800 px-3 py-1 rounded-full text-sm">
                          {room}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Special Requirements */}
                {project.special_requirements && (
                  <div>
                    <h3 className="text-lg font-semibold text-secondary-800 mb-4">Special Requirements</h3>
                    <p className="text-gray-600 leading-relaxed">{project.special_requirements}</p>
                  </div>
                )}

                {/* Inspiration Links */}
                {project.inspiration_links && project.inspiration_links.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-secondary-800 mb-4">Inspiration Links</h3>
                    <div className="space-y-2">
                      {project.inspiration_links.map((link, index) => (
                        <a
                          key={index}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-primary-600 hover:text-primary-700 text-sm break-all"
                        >
                          {link}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'activity' && (
              <ProjectActivityLog activities={activities} loading={trackingLoading} />
            )}

            {activeTab === 'versions' && (
              <ProjectVersionHistory versions={versions} loading={trackingLoading} />
            )}
          </div>
        </div>
      </div>

      {/* Assign Project Modal */}
      <AssignProjectModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        project={project}
        onSuccess={handleAssignSuccess}
      />
      
      {/* Vastu Analysis Modal */}
      <VastuAnalysisModal
        isOpen={showVastuModal}
        onClose={() => setShowVastuModal(false)}
        projectId={project.id}
        existingLayoutUrl={project.layout_image_url || undefined}
      />
    </div>
  );
};

export default ProjectDetailWithTracking;