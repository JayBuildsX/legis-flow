'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarInitials } from '@/components/ui/avatar';
import {
  DocumentAnalyticsService,
  AnalyticsReport,
  DocumentAnalytics,
  UserEngagement,
  TimeSeriesData,
  AnalyticsInsight,
  DocumentView,
  DocumentEdit
} from '@/lib/documentAnalytics';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  Edit,
  Users,
  Clock,
  Activity,
  AlertCircle,
  CheckCircle,
  Info,
  Calendar,
  Download,
  Filter,
  Refresh,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Target,
  Zap,
  Award,
  User
} from 'lucide-react';

interface DocumentAnalyticsDashboardProps {
  documentId: string;
  showFilters?: boolean;
  refreshInterval?: number; // in seconds
}

interface AnalyticsFilter {
  timeRange: '7d' | '30d' | '90d' | '1y';
  userFilter: 'all' | 'active' | 'editors' | 'viewers';
  activityFilter: 'all' | 'views' | 'edits';
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function DocumentAnalyticsDashboard({
  documentId,
  showFilters = true,
  refreshInterval = 300 // 5 minutes
}: DocumentAnalyticsDashboardProps) {
  const [analyticsReport, setAnalyticsReport] = useState<AnalyticsReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [filters, setFilters] = useState<AnalyticsFilter>({
    timeRange: '30d',
    userFilter: 'all',
    activityFilter: 'all'
  });

  // Load analytics data
  useEffect(() => {
    loadAnalytics();
  }, [documentId, filters]);

  // Auto-refresh
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(() => {
        loadAnalytics(true);
      }, refreshInterval * 1000);

      return () => clearInterval(interval);
    }
  }, [refreshInterval]);

  const loadAnalytics = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      setError(null);

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (filters.timeRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      const analyticsFilter = {
        dateRange: { start: startDate, end: endDate }
      };

      const report = await DocumentAnalyticsService.generateAnalyticsReport(
        documentId,
        analyticsFilter
      );

      setAnalyticsReport(report);
      setLastRefresh(new Date());

    } catch (error) {
      console.error('Error loading analytics:', error);
      setError('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendIcon = (trend: 'increasing' | 'decreasing' | 'stable') => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getInsightIcon = (severity: string) => {
    switch (severity) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  if (isLoading && !analyticsReport) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Document Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3">Loading analytics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!analyticsReport) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            No analytics data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const { documentAnalytics, timeSeriesData, userEngagement, topViewers, topEditors, recentActivity, insights } = analyticsReport;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Document Analytics
              </CardTitle>
              <CardDescription>
                Comprehensive insights for {documentAnalytics.documentTitle}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </span>
              <Button size="sm" variant="outline" onClick={() => loadAnalytics()}>
                <Refresh className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {showFilters && (
          <CardContent>
            <div className="flex gap-4">
              <Select
                value={filters.timeRange}
                onValueChange={(value) => setFilters(prev => ({ ...prev, timeRange: value as any }))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.userFilter}
                onValueChange={(value) => setFilters(prev => ({ ...prev, userFilter: value as any }))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="editors">Editors</SelectItem>
                  <SelectItem value="viewers">Viewers</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.activityFilter}
                onValueChange={(value) => setFilters(prev => ({ ...prev, activityFilter: value as any }))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Activity</SelectItem>
                  <SelectItem value="views">Views Only</SelectItem>
                  <SelectItem value="edits">Edits Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{documentAnalytics.totalViews}</p>
                <p className="text-sm text-muted-foreground">Total Views</p>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4 text-blue-600" />
                {getTrendIcon(documentAnalytics.viewTrend)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{documentAnalytics.totalEdits}</p>
                <p className="text-sm text-muted-foreground">Total Edits</p>
              </div>
              <div className="flex items-center gap-1">
                <Edit className="h-4 w-4 text-green-600" />
                {getTrendIcon(documentAnalytics.editTrend)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{documentAnalytics.uniqueViewers}</p>
                <p className="text-sm text-muted-foreground">Unique Users</p>
              </div>
              <Users className="h-4 w-4 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{formatDuration(documentAnalytics.averageViewDuration)}</p>
                <p className="text-sm text-muted-foreground">Avg. View Time</p>
              </div>
              <Clock className="h-4 w-4 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="engagement">User Engagement</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
              <CardDescription>Views and edits over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="views" stackId="1" stroke="#0088FE" fill="#0088FE" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="edits" stackId="1" stroke="#00C49F" fill="#00C49F" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Collaboration Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Collaboration Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Collaboration Index</span>
                    <span>{documentAnalytics.collaborationIndex}/100</span>
                  </div>
                  <Progress value={documentAnalytics.collaborationIndex} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Content Stability</span>
                    <span>{documentAnalytics.contentStability}/100</span>
                  </div>
                  <Progress value={documentAnalytics.contentStability} className="h-2" />
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">Popularity</span>
                  <Badge variant={
                    documentAnalytics.popularity === 'high' ? 'default' :
                    documentAnalytics.popularity === 'medium' ? 'secondary' : 'outline'
                  }>
                    {documentAnalytics.popularity}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Current Version</span>
                  <span className="font-medium">v{documentAnalytics.currentVersion}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Time Spent</span>
                  <span className="font-medium">{formatDuration(documentAnalytics.totalTimeSpent)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Unique Editors</span>
                  <span className="font-medium">{documentAnalytics.uniqueEditors}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Last Modified</span>
                  <span className="font-medium">{formatTimeAgo(documentAnalytics.lastModified)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Viewers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Top Viewers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topViewers.slice(0, 5).map((user, index) => (
                    <div key={user.userId} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{user.userName}</p>
                          <p className="text-xs text-muted-foreground">{user.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{user.totalViews}</p>
                        <p className="text-xs text-muted-foreground">views</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Editors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Top Editors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topEditors.slice(0, 5).map((user, index) => (
                    <div key={user.userId} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-600">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{user.userName}</p>
                          <p className="text-xs text-muted-foreground">{user.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{user.totalEdits}</p>
                        <p className="text-xs text-muted-foreground">edits</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Engagement Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>User Engagement Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'High Engagement', value: userEngagement.filter(u => u.engagement === 'high').length },
                      { name: 'Medium Engagement', value: userEngagement.filter(u => u.engagement === 'medium').length },
                      { name: 'Low Engagement', value: userEngagement.filter(u => u.engagement === 'low').length }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.slice(0, 20).map((activity) => {
                  const isView = 'viewedAt' in activity;
                  const date = isView ? activity.viewedAt : activity.editedAt;
                  
                  return (
                    <div key={activity.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className={`p-2 rounded-full ${isView ? 'bg-blue-100' : 'bg-green-100'}`}>
                        {isView ? 
                          <Eye className="h-3 w-3 text-blue-600" /> : 
                          <Edit className="h-3 w-3 text-green-600" />
                        }
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">{activity.userName}</span>
                          {isView ? ' viewed' : ' edited'} the document
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatTimeAgo(date)}
                          {!isView && activity.comment && ` • ${activity.comment}`}
                        </p>
                      </div>
                      {!isView && (
                        <Badge variant="outline" className="text-xs">
                          {activity.changeType}
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="space-y-4">
            {insights.length > 0 ? (
              insights.map((insight, index) => (
                <Alert key={index} variant={insight.severity === 'error' ? 'destructive' : 'default'}>
                  {getInsightIcon(insight.severity)}
                  <div>
                    <h4 className="font-medium">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                    {insight.recommendation && (
                      <p className="text-sm font-medium mt-2">💡 {insight.recommendation}</p>
                    )}
                  </div>
                </Alert>
              ))
            ) : (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No insights available yet</p>
                    <p className="text-sm">Insights will appear as more data is collected</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 