import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  BarChart3, 
  Shield, 
  Settings, 
  Activity, 
  Database,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Palette,
  UserCheck,
  Eye,
  Trash2,
  Edit,
  Download,
  RefreshCw,
  Coins
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import CreditManagement from '@/components/admin/CreditManagement';
import UserManagement from '@/components/admin/UserManagement';
import ContentManagement from '@/components/admin/ContentManagement';
import SystemMonitoring from '@/components/admin/SystemMonitoring';
import RecentStoryboards from '@/components/admin/RecentStoryboards';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalStoryboards: 0,
    pendingApprovals: 0,
    apiCalls: 0,
    storageUsed: 0,
    errorCount: 0
  });
  const { user, isAuthenticated, token } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    console.log('🔍 Loading dashboard data...');
    console.log('🔑 Token available:', !!token);
    console.log('👤 User:', user);
    
    try {
      const response = await fetch('http://localhost:3001/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('📊 Dashboard response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Dashboard data received:', data);
        setStats(data.data);
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to fetch dashboard data:', response.status, errorText);
        setStats({
          totalUsers: 0,
          activeUsers: 0,
          totalStoryboards: 0,
          pendingApprovals: 0,
          apiCalls: 0,
          storageUsed: 0,
          errorCount: 0
        });
      }
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      setStats({
        totalUsers: 0,
        activeUsers: 0,
        totalStoryboards: 0,
        pendingApprovals: 0,
        apiCalls: 0,
        storageUsed: 0,
        errorCount: 0
      });
    }
    setIsLoading(false);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'content', label: 'Content Management', icon: FileText },
    { id: 'credits', label: 'Credit Management', icon: Coins },
    { id: 'monitoring', label: 'System Monitoring', icon: Activity }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2 flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              +12% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2 flex items-center text-sm text-green-600">
              <Activity className="h-4 w-4 mr-1" />
              Online now
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Storyboards</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalStoryboards.toLocaleString()}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2 flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              +8% from last week
            </div>
          </CardContent>
        </Card>

        {/* <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingApprovals}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-2 flex items-center text-sm text-orange-600">
              <AlertTriangle className="h-4 w-4 mr-1" />
              Needs attention
            </div>
          </CardContent>
        </Card> */}
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Status</span>
                <Badge className="bg-green-100 text-green-800">Healthy</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database</span>
                <Badge className="bg-green-100 text-green-800">Connected</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Storage</span>
                <Badge className="bg-yellow-100 text-yellow-800">{stats.storageUsed}GB Used</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Errors (24h)</span>
                <Badge className={stats.errorCount > 10 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}>
                  {stats.errorCount}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>User registration: +5 new users</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <FileText className="h-4 w-4 text-blue-600" />
                <span>12 new storyboards created</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Palette className="h-4 w-4 text-purple-600" />
                <span>3 templates approved</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span>2 content flags reviewed</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Management</h2>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Download className="h-4 w-4 mr-2" />
          Export Users
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">User Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>New Users (7d)</span>
                <span className="font-semibold">+47</span>
              </div>
              <div className="flex justify-between">
                <span>Active Users (24h)</span>
                <span className="font-semibold">{stats.activeUsers}</span>
              </div>
              <div className="flex justify-between">
                <span>Retention Rate</span>
                <span className="font-semibold text-green-600">78%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Registration Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>This Month</span>
                <span className="font-semibold">+156</span>
              </div>
              <div className="flex justify-between">
                <span>Last Month</span>
                <span className="font-semibold">+134</span>
              </div>
              <div className="flex justify-between">
                <span>Growth Rate</span>
                <span className="font-semibold text-green-600">+16%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">User Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button variant="outline" className="w-full justify-start">
                <Eye className="h-4 w-4 mr-2" />
                View All Users
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <UserCheck className="h-4 w-4 mr-2" />
                Active Users
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Flagged Users
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderContent = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Content Management</h2>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Settings className="h-4 w-4 mr-2" />
            Bulk Actions
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Storyboard Approval Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RecentStoryboards />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Template Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Templates</span>
                <Badge>24</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Public Templates</span>
                <Badge>18</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Pending Review</span>
                <Badge className="bg-orange-100 text-orange-800">3</Badge>
              </div>
              <Button className="w-full mt-4">
                <Palette className="h-4 w-4 mr-2" />
                Manage Templates
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderMonitoring = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">System Monitoring</h2>
        <Button variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              API Usage Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Total API Calls (24h)</span>
                <span className="font-semibold">{stats.apiCalls.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Average Response Time</span>
                <span className="font-semibold text-green-600">245ms</span>
              </div>
              <div className="flex justify-between">
                <span>Error Rate</span>
                <span className="font-semibold text-green-600">0.2%</span>
              </div>
              <div className="flex justify-between">
                <span>Peak Usage</span>
                <span className="font-semibold">2,847 calls/min</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Storage Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Total Storage Used</span>
                <span className="font-semibold">{stats.storageUsed}GB</span>
              </div>
              <div className="flex justify-between">
                <span>Images Stored</span>
                <span className="font-semibold">12,847</span>
              </div>
              <div className="flex justify-between">
                <span>Storage Limit</span>
                <span className="font-semibold">10GB</span>
              </div>
              <div className="flex justify-between">
                <span>Usage</span>
                <span className="font-semibold text-orange-600">24%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Recent Errors & Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">Image generation timeout</p>
                <p className="text-xs text-gray-600">2 minutes ago • API Error</p>
              </div>
              <Badge className="bg-red-100 text-red-800">High</Badge>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">Database connection slow</p>
                <p className="text-xs text-gray-600">15 minutes ago • Performance</p>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">System recovery completed</p>
                <p className="text-xs text-gray-600">1 hour ago • System</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Resolved</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600">Please log in to access the admin panel.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name || 'Admin'}</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge className="bg-green-100 text-green-800">
                <Activity className="h-3 w-3 mr-1" />
                System Online
              </Badge>
              <Button variant="outline" onClick={loadDashboardData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'users' && <UserManagement />}
            {activeTab === 'content' && renderContent()}
            {activeTab === 'credits' && <CreditManagement />}
            {activeTab === 'monitoring' && renderMonitoring()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}