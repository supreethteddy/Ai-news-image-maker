import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Search, 
  Filter,
  RefreshCw,
  Eye,
  Flag,
  Ban,
  CheckCircle,
  XCircle,
  Coins,
  FileText,
  CreditCard,
  Calendar,
  AlertTriangle,
  MoreHorizontal,
  Shield,
  UserX
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [actionReason, setActionReason] = useState('');
  const { token } = useAuth();

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      const response = await fetch(`https://ai-news-image-maker.onrender.com/api/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.data || []);
      } else {
        toast.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  // Fetch detailed user profile
  const fetchUserDetails = async (userId) => {
    try {
      const response = await fetch(`https://ai-news-image-maker.onrender.com/api/admin/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedUser(data.data);
        setShowUserModal(true);
      } else {
        toast.error('Failed to fetch user details');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('Error fetching user details');
    }
  };

  // Perform admin action
  const performAction = async () => {
    if (!selectedUser || !actionType) return;

    try {
      let endpoint = '';
      let method = 'POST';
      let body = {};

      switch (actionType) {
        case 'flag':
          endpoint = `/api/admin/users/${selectedUser.id}/flag`;
          body = { reason: actionReason };
          break;
        case 'unflag':
          endpoint = `/api/admin/users/${selectedUser.id}/unflag`;
          break;
        case 'ban':
          endpoint = `/api/admin/users/${selectedUser.id}/status`;
          body = { status: 'banned', reason: actionReason };
          break;
        case 'activate':
          endpoint = `/api/admin/users/${selectedUser.id}/status`;
          body = { status: 'active', reason: actionReason };
          break;
        case 'deactivate':
          endpoint = `/api/admin/users/${selectedUser.id}/status`;
          body = { status: 'inactive', reason: actionReason };
          break;
      }

      const response = await fetch(`https://ai-news-image-maker.onrender.com${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        toast.success(`User ${actionType} action completed successfully`);
        setShowActionModal(false);
        setActionReason('');
        fetchUsers();
        if (showUserModal) {
          fetchUserDetails(selectedUser.id);
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || `Failed to ${actionType} user`);
      }
    } catch (error) {
      console.error(`Error performing ${actionType}:`, error);
      toast.error(`Error performing ${actionType}`);
    }
  };

  // Open action modal
  const openActionModal = (type, user) => {
    setSelectedUser(user);
    setActionType(type);
    setActionReason('');
    setShowActionModal(true);
  };

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, statusFilter]);

  // Filter users based on search and status
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Get status badge variant
  const getStatusBadge = (status, isFlagged) => {
    if (isFlagged) {
      return <Badge variant="destructive" className="flex items-center gap-1">
        <Flag className="h-3 w-3" />
        Flagged
      </Badge>;
    }
    
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'banned':
        return <Badge variant="destructive">Banned</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Management
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1 border rounded"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="banned">Banned</option>
              </select>
            </div>
            <Button onClick={fetchUsers} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{user.name}</h3>
                    {getStatusBadge(user.status, user.is_flagged)}
                    {user.role === 'admin' && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        Admin
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{user.email}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Coins className="h-4 w-4" />
                      <span>{user.credits || 0} credits</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      <span>{user.storyboards?.[0]?.count || 0} storyboards</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CreditCard className="h-4 w-4" />
                      <span>${user.credit_purchases?.[0]?.sum || 0} spent</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {user.is_flagged && user.flag_reason && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                      <strong>Flag Reason:</strong> {user.flag_reason}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => fetchUserDetails(user.id)}
                    variant="outline"
                    size="sm"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                  
                  {user.is_flagged ? (
                    <Button
                      onClick={() => openActionModal('unflag', user)}
                      variant="outline"
                      size="sm"
                      className="text-green-600 border-green-600 hover:bg-green-50"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Unflag
                    </Button>
                  ) : (
                    <Button
                      onClick={() => openActionModal('flag', user)}
                      variant="outline"
                      size="sm"
                      className="text-orange-600 border-orange-600 hover:bg-orange-50"
                    >
                      <Flag className="h-4 w-4 mr-1" />
                      Flag
                    </Button>
                  )}
                  
                  {user.status === 'banned' ? (
                    <Button
                      onClick={() => openActionModal('activate', user)}
                      variant="outline"
                      size="sm"
                      className="text-green-600 border-green-600 hover:bg-green-50"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Activate
                    </Button>
                  ) : (
                    <Button
                      onClick={() => openActionModal('ban', user)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <Ban className="h-4 w-4 mr-1" />
                      Ban
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Details Modal */}
      <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Details: {selectedUser?.name}
            </DialogTitle>
            <DialogDescription>
              Complete profile and activity information
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="storyboards">Storyboards</TabsTrigger>
                <TabsTrigger value="purchases">Purchases</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Name</label>
                        <p className="text-sm text-muted-foreground">{selectedUser.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Email</label>
                        <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Role</label>
                        <p className="text-sm text-muted-foreground">{selectedUser.role}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Status</label>
                        <div className="mt-1">
                          {getStatusBadge(selectedUser.status, selectedUser.is_flagged)}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Credits</label>
                        <p className="text-sm text-muted-foreground">{selectedUser.credits || 0}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Joined</label>
                        <p className="text-sm text-muted-foreground">
                          {new Date(selectedUser.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    {selectedUser.is_flagged && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded">
                        <h4 className="font-semibold text-red-800 mb-2">Flagged User</h4>
                        <p className="text-sm text-red-700 mb-2">
                          <strong>Reason:</strong> {selectedUser.flag_reason}
                        </p>
                        <p className="text-xs text-red-600">
                          Flagged on {new Date(selectedUser.flagged_at).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Storyboards Tab */}
              <TabsContent value="storyboards" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>User Storyboards ({selectedUser.storyboards?.length || 0})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedUser.storyboards?.map((storyboard) => (
                        <div key={storyboard.id} className="p-3 border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium">{storyboard.title}</h4>
                            <Badge variant="outline">{storyboard.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {storyboard.original_text?.substring(0, 150)}...
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{storyboard.storyboard_parts?.length || 0} scenes</span>
                            <span>Created {new Date(storyboard.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      )) || (
                        <p className="text-muted-foreground text-center py-4">No storyboards created yet</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Purchases Tab */}
              <TabsContent value="purchases" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Purchase History ({selectedUser.credit_purchases?.length || 0})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedUser.credit_purchases?.map((purchase) => (
                        <div key={purchase.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{purchase.credit_packages?.name}</h4>
                            <Badge variant="default">${purchase.amount_paid}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{purchase.credits_purchased} + {purchase.bonus_credits} bonus = {purchase.total_credits} credits</span>
                            <span>{purchase.payment_method}</span>
                            <span>{new Date(purchase.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      )) || (
                        <p className="text-muted-foreground text-center py-4">No purchases made yet</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Credit Activity ({selectedUser.credit_transactions?.length || 0})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedUser.credit_transactions?.map((transaction) => (
                        <div key={transaction.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{transaction.description}</span>
                            <Badge variant={transaction.transaction_type === 'credit' ? 'default' : 'destructive'}>
                              {transaction.transaction_type === 'credit' ? '+' : ''}{transaction.amount}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{transaction.transaction_type}</span>
                            <span>{transaction.reference_type}</span>
                            <span>{new Date(transaction.created_at).toLocaleString()}</span>
                          </div>
                        </div>
                      )) || (
                        <p className="text-muted-foreground text-center py-4">No credit activity yet</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Modal */}
      <Dialog open={showActionModal} onOpenChange={setShowActionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Confirm Action: {actionType}
            </DialogTitle>
            <DialogDescription>
              You are about to {actionType} user: {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {(actionType === 'flag' || actionType === 'ban' || actionType === 'activate') && (
              <div>
                <label className="text-sm font-medium">Reason (required)</label>
                <Textarea
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder={`Enter reason for ${actionType}ing this user...`}
                  className="mt-1"
                />
              </div>
            )}

            <div className="flex items-center gap-2 justify-end">
              <Button
                onClick={() => setShowActionModal(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={performAction}
                disabled={
                  (actionType === 'flag' || actionType === 'ban' || actionType === 'activate') && 
                  !actionReason.trim()
                }
                variant={actionType === 'ban' ? 'destructive' : 'default'}
              >
                Confirm {actionType}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;