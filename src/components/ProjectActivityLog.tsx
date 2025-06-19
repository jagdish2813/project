import React from 'react';
import { Clock, User, Edit, UserPlus, CheckCircle, AlertCircle, FileText, ChevronDown, ChevronRight } from 'lucide-react';
import { ProjectActivity } from '../hooks/useProjectTracking';

interface ProjectActivityLogProps {
  activities: ProjectActivity[];
  loading?: boolean;
}

interface ChangeDisplayProps {
  activity: ProjectActivity;
}

const ChangeDisplay: React.FC<ChangeDisplayProps> = ({ activity }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  if (!activity.old_values || !activity.new_values) {
    return null;
  }

  // Get the fields that actually changed
  const changedFields = Object.keys(activity.new_values).filter(key => {
    const oldValue = activity.old_values[key];
    const newValue = activity.new_values[key];
    
    // Handle arrays specially
    if (Array.isArray(oldValue) && Array.isArray(newValue)) {
      return JSON.stringify(oldValue.sort()) !== JSON.stringify(newValue.sort());
    }
    
    // Handle null/undefined values
    if (oldValue === null || oldValue === undefined) {
      return newValue !== null && newValue !== undefined && newValue !== '';
    }
    
    if (newValue === null || newValue === undefined) {
      return oldValue !== null && oldValue !== undefined && oldValue !== '';
    }
    
    return String(oldValue) !== String(newValue);
  });

  if (changedFields.length === 0) {
    return null;
  }

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) {
      return '(empty)';
    }
    
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return '(empty list)';
      }
      return value.join(', ');
    }
    
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    
    if (typeof value === 'string' && value.trim() === '') {
      return '(empty)';
    }
    
    return String(value);
  };

  const getFieldDisplayName = (fieldName: string): string => {
    const fieldMap: Record<string, string> = {
      'project_name': 'Project Name',
      'property_type': 'Property Type',
      'project_area': 'Project Area',
      'budget_range': 'Budget Range',
      'timeline': 'Timeline',
      'requirements': 'Requirements',
      'special_requirements': 'Special Requirements',
      'room_types': 'Room Types',
      'inspiration_links': 'Inspiration Links',
      'preferred_designer': 'Preferred Designer',
      'layout_image_url': 'Layout Image',
      'assignment_status': 'Assignment Status',
      'assigned_designer_id': 'Assigned Designer',
      'location': 'Location',
      'name': 'Customer Name',
      'email': 'Email',
      'phone': 'Phone',
      'version': 'Version',
      'last_modified_by': 'Last Modified By',
      'updated_at': 'Updated At'
    };
    
    return fieldMap[fieldName] || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Filter out system fields that users don't need to see
  const userRelevantFields = changedFields.filter(field => 
    !['id', 'user_id', 'created_at', 'updated_at', 'version', 'last_modified_by'].includes(field)
  );

  if (userRelevantFields.length === 0) {
    return null;
  }

  return (
    <div className="mt-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center space-x-1 text-xs text-primary-600 hover:text-primary-700 transition-colors"
      >
        {isExpanded ? (
          <ChevronDown className="w-3 h-3" />
        ) : (
          <ChevronRight className="w-3 h-3" />
        )}
        <span>View changes ({userRelevantFields.length} field{userRelevantFields.length !== 1 ? 's' : ''})</span>
      </button>
      
      {isExpanded && (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg border text-xs">
          <div className="space-y-3">
            {userRelevantFields.map(field => {
              const oldValue = activity.old_values[field];
              const newValue = activity.new_values[field];
              
              return (
                <div key={field} className="border-b border-gray-200 pb-2 last:border-b-0 last:pb-0">
                  <div className="font-medium text-gray-700 mb-1">
                    {getFieldDisplayName(field)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <div className="text-gray-500 mb-1">Previous:</div>
                      <div className="bg-red-50 border border-red-200 rounded px-2 py-1 text-red-800">
                        {formatValue(oldValue)}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-gray-500 mb-1">Current:</div>
                      <div className="bg-green-50 border border-green-200 rounded px-2 py-1 text-green-800">
                        {formatValue(newValue)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const ProjectActivityLog: React.FC<ProjectActivityLogProps> = ({ activities, loading }) => {
  const getActivityIcon = (activityType: string) => {
    switch (activityType.toLowerCase()) {
      case 'insert':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'update':
        return <Edit className="w-4 h-4 text-orange-500" />;
      case 'assigned':
        return <UserPlus className="w-4 h-4 text-green-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityColor = (userType: string) => {
    return userType === 'designer' ? 'text-primary-600' : 'text-secondary-600';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInHours / 24);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-secondary-800 mb-4">Project Activity</h3>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex space-x-3 animate-pulse">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Clock className="w-5 h-5 text-primary-600" />
        <h3 className="text-lg font-semibold text-secondary-800">Project Activity</h3>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-xl shadow-lg">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500">No activity recorded yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={activity.id} className="flex space-x-3">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    {getActivityIcon(activity.activity_type)}
                  </div>
                  {index < activities.length - 1 && (
                    <div className="w-0.5 h-8 bg-gray-200 mt-2"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-secondary-800">
                        <span className={`font-medium ${getActivityColor(activity.user_type)}`}>
                          {activity.user_name}
                        </span>
                        <span className="mx-1">•</span>
                        <span className="capitalize">{activity.user_type}</span>
                      </p>
                      <p className="text-gray-600 mt-1">{activity.description}</p>
                      
                      {/* Show user-friendly changes if available */}
                      {activity.activity_type === 'UPDATE' && (
                        <ChangeDisplay activity={activity} />
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 text-xs text-gray-500 ml-4">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(activity.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectActivityLog;