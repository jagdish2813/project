import React from 'react';
import { Clock, User, Edit, UserPlus, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { ProjectActivity } from '../hooks/useProjectTracking';

interface ProjectActivityLogProps {
  activities: ProjectActivity[];
  loading?: boolean;
}

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
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Clock className="w-5 h-5 text-primary-600" />
        <h3 className="text-lg font-semibold text-secondary-800">Project Activity</h3>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500">No activity recorded yet</p>
        </div>
      ) : (
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
                    
                    {/* Show specific changes if available */}
                    {activity.activity_type === 'UPDATE' && activity.old_values && activity.new_values && (
                      <div className="mt-2 text-xs text-gray-500">
                        <details className="cursor-pointer">
                          <summary className="hover:text-gray-700">View changes</summary>
                          <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                            <pre className="whitespace-pre-wrap">
                              {JSON.stringify({
                                changed: Object.keys(activity.new_values).filter(key => 
                                  JSON.stringify(activity.old_values[key]) !== JSON.stringify(activity.new_values[key])
                                )
                              }, null, 2)}
                            </pre>
                          </div>
                        </details>
                      </div>
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
      )}
    </div>
  );
};

export default ProjectActivityLog;