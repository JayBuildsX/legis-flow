'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Building, 
  Mail, 
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Search
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';
  phoneNumber?: string;
  lastLogin?: string;
  createdAt: string;
  role?: string;
  organization?: string;
  mfaEnabled?: boolean;
}

interface Role {
  id: string;
  name: string;
  description: string;
}

interface Organization {
  id: string;
  name: string;
  orgType: string;
  status: string;
}

export default function UsersAdminPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // New user form state
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    role: '',
    organization: '',
    status: 'ACTIVE' as const
  });

  // Check if current user has admin permissions
  const isAdmin = currentUser?.role === 'admin' || currentUser?.permissions?.includes('admin.access');

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
      loadRoles();
      loadOrganizations();
    }
  }, [isAdmin]);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, statusFilter, roleFilter]);

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch('/api/v1/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        setError('Failed to load users');
      }
    } catch (error) {
      setError('Error loading users');
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch('/api/v1/admin/roles', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRoles(data.roles || []);
      }
    } catch (error) {
      console.error('Error loading roles:', error);
    }
  };

  const loadOrganizations = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch('/api/v1/admin/organizations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrganizations(data.organizations || []);
      }
    } catch (error) {
      console.error('Error loading organizations:', error);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.firstName && user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.lastName && user.lastName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    // Role filter
    if (roleFilter !== 'ALL') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const createUser = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch('/api/v1/admin/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
      });

      if (response.ok) {
        setSuccess('User created successfully');
        setShowCreateDialog(false);
        setNewUser({
          username: '',
          email: '',
          firstName: '',
          lastName: '',
          password: '',
          role: '',
          organization: '',
          status: 'ACTIVE'
        });
        await loadUsers();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create user');
      }
    } catch (error) {
      setError('Error creating user');
      console.error('Error creating user:', error);
    }
  };

  const updateUserStatus = async (userId: string, newStatus: string) => {
    try {
      setError(null);
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(`/api/v1/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setSuccess(`User status updated to ${newStatus}`);
        await loadUsers();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update user status');
      }
    } catch (error) {
      setError('Error updating user status');
      console.error('Error updating user status:', error);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'secondary';
      case 'INACTIVE': return 'outline';
      case 'SUSPENDED': return 'destructive';
      case 'PENDING': return 'warning';
      default: return 'outline';
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access the admin panel. Contact your administrator for access.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage users, roles, and permissions</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Create User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Add a new user to the system
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={newUser.firstName}
                    onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                    placeholder="John"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={newUser.lastName}
                    onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                    placeholder="Doe"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  placeholder="johndoe"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="john@example.com"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  placeholder="Password"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(role => (
                      <SelectItem key={role.id} value={role.name}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="organization">Organization</Label>
                <Select value={newUser.organization} onValueChange={(value) => setNewUser({...newUser, organization: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select organization" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map(org => (
                      <SelectItem key={org.id} value={org.name}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={createUser} className="flex-1">
                  Create User
                </Button>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filter Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search by name, email, or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="role-filter">Role</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Roles</SelectItem>
                  {roles.map(role => (
                    <SelectItem key={role.id} value={role.name}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Users ({filteredUsers.length})
          </CardTitle>
          <CardDescription>
            Manage user accounts, roles, and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>MFA</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {user.firstName && user.lastName 
                            ? `${user.firstName} ${user.lastName}` 
                            : user.username}
                        </div>
                        <div className="text-sm text-gray-500">@{user.username}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        {user.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-gray-400" />
                        {user.role || 'No role'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-gray-400" />
                        {user.organization || 'No organization'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(user.status)}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.mfaEnabled ? "secondary" : "outline"}>
                        {user.mfaEnabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {user.lastLogin 
                          ? new Date(user.lastLogin).toLocaleDateString()
                          : 'Never'
                        }
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingUser(user)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => updateUserStatus(user.id, user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE')}
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            {user.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => updateUserStatus(user.id, 'INACTIVE')}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Deactivate
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 