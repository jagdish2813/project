import React, { useState, useEffect } from 'react';
import { Camera, Clock, User, Calendar, ChevronDown, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useDesignerProfile } from '../hooks/useDesignerProfile';

interface ProjectUpdate {
  id: string;
  project_id: string;
  designer_id: string;
  title: string;
  description: string;
  update_type: 'progress_report' | 'photo_update' | 'milestone';
  photos: string[];
  completion_percentage: number | null;
  created_at: string;
  updated_at: string;
  designer: {
    name: string;
    email: string;
  };
}

interface ProjectUpdatesProps {
  projectId: string;
  refreshTrigger?: number;
}

const ProjectUpdates: React.FC<ProjectUpdatesProps> = ({ projectId, refreshTrigger = 0 }) => {
  const { user } = useAuth();
  const { isDesigner } = useDesignerProfile();
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedUpdates, setExpandedUpdates] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (projectId) {
      fetchUpdates();
    }
  }, [projectId, refreshTrigger]);

  const fetchUpdates = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('project_updates')
        .select(`
          *,
          designer:designers(name, email)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setUpdates(data || []);
      
      // Auto-expand the most recent update
      if (data && data.length > 0) {
        setExpandedUpdates(new Set([data[0].id]));
      }
    } catch (error: any) {
      console.error('Error fetching project updates:', error);
      setError(error.message || 'Failed to load project updates');
    } finally {
      setLoading(false);
    }
  };

  const toggleUpdate = (updateId: string) => {
    const newExpanded = new Set(expandedUpdates);
    if (newExpanded.has(updateId)) {
      newExpanded.delete(updateId);
    } else {
      newExpanded.add(updateId);
    }
    setExpandedUpdates(newExpanded);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUpdateTypeLabel = (type: string) => {
    switch (type) {
      case 'progress_report':
        return 'Progress Report';
      case 'photo_update':
        return 'Photo Update';
      case 'milestone':
        return 'Milestone';
      default:
        return type;
    }
  };

  const getUpdateTypeColor = (type: string) => {
    switch (type) {
      case 'progress_report':
        return 'bg-blue-100 text-blue-800';
      case 'photo_update':
        return 'bg-green-100 text-green-800';
      case 'milestone':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-secondary-800 mb-4">Project Updates</h3>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-secondary-800 mb-4">Project Updates</h3>
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-secondary-800 mb-6 flex items-center">
        <Clock className="w-5 h-5 mr-2 text-primary-600" />
        Project Updates
      </h3>

      {updates.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Updates Yet</h4>
          <p className="text-gray-500">
            {isDesigner 
              ? "Share your progress by adding updates, photos, and milestones."
              : "The designer hasn't posted any updates yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {updates.map((update) => (
            <div key={update.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <div 
                className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => toggleUpdate(update.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {expandedUpdates.has(update.id) ? (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUpdateTypeColor(update.update_type)}`}>
                        {getUpdateTypeLabel(update.update_type)}
                      </span>
                    </div>
                    
                    <h4 className="font-medium text-secondary-800">{update.title}</h4>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    {formatDate(update.created_at)}
                  </div>
                </div>
              </div>

              {expandedUpdates.has(update.id) && (
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2 mb-4 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span>Posted by {update.designer?.name}</span>
                    <span>•</span>
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(update.created_at)}</span>
                  </div>
                  
                  {update.description && (
                    <div className="mb-4">
                      <p className="text-gray-700 whitespace-pre-line">{update.description}</p>
                    </div>
                  )}
                  
                  {update.completion_percentage !== null && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Project Completion: {update.completion_percentage}%
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-primary-500 h-2.5 rounded-full" 
                          style={{ width: `${update.completion_percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {update.photos && update.photos.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Photos:</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {update.photos.map((photo, index) => (
                          <a 
                            key={index} 
                            href={photo} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block rounded-lg overflow-hidden border border-gray-200 hover:border-primary-500 transition-colors"
                          >
                            <img 
                              src={photo} 
                              alt={`Update photo ${index + 1}`} 
                              className="w-full h-32 object-cover"
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectUpdates;