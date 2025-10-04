import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Coins, 
  Plus, 
  Minus, 
  Search, 
  Filter,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  CreditCard
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const CreditManagement = () => {
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [creditAmount, setCreditAmount] = useState('');
  const [description, setDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [transactionFilter, setTransactionFilter] = useState('all');
  const [purchases, setPurchases] = useState([]);
  const { token } = useAuth();

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/admin/users', {
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

  // Fetch credit transactions
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/credits/admin/transactions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTransactions(data.data || []);
      } else {
        toast.error('Failed to fetch transactions');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Error fetching transactions');
    } finally {
      setLoading(false);
    }
  };

  // Fetch credit purchases
  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/credits/admin/purchases', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPurchases(data.data || []);
      } else {
        toast.error('Failed to fetch purchases');
      }
    } catch (error) {
      console.error('Error fetching purchases:', error);
      toast.error('Error fetching purchases');
    } finally {
      setLoading(false);
    }
  };

  // Add credits to user
  const addCredits = async () => {
    if (!selectedUser || !creditAmount) {
      toast.error('Please select a user and enter credit amount');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/credits/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          amount: parseInt(creditAmount),
          description: description || 'Admin credit bonus'
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Added ${creditAmount} credits to ${selectedUser.name}`);
        setCreditAmount('');
        setDescription('');
        setSelectedUser(null);
        fetchUsers();
        fetchTransactions();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to add credits');
      }
    } catch (error) {
      console.error('Error adding credits:', error);
      toast.error('Error adding credits');
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchTransactions();
    fetchPurchases();
  }, []);

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    if (transactionFilter === 'all') return true;
    return transaction.transaction_type === transactionFilter;
  });

  // Calculate statistics
  const totalCreditsIssued = transactions
    .filter(t => t.transaction_type === 'credit')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalCreditsUsed = transactions
    .filter(t => t.transaction_type === 'debit')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalActiveUsers = users.filter(u => u.credits > 0).length;

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Credits Issued</p>
                <p className="text-2xl font-bold text-green-600">{totalCreditsIssued}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Credits Used</p>
                <p className="text-2xl font-bold text-red-600">{totalCreditsUsed}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Users with Credits</p>
                <p className="text-2xl font-bold text-blue-600">{totalActiveUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold text-purple-600">{users.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="add-credits">Add Credits</TabsTrigger>
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
          <TabsTrigger value="purchases">Purchase History</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Credit Balances
              </CardTitle>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Button onClick={fetchUsers} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={user.credits > 0 ? 'default' : 'destructive'}>
                        <Coins className="h-3 w-3 mr-1" />
                        {user.credits || 0} credits
                      </Badge>
                      <Button
                        onClick={() => setSelectedUser(user)}
                        variant="outline"
                        size="sm"
                      >
                        Add Credits
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Add Credits Tab */}
        <TabsContent value="add-credits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add Credits to User
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedUser ? (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="font-medium">Selected User:</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.name} ({selectedUser.email})
                  </p>
                  <p className="text-sm">
                    Current Credits: <Badge>{selectedUser.credits || 0}</Badge>
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Please select a user from the User Management tab first.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="creditAmount">Credit Amount</Label>
                  <Input
                    id="creditAmount"
                    type="number"
                    min="1"
                    placeholder="Enter number of credits"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    placeholder="e.g., Promotional bonus"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              <Button
                onClick={addCredits}
                disabled={!selectedUser || !creditAmount}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add {creditAmount || 0} Credits
              </Button>

              {selectedUser && (
                <Button
                  onClick={() => setSelectedUser(null)}
                  variant="outline"
                  className="w-full"
                >
                  Clear Selection
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Credit Transaction History
              </CardTitle>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  value={transactionFilter}
                  onChange={(e) => setTransactionFilter(e.target.value)}
                  className="px-3 py-1 border rounded"
                >
                  <option value="all">All Transactions</option>
                  <option value="credit">Credits Added</option>
                  <option value="debit">Credits Used</option>
                  <option value="bonus">Bonuses</option>
                </select>
                <Button onClick={fetchTransactions} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">
                        {transaction.user_profiles?.name || 'Unknown User'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={transaction.transaction_type === 'credit' ? 'default' : 'destructive'}
                      >
                        {transaction.transaction_type === 'credit' ? '+' : ''}
                        {transaction.amount}
                      </Badge>
                      <Badge variant="outline">
                        {transaction.transaction_type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Purchases Tab */}
        <TabsContent value="purchases" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Credit Purchase History
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button onClick={fetchPurchases} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {purchases.map((purchase) => (
                  <div key={purchase.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">
                        {purchase.user_profiles?.name || 'Unknown User'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {purchase.credit_packages?.name || 'Unknown Package'} - ${purchase.amount_paid}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(purchase.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">
                        +{purchase.total_credits} credits
                      </Badge>
                      <Badge variant={purchase.payment_status === 'completed' ? 'default' : 'destructive'}>
                        {purchase.payment_status}
                      </Badge>
                      <Badge variant="outline">
                        {purchase.payment_method}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CreditManagement;
