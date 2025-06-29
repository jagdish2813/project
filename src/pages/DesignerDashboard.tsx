import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  Calendar,
  Star, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  DollarSign,
  Eye,
  MessageSquare,
  Award,
  Target,
  Activity
import { useAuth } from '../hooks/useAuth';
import { useDesignerProfile } from '../hooks/useDesignerProfile';
import { supabase } from '../lib/supabase';

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
  pendingAssignments: number;
  profileViews: number;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  projectName?: string;
}

const DesignerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { designer, isDesigner, loading: designerLoading } = useDesignerProfile();
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalRevenue: 0,
    averageRating: 0,
    totalReviews: 0,
    pendingAssignments: 0,
    profileViews: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!designerLoading && designer) {
      fetchDashboardData();
    }
  }, [designer, designerLoading]);

  const fetchDashboardData = async () => {
    if (!designer) return;

    try {
      setLoading(true);

      // Fetch assigned projects
      const { data: projects, error: projectsError } = await supabase
        .from('customers')
        .select('*')
        .eq('assigned_designer_id', designer.id);

      if (projectsError) throw projectsError;

      // Fetch pending assignments
      const { data: assignments, error: assignmentsError } = await supabase
        .from('project_assignments')
        .select('*')
        .eq('designer_id', designer.id)
        .eq('status', 'pending');

      if (assignmentsError) throw assignmentsError;

      // Fetch recent activities
      const { data: activities, error: activitiesError } = await supabase
        .from('project_activities')
        .select(`
          *,
          project:customers(project_name)
        `)
        .in('project_id', projects?.map(p => p.id) || [])
        .order('created_at', { ascending: false })
        .limit(10);

      if (activitiesError) throw activitiesError;

      // Calculate stats
      const activeProjects = projects?.filter(p => 
        p.assignment_status === 'assigned' || p.assignment_status === 'in_progress'
      ).length || 0;

      const completedProjects = projects?.filter(p => 
        p.assignment_status === 'completed'
      ).length || 0;

      setStats({
        totalProjects: projects?.length || 0,
        activeProjects,
        completedProjects,
        totalRevenue: completedProjects * 75000, // Estimated revenue
        averageRating: designer.rating || 0,
        totalReviews: designer.total_reviews || 0,
        pendingAssignments: assignments?.length || 0,
        profileViews: Math.floor(Math.random() * 500) + 100 // Mock data
      });

      setRecentActivity(activities?.map(activity => ({
        id: activity.id,
        type: activity.activity_type,
        description: activity.description,
        timestamp: activity.created_at,
        projectName: (activity as any).project?.project_name
      })) || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || designerLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isDesigner || !designer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-secondary-800 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">You need to be a registered designer to access this dashboard.</p>
          <button
            onClick={() => navigate('/register-designer')}
            className="btn-primary"
          >
            Register as Designer
          </button>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'insert':
        return <Target className="w-4 h-4 text-blue-500" />;
      case 'update':
        return <Activity className="w-4 h-4 text-orange-500" />;
      case 'assigned':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-secondary-800">
                Welcome back, {designer.name}!
              </h1>
              <p className="text-gray-600 mt-2">
                Here's what's happening with your design business today.
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/customer-projects')}
                className="btn-secondary"
              >
                View Projects
              </button>
              <button
                onClick={() => navigate('/edit-designer-profile')}
                className="btn-primary"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-3xl font-bold text-secondary-800">{stats.totalProjects}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+12% from last month</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-3xl font-bold text-secondary-800">{stats.activeProjects}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-600">{stats.pendingAssignments} pending assignments</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-3xl font-bold text-secondary-800">{stats.averageRating.toFixed(1)}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-600">{stats.totalReviews} total reviews</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-secondary-800">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+8% from last month</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-secondary-800">Recent Activity</h2>
              <button
                onClick={() => navigate('/customer-projects')}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                View All
              </button>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex space-x-3 animate-pulse">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex-shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-secondary-800">
                        {activity.description}
                        {activity.projectName && (
                          <span className="font-medium"> - {activity.projectName}</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No recent activity</p>
              </div>
            )}
          </div>

          {/* Quick Actions & Profile Summary */}
          <div className="space-y-6">
            {/* Profile Summary */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-secondary-800 mb-4">Profile Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Eye className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Profile Views</p>
                    <p className="text-lg font-bold text-secondary-800">{stats.profileViews}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Completed Projects</p>
                    <p className="text-lg font-bold text-secondary-800">{stats.completedProjects}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Award className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Verification Status</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      designer.is_verified 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {designer.is_verified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-secondary-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/customer-projects')}
                  className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors flex items-center space-x-3"
                >
                  <Users className="w-5 h-5 text-primary-600" />
                  <span className="font-medium text-gray-700">View Customer Projects</span>
                </button>
                <button
                  onClick={() => navigate('/edit-designer-profile')}
                  className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors flex items-center space-x-3"
                >
                  <Users className="w-5 h-5 text-primary-600" />
                  <span className="font-medium text-gray-700">Update Profile</span>
                </button>
                <button
                  onClick={() => navigate(`/designers/${designer.id}`)}
                  className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors flex items-center space-x-3"
                >
                  <Eye className="w-5 h-5 text-primary-600" />
                  <span className="font-medium text-gray-700">View Public Profile</span>
                </button>
                <button
                  onClick={() => navigate('/designer-material-pricing')}
                  className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors flex items-center space-x-3"
                >
                  <DollarSign className="w-5 h-5 text-primary-600" />
                  <span className="font-medium text-gray-700">Manage Material Pricing</span>
                </button>
                <button
                  onClick={() => navigate('/designer-quotes')}
                  className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors flex items-center space-x-3"
                >
                  <FileText className="w-5 h-5 text-primary-600" />
                  <span className="font-medium text-gray-700">Manage Quotes</span>
                </button>
              </div>
            </div>

            {/* Performance Tips */}
            <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-secondary-800 mb-4">Performance Tips</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span className="text-gray-700">Complete your profile with portfolio images</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span className="text-gray-700">Respond to project assignments quickly</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span className="text-gray-700">Maintain high-quality project delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignerDashboard;