import React, { useState } from 'react';
import { History, Eye, User, Calendar, ChevronDown, ChevronRight } from 'lucide-react';
import { ProjectVersion } from '../hooks/useProjectTracking';

interface ProjectVersionHistoryProps {
  versions: ProjectVersion[];
  loading?: boolean;
}

const ProjectVersionHistory: React.FC<ProjectVersionHistoryProps> = ({ versions, loading }) => {
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set());

  const toggleVersion = (versionId: string) => {
    const newExpanded = new Set(expandedVersions);
    if (newExpanded.has(versionId)) {
      newExpanded.delete(versionId);
    } else {
      newExpanded.add(versionId);
    }
    setExpandedVersions(newExpanded);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getVersionBadgeColor = (version: number) => {
    if (version === 1) return 'bg-blue-100 text-blue-800';
    return 'bg-green-100 text-green-800';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-secondary-800 mb-4">Version History</h3>
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
        <History className="w-5 h-5 text-primary-600" />
        <h3 className="text-lg font-semibold text-secondary-800">Version History</h3>
      </div>

      {versions.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <History className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500">No versions recorded yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {versions.map((version, index) => (
            <div key={version.id} className="border border-gray-200 rounded-lg">
              <div 
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleVersion(version.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {expandedVersions.has(version.id) ? (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVersionBadgeColor(version.version)}`}>
                        v{version.version}
                      </span>
                      {index === 0 && (
                        <span className="px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-xs font-medium">
                          Current
                        </span>
                      )}
                    </div>
                    
                    <div>
                      <p className="font-medium text-secondary-800">{version.change_summary}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <div className="flex items-center space-x-1">
                          <User className="w-3 h-3" />
                          <span>{version.created_by_name}</span>
                          <span className="text-xs">({version.created_by_type})</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(version.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Eye className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>

              {expandedVersions.has(version.id) && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <h4 className="font-medium text-secondary-800 mb-3">Project Data at Version {version.version}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-700 mb-1">Project Name:</p>
                      <p className="text-gray-600">{version.data.project_name}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 mb-1">Property Type:</p>
                      <p className="text-gray-600">{version.data.property_type}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 mb-1">Budget Range:</p>
                      <p className="text-gray-600">{version.data.budget_range}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 mb-1">Timeline:</p>
                      <p className="text-gray-600">{version.data.timeline}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 mb-1">Status:</p>
                      <p className="text-gray-600">{version.data.assignment_status || 'unassigned'}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 mb-1">Location:</p>
                      <p className="text-gray-600">{version.data.location}</p>
                    </div>
                  </div>
                  
                  {version.data.requirements && (
                    <div className="mt-4">
                      <p className="font-medium text-gray-700 mb-1">Requirements:</p>
                      <p className="text-gray-600 text-sm">{version.data.requirements}</p>
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

export default ProjectVersionHistory;