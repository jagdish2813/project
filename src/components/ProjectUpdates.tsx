import React, { useState, useEffect } from 'react';
import { Calendar, Clock, FileText, Camera, ChevronDown, ChevronRight, User, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

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
  designer?: {
    name: string;
    email: string;
    specialization: string;
  };
}

interface ProjectUpdatesProps {
  projectId: string;
  refreshTrigger?: number;
}

const ProjectUpdates: React.FC<ProjectUpdatesProps> = ({ projectId, refreshTrigger = 0 }) => {
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
          designer:designers(name, email, specialization)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setUpdates(data || []);
      
      // Auto-expand the most recent update if there are any
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
    setExpandedUpdates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(updateId)) {
        newSet.delete(updateId);
      } else {
        newSet.add(updateId);
      }
      return newSet;
    });
  };

  const getUpdateTypeIcon = (type: string) => {
    switch (type) {
      case 'progress_report':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'photo_update':
        return <Camera className="w-5 h-5 text-green-500" />;
      case 'milestone':
        return <Calendar className="w-5 h-5 text-purple-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
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
        return 'Update';
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-lg flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-medium">Error loading project updates</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (updates.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Updates Yet</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          The designer hasn't posted any updates for this project yet. Updates will appear here once they're available.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {updates.map((update) => (
        <div key={update.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          {/* Update Header */}
          <div 
            className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => toggleUpdate(update.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  {getUpdateTypeIcon(update.update_type)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-secondary-800">{update.title}</h3>
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                      {getUpdateTypeLabel(update.update_type)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>{update.designer?.name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(update.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                {expandedUpdates.has(update.id) ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </div>
          </div>

          {/* Update Content */}
          {expandedUpdates.has(update.id) && (
            <div className="p-4 pt-0 border-t border-gray-100">
              {/* Progress Percentage */}
              {update.update_type === 'progress_report' && update.completion_percentage !== null && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Project Completion</span>
                    <span className="text-sm font-medium text-primary-600">{update.completion_percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-primary-500 h-2.5 rounded-full" 
                      style={{ width: `${update.completion_percentage}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Description */}
              {update.description && (
                <div className="mb-4">
                  <p className="text-gray-600 whitespace-pre-wrap">{update.description}</p>
                </div>
              )}

              {/* Photos */}
              {update.photos && update.photos.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Photos</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {update.photos.map((photo, index) => (
                      <a 
                        key={index} 
                        href={photo} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block aspect-square rounded-lg overflow-hidden border border-gray-200 hover:opacity-90 transition-opacity"
                      >
                        <img
                          src={photo}
                          alt={`Update photo ${index + 1}`}
                          className="w-full h-full object-cover"
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
  );
};

export default ProjectUpdates;