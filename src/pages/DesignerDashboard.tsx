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
  Activity,
  FileText,
  X,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
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

interface ProjectData {
  month: string;
  completed: number;
  active: number;
}

interface RevenueData {
  month: string;
  amount: number;
}

interface ProjectTypeData {
  name: string;
  value: number;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  projectName?: string;
}

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'projects' | 'active' | 'rating' | 'revenue';
  stats: DashboardStats;
  projectData: ProjectData[];
  revenueData: RevenueData[];
  projectTypeData: ProjectTypeData[];
}

const AnalyticsModal: React.FC<AnalyticsModalProps> = ({ 
  isOpen, 
  onClose, 
  type, 
  stats, 
  projectData, 
  revenueData, 
  projectTypeData 
}) => {
  const [activeChart, setActiveChart] = useState<'bar' | 'line' | 'pie'>('bar');
  const COLORS = ['#E07A5F', '#3D5A80', '#F2CC8F', '#81B29A', '#F4A261'];
  
  if (!isOpen) return null;
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  let title = '';
  let description = '';
  
  switch (type) {
    case 'projects':
      title = 'Projects Analytics';
      description = `You have completed ${stats.completedProjects} projects out of ${stats.totalProjects} total projects.`;
      break;
    case 'active':
      title = 'Active Projects Analytics';
      description = `You have ${stats.activeProjects} active projects and ${stats.pendingAssignments} pending assignments.`;
      break;
    case 'rating':
      title = 'Rating Analytics';
      description = `Your average rating is ${stats.averageRating.toFixed(1)} from ${stats.totalReviews} reviews.`;
      break;
    case 'revenue':
      title = 'Revenue Analytics';
      description = `Your total revenue is ${formatCurrency(stats.totalRevenue)} with an 8% increase from last month.`;
      break;
  }
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-secondary-800">{title}</h2>
            <p className="text-gray-600 mt-1">{description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-secondary-800">Visualization</h3>
            <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveChart('bar')}
                className={`p-2 rounded-lg transition-colors ${
                  activeChart === 'bar' 
                    ? 'bg-white text-primary-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <BarChartIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setActiveChart('line')}
                className={`p-2 rounded-lg transition-colors ${
                  activeChart === 'line' 
                    ? 'bg-white text-primary-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <LineChartIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setActiveChart('pie')}
                className={`p-2 rounded-lg transition-colors ${
                  activeChart === 'pie' 
                    ? 'bg-white text-primary-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <PieChartIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="h-80 w-full">
            {activeChart === 'bar' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={type === 'revenue' ? revenueData : projectData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (type === 'revenue') return [formatCurrency(value as number), 'Revenue'];
                      return [`${value} projects`, name];
                    }}
                    labelStyle={{ color: '#333' }}
                    contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #ddd' }}
                  />
                  <Legend />
                  {type === 'revenue' ? (
                    <Bar dataKey="amount" name="Monthly Revenue" fill="#E07A5F" />
                  ) : (
                    <>
                      <Bar dataKey="completed" name="Completed Projects" fill="#3D5A80" />
                      <Bar dataKey="active" name="Active Projects" fill="#E07A5F" />
                    </>
                  )}
                </BarChart>
              </ResponsiveContainer>
            )}
            
            {activeChart === 'line' && (
              <ResponsiveContainer width="100%" height="100%">
                {type === 'revenue' ? (
                  <LineChart
                    data={revenueData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [formatCurrency(value as number), 'Revenue']}
                      labelStyle={{ color: '#333' }}
                      contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #ddd' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="amount" name="Monthly Revenue" stroke="#E07A5F" activeDot={{ r: 8 }} />
                  </LineChart>
                ) : (
                  <LineChart
                    data={projectData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`${value} projects`, '']}
                      labelStyle={{ color: '#333' }}
                      contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #ddd' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="completed" name="Completed Projects" stroke="#3D5A80" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="active" name="Active Projects" stroke="#E07A5F" activeDot={{ r: 8 }} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            )}
            
            {activeChart === 'pie' && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={type === 'projects' || type === 'active' ? projectTypeData : [
                      { name: '5 Stars', value: Math.round(stats.totalReviews * 0.6) },
                      { name: '4 Stars', value: Math.round(stats.totalReviews * 0.3) },
                      { name: '3 Stars', value: Math.round(stats.totalReviews * 0.08) },
                      { name: '2 Stars', value: Math.round(stats.totalReviews * 0.015) },
                      { name: '1 Star', value: Math.round(stats.totalReviews * 0.005) }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {projectTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} ${type === 'rating' ? 'reviews' : 'projects'}`, '']}
                    labelStyle={{ color: '#333' }}
                    contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #ddd' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-secondary-800 mb-4">Key Insights</h3>
              {type === 'projects' && (
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Your project completion rate is {Math.round((stats.completedProjects / stats.totalProjects) * 100)}%</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Residential projects make up {Math.round((projectTypeData[0]?.value / stats.totalProjects) * 100)}% of your portfolio</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>You've completed {stats.completedProjects} projects in the last 6 months</span>
                  </li>
                </ul>
              )}
              
              {type === 'active' && (
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>You have {stats.activeProjects} active projects requiring attention</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>{stats.pendingAssignments} projects are waiting for your acceptance</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Your current workload is {stats.activeProjects > 5 ? 'high' : 'manageable'}</span>
                  </li>
                </ul>
              )}
              
              {type === 'rating' && (
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Your rating of {stats.averageRating.toFixed(1)} is {stats.averageRating > 4.5 ? 'excellent' : 'good'}</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>You've received {stats.totalReviews} client reviews</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Most clients rate your work 5 stars (60%)</span>
                  </li>
                </ul>
              )}
              
              {type === 'revenue' && (
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Your total revenue is {formatCurrency(stats.totalRevenue)}</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Average revenue per project: {formatCurrency(stats.totalRevenue / (stats.completedProjects || 1))}</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Revenue has grown 8% compared to last month</span>
                  </li>
                </ul>
              )}
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-secondary-800 mb-4">Recommendations</h3>
              {type === 'projects' && (
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Focus on increasing commercial projects to diversify your portfolio</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Showcase your completed projects in your portfolio to attract similar clients</span>
                  </li>
                </ul>
              )}
              
              {type === 'active' && (
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Respond to pending assignments within 24 hours to improve acceptance rate</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Consider hiring an assistant if your active projects exceed 8</span>
                  </li>
                </ul>
              )}
              
              {type === 'rating' && (
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Encourage more clients to leave reviews to build credibility</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Respond to all reviews to show engagement and professionalism</span>
                  </li>
                </ul>
              )}
              
              {type === 'revenue' && (
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Consider offering premium packages to increase average project value</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Focus on high-value projects like luxury homes and commercial spaces</span>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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
  const [projectData, setProjectData] = useState<ProjectData[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [projectTypeData, setProjectTypeData] = useState<ProjectTypeData[]>([]);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [analyticsType, setAnalyticsType] = useState<'projects' | 'active' | 'rating' | 'revenue'>('projects');
  
  // Colors for charts
  const COLORS = ['#E07A5F', '#3D5A80', '#F2CC8F', '#81B29A', '#F4A261'];

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
        .select('*')
        .in('project_id', projects?.map(p => p.id) || [])
        .order('created_at', { ascending: false })
        .limit(10);

      if (activitiesError) throw activitiesError;

      // Get project names for activities
      const projectNames: { [key: string]: string } = {};
      if (projects && projects.length > 0) {
        projects.forEach(project => {
          projectNames[project.id] = project.project_name;
        });
      }

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
      
      // Generate mock data for charts
      generateMockChartData(projects?.length || 0, activeProjects, completedProjects);

      setRecentActivity(activities?.map(activity => ({
        id: activity.id,
        type: activity.activity_type,
        description: activity.description,
        timestamp: activity.created_at,
        projectName: projectNames[activity.project_id] || 'Unknown Project'
      })) || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set default values to prevent UI errors
      setStats({
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        totalRevenue: 0,
        averageRating: designer?.rating || 0,
        totalReviews: designer?.total_reviews || 0,
        pendingAssignments: 0,
        profileViews: 0
      });
      setRecentActivity([]);
    } finally {
      setLoading(false);
    }
  };

  const generateMockChartData = (totalProjects: number, activeProjects: number, completedProjects: number) => {
    // Generate project data for the last 6 months
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const projectData: ProjectData[] = [];
    
    // Distribute projects across months with a growth trend
    let totalCompleted = completedProjects;
    let totalActive = activeProjects;
    
    for (let i = 0; i < months.length; i++) {
      const completedThisMonth = Math.max(1, Math.floor(totalCompleted * (0.1 + (i * 0.05))));
      const activeThisMonth = Math.max(1, Math.floor(totalActive * (0.1 + (i * 0.03))));
      
      projectData.push({
        month: months[i],
        completed: completedThisMonth,
        active: activeThisMonth
      });
      
      totalCompleted -= completedThisMonth;
      totalActive -= activeThisMonth;
      
      // Ensure we don't go negative
      if (totalCompleted <= 0) totalCompleted = 1;
      if (totalActive <= 0) totalActive = 1;
    }
    
    // Reverse to show most recent months last (right side of chart)
    setProjectData(projectData.reverse());
    
    // Generate revenue data with growth trend
    const revenueData: RevenueData[] = [];
    let baseRevenue = stats.totalRevenue / 6; // Distribute total revenue
    
    for (let i = 0; i < months.length; i++) {
      // Add some randomness and growth trend
      const growthFactor = 1 + (i * 0.1);
      const randomFactor = 0.8 + (Math.random() * 0.4);
      const monthlyRevenue = Math.round(baseRevenue * growthFactor * randomFactor);
      
      revenueData.push({
        month: months[i],
        amount: monthlyRevenue
      });
    }
    
    setRevenueData(revenueData.reverse());
    
    // Generate project type data
    const projectTypeData: ProjectTypeData[] = [
      { name: 'Residential', value: Math.round(totalProjects * 0.6) },
      { name: 'Commercial', value: Math.round(totalProjects * 0.2) },
      { name: 'Office', value: Math.round(totalProjects * 0.1) },
      { name: 'Retail', value: Math.round(totalProjects * 0.05) },
      { name: 'Other', value: Math.round(totalProjects * 0.05) }
    ];
    
    setProjectTypeData(projectTypeData);
  };

  const handleStatClick = (type: 'projects' | 'active' | 'rating' | 'revenue') => {
    setAnalyticsType(type);
    setShowAnalyticsModal(true);
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
          <div 
            className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            onClick={() => handleStatClick('projects')}
          >
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

          <div 
            className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            onClick={() => handleStatClick('active')}
          >
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

          <div 
            className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            onClick={() => handleStatClick('rating')}
          >
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

          <div 
            className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            onClick={() => handleStatClick('revenue')}
          >
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-lg p-6">
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
        
        {/* Analytics Modal */}
        <AnalyticsModal 
          isOpen={showAnalyticsModal}
          onClose={() => setShowAnalyticsModal(false)}
          type={analyticsType}
          stats={stats}
          projectData={projectData}
          revenueData={revenueData}
          projectTypeData={projectTypeData}
        />
      </div>
    </div>
  );
};

export default DesignerDashboard;