import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { toast } from 'sonner';
import axios from 'axios';
import { 
  Shield, 
  Users, 
  FileText, 
  Activity,
  Search,
  Trash2,
  UserCog,
  MessageSquare,
  CheckCircle,
  XCircle
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminDashboard = () => {
  const { isAdmin } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [messages, setMessages] = useState([]);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, usersRes, reportsRes, messagesRes, healthRes] = await Promise.all([
          axios.get(`${API}/admin/stats`),
          axios.get(`${API}/users`),
          axios.get(`${API}/disease-reports`),
          axios.get(`${API}/contact`),
          axios.get(`${API}/health`)
        ]);

        setStats(statsRes.data);
        setUsers(usersRes.data);
        setReports(reportsRes.data);
        setMessages(messagesRes.data);
        setHealth(healthRes.data);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const updateUserRole = async (firebaseUid, newRole) => {
    try {
      await axios.put(`${API}/users/${firebaseUid}`, { role: newRole });
      toast.success('User role updated');
      setUsers(users.map(u => u.firebase_uid === firebaseUid ? { ...u, role: newRole } : u));
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
    }
  };

  const deleteUser = async (firebaseUid) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await axios.delete(`${API}/users/${firebaseUid}`);
      toast.success('User deleted');
      setUsers(users.filter(u => u.firebase_uid !== firebaseUid));
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 mx-auto text-destructive/50 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              You don't have permission to access the admin dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background" data-testid="admin-dashboard">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-['Manrope'] flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            {t('admin')}
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage users, view reports, and monitor system health
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {loading ? (
            [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)
          ) : (
            <>
              <Card className="card-dashboard">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t('totalUsers')}</p>
                      <p className="text-2xl font-bold">{stats?.total_users || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="card-dashboard">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t('totalReports')}</p>
                      <p className="text-2xl font-bold">{stats?.total_reports || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="card-dashboard">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t('totalMessages')}</p>
                      <p className="text-2xl font-bold">{stats?.total_messages || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="card-dashboard">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      health?.status === 'healthy' ? 'bg-green-500/10' : 'bg-red-500/10'
                    }`}>
                      <Activity className={`w-5 h-5 ${
                        health?.status === 'healthy' ? 'text-green-500' : 'text-red-500'
                      }`} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">System Status</p>
                      <p className="text-lg font-semibold capitalize">{health?.status || 'Unknown'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-xl">
            <TabsTrigger value="users" data-testid="users-tab">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="reports" data-testid="reports-tab">
              <FileText className="w-4 h-4 mr-2" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="messages" data-testid="messages-tab">
              <MessageSquare className="w-4 h-4 mr-2" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="health" data-testid="health-tab">
              <Activity className="w-4 h-4 mr-2" />
              Health
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="card-dashboard">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <CardTitle>{t('userManagement')}</CardTitle>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12" />)}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">
                              {user.display_name || 'No name'}
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Select
                                value={user.role}
                                onValueChange={(v) => updateUserRole(user.firebase_uid, v)}
                              >
                                <SelectTrigger className="w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="user">User</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              {new Date(user.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                                onClick={() => deleteUser(user.firebase_uid)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <Card className="card-dashboard">
              <CardHeader>
                <CardTitle>Disease Reports</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16" />)}
                  </div>
                ) : reports.length > 0 ? (
                  <div className="space-y-3">
                    {reports.slice(0, 20).map((report) => (
                      <div 
                        key={report.id}
                        className="p-4 bg-muted/30 rounded-xl flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium">{report.crop_name} - {report.disease_name}</p>
                          <p className="text-sm text-muted-foreground">
                            User: {report.user_id.slice(0, 8)}... | 
                            {new Date(report.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={
                          report.severity === 'High' || report.severity === 'Critical' 
                            ? 'destructive' 
                            : report.severity === 'Medium' 
                            ? 'warning' 
                            : 'default'
                        }>
                          {report.severity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No reports yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <Card className="card-dashboard">
              <CardHeader>
                <CardTitle>Contact Messages</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}
                  </div>
                ) : messages.length > 0 ? (
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div key={msg.id} className="p-4 bg-muted/30 rounded-xl">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">{msg.name}</p>
                            <p className="text-sm text-muted-foreground">{msg.email}</p>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(msg.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="font-medium text-sm mb-1">{msg.subject}</p>
                        <p className="text-sm text-muted-foreground">{msg.message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No messages yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Health Tab */}
          <TabsContent value="health">
            <Card className="card-dashboard">
              <CardHeader>
                <CardTitle>{t('apiHealth')}</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-40" />
                ) : health ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl">
                      {health.status === 'healthy' ? (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-500" />
                      )}
                      <div>
                        <p className="font-medium">System Status</p>
                        <p className="text-sm text-muted-foreground capitalize">{health.status}</p>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-muted/30 rounded-xl">
                        <p className="text-sm text-muted-foreground mb-1">Database</p>
                        <p className="font-medium capitalize">{health.database}</p>
                      </div>
                      <div className="p-4 bg-muted/30 rounded-xl">
                        <p className="text-sm text-muted-foreground mb-1">Azure OpenAI</p>
                        <p className="font-medium capitalize">{health.azure_openai}</p>
                      </div>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-xl">
                      <p className="text-sm text-muted-foreground mb-1">Last Check</p>
                      <p className="font-medium">
                        {new Date(health.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Unable to fetch health status</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
