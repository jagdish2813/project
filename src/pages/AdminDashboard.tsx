import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  Briefcase, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  BarChart3,
  PieChart,
  Calendar
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AdminStats {
  totalDesigners: number;
  verifiedDesigners: number;
  totalCustomers: number;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  pendingVerifications: number;
  monthlyGrowth: number;
}

interface Designer {
  id: string;
  name: string;
  email: string;
  specialization: string;
  location: string;
  experience: number;
  is_verified: boolean;
  is_active: boolean;
  total_projects: number;
  rating: number;
  created_at: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  location: string;
  project_name: string;
  budget_range: string;
  status: string;
  created_at: string;
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'designers' | 'customers' | 'projects'>('overview');
  const [stats, setStats] = useState<AdminStats>({
    totalDesigners: 0,
    verifiedDesigners: 0,
    totalCustomers: 0,
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    pendingVerifications: 0,
    monthlyGrowth: 0
  });
  const [designers, setDesigners] = useState<Designer[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);

      // Fetch designers
      const { data: designersData, error: designersError } = await supabase
        .from('designers')
        .select('*')
        .order('created_at', { ascending: false });

      if (designersError) throw designersError;

      // Fetch customers
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (customersError) throw customersError;

      setDesigners(designersData || []);
      setCustomers(customersData || []);

      // Calculate stats
      const totalDesigners = designersData?.length || 0;
      const verifiedDesigners = designersData?.filter(d => d.is_verified).length || 0;
      const totalCustomers = customersData?.length || 0;
      const totalProjects = customersData?.length || 0;
      const activeProjects = customersData?.filter(c => 
        c.status === 'assigned' || c.status === 'in_progress'
      ).length || 0;
      const completedProjects = customersData?.filter(c => 
        c.status === 'completed'
      ).length || 0;
      const pendingVerifications = designersData?.filter(d => !d.is_verified).length || 0;

      setStats({
        totalDesigners,
        verifiedDesigners,
        totalCustomers,
        totalProjects,
        activeProjects,
        completedProjects,
        pendingVerifications,
        monthlyGrowth: 12.5 // Mock data
      });

    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDesigner = async (designerId: string, verified: boolean) => {
    try {
      const { error } = await supabase
        .from('designers')
        .update({ is_verified: verified })
        .eq('id', designerId);

      if (error) throw error;

      // Update local state
      setDesigners(prev => prev.map(d => 
        d.id === designerId ? { ...d, is_verified: verified } : d
      ));

      // Update stats
      setStats(prev => ({
        ...prev,
        verifiedDesigners: verified ? prev.verifiedDesigners + 1 : prev.verifiedDesigners - 1,
        pendingVerifications: verified ? prev.pendingVerifications - 1 : prev.pendingVerifications + 1
      }));

    } catch (error) {
      console.error('Error updating designer verification:', error);
    }
  };

  const handleToggleDesignerStatus = async (designerId: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from('designers')
        .update({ is_active: active })
        .eq('id', designerId);

      if (error) throw error;

      // Update local state
      setDesigners(prev => prev.map(d => 
        d.id === designerId ? { ...d, is_active: active } : d
      ));

    } catch (error) {
      console.error('Error updating designer status:', error);
    }
  };

  const filteredDesigners = designers.filter(designer =>
    designer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    designer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    designer.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.project_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
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
              <h1 className="text-3xl font-bold text-secondary-800">Admin Dashboard</h1>
              <p className="text-gray-600 mt-2">Manage your platform and monitor performance</p>
            </div>
            <div className="flex space-x-4">
              <button className="btn-secondary flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Export Data</span>
              </button>
              <button className="btn-primary flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'designers', label: 'Designers', icon: Users },
                { id: 'customers', label: 'Customers', icon: UserCheck },
                { id: 'projects', label: 'Projects', icon: Briefcase }
              ].map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Designers</p>
                    <p className="text-3xl font-bold text-secondary-800">{stats.totalDesigners}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-gray-600">{stats.verifiedDesigners} verified</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Customers</p>
                    <p className="text-3xl font-bold text-secondary-800">{stats.totalCustomers}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <UserCheck className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600">+{stats.monthlyGrowth}% this month</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Projects</p>
                    <p className="text-3xl font-bold text-secondary-800">{stats.activeProjects}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-gray-600">{stats.completedProjects} completed</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Verifications</p>
                    <p className="text-3xl font-bold text-secondary-800">{stats.pendingVerifications}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-gray-600">Requires attention</span>
                </div>
              </div>
            </div>

            {/* Charts and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-secondary-800 mb-4">Platform Growth</h3>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <PieChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Chart visualization would go here</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-secondary-800 mb-4">Recent Registrations</h3>
                <div className="space-y-4">
                  {designers.slice(0, 5).map((designer) => (
                    <div key={designer.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-secondary-800">{designer.name}</p>
                        <p className="text-sm text-gray-600">{designer.specialization} • {designer.location}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        designer.is_verified 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {designer.is_verified ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Designers Tab */}
        {activeTab === 'designers' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search designers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <button className="btn-secondary flex items-center space-x-2">
                  <Filter className="w-4 h-4" />
                  <span>Filter</span>
                </button>
              </div>
            </div>

            {/* Designers Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-6 font-semibold text-secondary-800">Designer</th>
                      <th className="text-left py-3 px-6 font-semibold text-secondary-800">Specialization</th>
                      <th className="text-left py-3 px-6 font-semibold text-secondary-800">Location</th>
                      <th className="text-left py-3 px-6 font-semibold text-secondary-800">Experience</th>
                      <th className="text-left py-3 px-6 font-semibold text-secondary-800">Rating</th>
                      <th className="text-left py-3 px-6 font-semibold text-secondary-800">Status</th>
                      <th className="text-left py-3 px-6 font-semibold text-secondary-800">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDesigners.map((designer) => (
                      <tr key={designer.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-medium text-secondary-800">{designer.name}</p>
                            <p className="text-sm text-gray-600">{designer.email}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-600">{designer.specialization}</td>
                        <td className="py-4 px-6 text-gray-600">{designer.location}</td>
                        <td className="py-4 px-6 text-gray-600">{designer.experience} years</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-1">
                            <span className="font-medium">{designer.rating.toFixed(1)}</span>
                            <span className="text-gray-400">({designer.total_projects})</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-col space-y-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              designer.is_verified 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {designer.is_verified ? 'Verified' : 'Pending'}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              designer.is_active 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {designer.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleVerifyDesigner(designer.id, !designer.is_verified)}
                              className={`p-2 rounded-lg transition-colors ${
                                designer.is_verified
                                  ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                  : 'bg-green-100 text-green-600 hover:bg-green-200'
                              }`}
                              title={designer.is_verified ? 'Unverify' : 'Verify'}
                            >
                              {designer.is_verified ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleToggleDesignerStatus(designer.id, !designer.is_active)}
                              className={`p-2 rounded-lg transition-colors ${
                                designer.is_active
                                  ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                              }`}
                              title={designer.is_active ? 'Deactivate' : 'Activate'}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              className="p-2 bg-primary-100 text-primary-600 hover:bg-primary-200 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            {/* Search */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Customers Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-6 font-semibold text-secondary-800">Customer</th>
                      <th className="text-left py-3 px-6 font-semibold text-secondary-800">Project</th>
                      <th className="text-left py-3 px-6 font-semibold text-secondary-800">Location</th>
                      <th className="text-left py-3 px-6 font-semibold text-secondary-800">Budget</th>
                      <th className="text-left py-3 px-6 font-semibold text-secondary-800">Status</th>
                      <th className="text-left py-3 px-6 font-semibold text-secondary-800">Created</th>
                      <th className="text-left py-3 px-6 font-semibold text-secondary-800">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map((customer) => (
                      <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-medium text-secondary-800">{customer.name}</p>
                            <p className="text-sm text-gray-600">{customer.email}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-medium text-secondary-800">{customer.project_name}</p>
                        </td>
                        <td className="py-4 px-6 text-gray-600">{customer.location}</td>
                        <td className="py-4 px-6 text-gray-600">{customer.budget_range}</td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            customer.status === 'completed' 
                              ? 'bg-green-100 text-green-800'
                              : customer.status === 'assigned'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {customer.status || 'Pending'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-600">
                          {new Date(customer.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <button
                              className="p-2 bg-primary-100 text-primary-600 hover:bg-primary-200 rounded-lg transition-colors"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              className="p-2 bg-secondary-100 text-secondary-600 hover:bg-secondary-200 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-secondary-800 mb-4">Project Management</h3>
            <p className="text-gray-600">Project management features would be implemented here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;