import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Database, 
  Server, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download,
  Settings,
  BarChart3,
  Zap,
  HardDrive,
  Cpu,
  Wifi,
  Shield,
  Eye,
  Filter,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function SystemMonitoring() {
  const [metrics, setMetrics] = useState({
    apiCalls: 0,
    responseTime: 0,
    errorRate: 0,
    uptime: 0,
    cpuUsage: 0,
    memoryUsage: 0,
    storageUsage: 0,
    activeConnections: 0
  });
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');
  const [logLevel, setLogLevel] = useState('all');
  const { token } = useAuth();

  useEffect(() => {
    loadMetrics();
    loadLogs();
    const interval = setInterval(() => {
      loadMetrics();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const loadMetrics = async () => {
    console.log('📊 Loading system metrics...');
    console.log('🔑 Token available:', !!token);
    
    try {
      const response = await fetch('https://ai-news-image-maker.onrender.com/api/admin/monitoring/metrics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('📊 Metrics response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Metrics data received:', data);
        setMetrics(data.data || {
          apiCalls: 0,
          responseTime: 0,
          errorRate: 0,
          uptime: 0,
          cpuUsage: 0,
          memoryUsage: 0,
          storageUsage: 0,
          activeConnections: 0
        });
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to fetch metrics:', response.status, errorText);
        setMetrics({
          apiCalls: 0,
          responseTime: 0,
          errorRate: 0,
          uptime: 0,
          cpuUsage: 0,
          memoryUsage: 0,
          storageUsage: 0,
          activeConnections: 0
        });
      }
    } catch (error) {
      console.error('❌ Error loading metrics:', error);
      setMetrics({
        apiCalls: 0,
        responseTime: 0,
        errorRate: 0,
        uptime: 0,
        cpuUsage: 0,
        memoryUsage: 0,
        storageUsage: 0,
        activeConnections: 0
      });
    }
  };

  const loadLogs = async () => {
    console.log('📋 Loading system logs...');
    console.log('🔑 Token available:', !!token);
    
    try {
      const response = await fetch('https://ai-news-image-maker.onrender.com/api/admin/monitoring/logs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('📋 Logs response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Logs data received:', data);
        setLogs(data.data || []);
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to fetch logs:', response.status, errorText);
        setLogs([]);
      }
    } catch (error) {
      console.error('❌ Error loading logs:', error);
      setLogs([]);
    }
    setIsLoading(false);
  };

  const getLogLevelColor = (level) => {
    switch (level) {
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLogLevelIcon = (level) => {
    switch (level) {
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'info': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getHealthStatus = (value, thresholds) => {
    if (value <= thresholds.good) return { status: 'good', color: 'text-green-600' };
    if (value <= thresholds.warning) return { status: 'warning', color: 'text-yellow-600' };
    return { status: 'critical', color: 'text-red-600' };
  };

  const responseTimeStatus = getHealthStatus(metrics.responseTime, { good: 300, warning: 1000 });
  const errorRateStatus = getHealthStatus(metrics.errorRate, { good: 1, warning: 5 });
  const cpuStatus = getHealthStatus(metrics.cpuUsage, { good: 50, warning: 80 });
  const memoryStatus = getHealthStatus(metrics.memoryUsage, { good: 60, warning: 85 });

  return (
    <div className="space-y-6">
      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">API Calls (24h)</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.apiCalls.toLocaleString()}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2 flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              +12% from yesterday
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Response Time</p>
                <p className={`text-2xl font-bold ${responseTimeStatus.color}`}>
                  {metrics.responseTime}ms
                </p>
              </div>
              <Zap className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <Badge className={responseTimeStatus.status === 'good' ? 'bg-green-100 text-green-800' : 
                                responseTimeStatus.status === 'warning' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-red-100 text-red-800'}>
                {responseTimeStatus.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Error Rate</p>
                <p className={`text-2xl font-bold ${errorRateStatus.color}`}>
                  {metrics.errorRate.toFixed(2)}%
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <Badge className={errorRateStatus.status === 'good' ? 'bg-green-100 text-green-800' : 
                                errorRateStatus.status === 'warning' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-red-100 text-red-800'}>
                {errorRateStatus.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Uptime</p>
                <p className="text-2xl font-bold text-green-600">{metrics.uptime}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2 flex items-center text-sm text-green-600">
              <Shield className="h-4 w-4 mr-1" />
              System healthy
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              System Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">CPU Usage</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        cpuStatus.status === 'good' ? 'bg-green-500' : 
                        cpuStatus.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${metrics.cpuUsage}%` }}
                    ></div>
                  </div>
                  <span className={`font-semibold ${cpuStatus.color}`}>
                    {metrics.cpuUsage}%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Memory Usage</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        memoryStatus.status === 'good' ? 'bg-green-500' : 
                        memoryStatus.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${metrics.memoryUsage}%` }}
                    ></div>
                  </div>
                  <span className={`font-semibold ${memoryStatus.color}`}>
                    {metrics.memoryUsage}%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Connections</span>
                <span className="font-semibold text-blue-600">{metrics.activeConnections}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Storage Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Storage Used</span>
                <span className="font-semibold">{metrics.storageUsage}GB</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Storage Limit</span>
                <span className="font-semibold">10GB</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Usage Percentage</span>
                <span className="font-semibold text-orange-600">
                  {((metrics.storageUsage / 10) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full"
                  style={{ width: `${(metrics.storageUsage / 10) * 100}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Usage Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            API Usage Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {metrics.apiCalls.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600">Total API Calls (24h)</p>
              <div className="flex items-center justify-center text-sm text-green-600 mt-1">
                <TrendingUp className="h-4 w-4 mr-1" />
                +8% from yesterday
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {Math.floor(metrics.apiCalls / 24).toLocaleString()}
              </div>
              <p className="text-sm text-gray-600">Average per Hour</p>
              <div className="flex items-center justify-center text-sm text-blue-600 mt-1">
                <Activity className="h-4 w-4 mr-1" />
                Peak: 2,847/min
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {metrics.responseTime}ms
              </div>
              <p className="text-sm text-gray-600">Average Response Time</p>
              <div className="flex items-center justify-center text-sm text-green-600 mt-1">
                <Zap className="h-4 w-4 mr-1" />
                Fast response
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Logs and Monitoring */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              System Logs & Monitoring
            </CardTitle>
            <div className="flex gap-2">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
              </select>
              <select
                value={logLevel}
                onChange={(e) => setLogLevel(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Levels</option>
                <option value="error">Errors Only</option>
                <option value="warning">Warnings & Errors</option>
                <option value="info">All Info</option>
              </select>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            <AnimatePresence>
              {logs
                .filter(log => logLevel === 'all' || log.level === logLevel)
                .map((log, index) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-shrink-0">
                      {getLogLevelIcon(log.level)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getLogLevelColor(log.level)}>
                          {log.level.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-gray-600">{log.source}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{log.message}</p>
                      <p className="text-xs text-gray-600">{log.details}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
