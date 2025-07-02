'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LucideBuilding, LucideUser, LucideUsers, LucideSettings, LucideShield, LucideActivity, LucideArrowRight, LucideAlertTriangle } from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalOrganizations: number;
  totalDocuments: number;
  pendingUsers: number;
}

export default function Admin() {
  const { user: currentUser } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if current user has admin permissions
  const isAdmin = currentUser?.role === 'admin' || currentUser?.permissions?.includes('admin.access');

  useEffect(() => {
    if (isAdmin) {
      loadStats();
    }
  }, [isAdmin]);

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      // Load real statistics from the database
      const usersResponse = await fetch('/api/v1/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const orgsResponse = await fetch('/api/v1/admin/organizations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (usersResponse.ok && orgsResponse.ok) {
        const usersData = await usersResponse.json();
        const orgsData = await orgsResponse.json();
        
        const users = usersData.users || [];
        const organizations = orgsData.organizations || [];
        
        setStats({
          totalUsers: users.length,
          activeUsers: users.filter((u: any) => u.status === 'ACTIVE').length,
          totalOrganizations: organizations.length,
          totalDocuments: 0, // TODO: Add documents API call
          pendingUsers: users.filter((u: any) => u.status === 'PENDING').length
        });
      } else {
        setError('Failed to load statistics');
      }
    } catch (error) {
      setError('Error loading statistics');
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto">
        <Alert variant="destructive">
          <LucideAlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access the admin panel. Contact your administrator for access.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Administration</h2>
        </div>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Administration</h2>
          <p className="text-slate-600 mt-1">Manage users, organizations, and system settings</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <LucideAlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <LucideUsers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeUsers || 0} active users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organizations</CardTitle>
            <LucideBuilding className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalOrganizations || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active organizations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Users</CardTitle>
            <LucideUser className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <LucideShield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Healthy</div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Actions */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center justify-between">
              <LucideUsers className="h-8 w-8 text-blue-600" />
              <LucideArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              Manage users, roles, and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/users">
              <Button className="w-full">
                Manage Users
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center justify-between">
              <LucideBuilding className="h-8 w-8 text-green-600" />
              <LucideArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardTitle>Organizations</CardTitle>
            <CardDescription>
              Manage organizational structure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center justify-between">
              <LucideSettings className="h-8 w-8 text-purple-600" />
              <LucideArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardTitle>System Settings</CardTitle>
            <CardDescription>
              Configure system parameters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LucideActivity className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Common administrative tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/admin/users">
              <Button variant="outline" className="w-full justify-start">
                <LucideUser className="h-4 w-4 mr-2" />
                Create New User
              </Button>
            </Link>
            <Button variant="outline" className="w-full justify-start" disabled>
              <LucideBuilding className="h-4 w-4 mr-2" />
              Add Organization
            </Button>
            <Button variant="outline" className="w-full justify-start" disabled>
              <LucideSettings className="h-4 w-4 mr-2" />
              System Backup
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 