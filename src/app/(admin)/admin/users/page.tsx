'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface User {
  id: string;
  email: string;
  fullName?: string;
  isVerified: boolean;
  isLocked: boolean;
  lastLoginAt?: string;
  createdAt: string;
  roles?: string[];
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [action, setAction] = useState<'lock' | 'unlock' | 'verify' | 'delete' | null>(null);

  const pageSize = 10;

  const fetchUsers = async (page: number = 1, search?: string, role?: string) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
      });
      if (search) params.append('search', search);
      if (role) params.append('role', role);

      const response = await fetch(`/api/v1/admin/users?${params}`);
      if (!response.ok) throw new Error('Failed to fetch users');

      const data: ApiResponse<{ users: User[]; total: number }> = await response.json();
      if (data.data) {
        setUsers(data.data.users);
        setTotalPages(Math.ceil(data.data.total / pageSize));
        setCurrentPage(page);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1, searchTerm, roleFilter);
  }, []);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    fetchUsers(1, value, roleFilter);
  };

  const handleRoleFilter = (value: string) => {
    setRoleFilter(value);
    fetchUsers(1, searchTerm, value);
  };

  const handleUserAction = async (user: User, act: 'lock' | 'unlock' | 'verify' | 'delete') => {
    setSelectedUser(user);
    setAction(act);
  };

  const confirmAction = async () => {
    if (!selectedUser || !action) return;

    try {
      const response = await fetch(`/api/v1/admin/users`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser.id, action }),
      });

      if (!response.ok) throw new Error('Action failed');

      toast({
        title: 'Success',
        description: `User ${action} successful`,
      });

      fetchUsers(currentPage, searchTerm, roleFilter);
      setSelectedUser(null);
      setAction(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to perform action',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
        <p className="text-sm text-gray-600 mt-1">Manage users, verify accounts, and handle access control</p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            <Input
              placeholder="Search by email or name..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <Select value={roleFilter} onValueChange={handleRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="support">Support</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
No users found            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-mono text-sm">{user.email}</TableCell>
                      <TableCell>{user.fullName || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={user.isLocked ? 'destructive' : 'default'}>
                          {user.isLocked ? 'Locked' : 'Active'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isVerified ? 'default' : 'secondary'}>
                          {user.isVerified ? 'Verified' : 'Unverified'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {user.lastLoginAt ? format(new Date(user.lastLoginAt), 'MMM d, yyyy') : 'Never'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {!user.isVerified && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUserAction(user, 'verify')}
                            >
                              Verify
                            </Button>
                          )}
                          {user.isLocked ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUserAction(user, 'unlock')}
                            >
                              Unlock
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUserAction(user, 'lock')}
                            >
                              Lock
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleUserAction(user, 'delete')}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => fetchUsers(currentPage - 1, searchTerm, roleFilter)}
              >
                Previous
              </Button>
              <span className="flex items-center text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => fetchUsers(currentPage + 1, searchTerm, roleFilter)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </Card>

      {selectedUser && action && (
        <AlertDialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <AlertDialogContent>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {action} {selectedUser.email}? This action may be irreversible.
            </AlertDialogDescription>
            <div className="flex justify-end gap-2">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmAction}>
                {action.charAt(0).toUpperCase() + action.slice(1)}
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
