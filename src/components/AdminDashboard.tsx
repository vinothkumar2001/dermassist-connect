import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  UserCheck, 
  Activity, 
  AlertTriangle, 
  TrendingUp, 
  Shield, 
  Database,
  Settings,
  BarChart3,
  UserPlus,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";

const AdminDashboard = () => {
  const systemStats = {
    totalUsers: 12847,
    activeDoctors: 156,
    casesProcessed: 8432,
    systemUptime: "99.9%"
  };

  const recentUsers = [
    { id: 1, name: "Dr. Sarah Wilson", type: "Doctor", status: "pending", joinDate: "2024-01-15" },
    { id: 2, name: "Patient #12848", type: "Patient", status: "active", joinDate: "2024-01-15" },
    { id: 3, name: "Dr. Michael Chen", type: "Doctor", status: "active", joinDate: "2024-01-14" },
    { id: 4, name: "Patient #12849", type: "Patient", status: "active", joinDate: "2024-01-14" },
  ];

  const systemAlerts = [
    {
      id: 1,
      type: "warning",
      message: "High server load detected in AI processing queue",
      time: "5 minutes ago"
    },
    {
      id: 2, 
      type: "info",
      message: "Monthly backup completed successfully",
      time: "2 hours ago"
    },
    {
      id: 3,
      type: "success", 
      message: "New doctor verification completed",
      time: "4 hours ago"
    }
  ];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-subtle-gradient">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold medical-heading mb-2">Admin Dashboard</h1>
          <p className="clinical-text">System management, user oversight, and analytics for SkinCare AI</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="soft-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold text-primary">{systemStats.totalUsers.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-full">
                  <Users className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-500">+12% from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="soft-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Doctors</p>
                  <p className="text-2xl font-bold text-primary">{systemStats.activeDoctors}</p>
                </div>
                <div className="p-3 bg-secondary/50 rounded-full">
                  <UserCheck className="w-6 h-6 text-secondary-foreground" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-500">+3 new verifications</span>
              </div>
            </CardContent>
          </Card>

          <Card className="soft-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Cases Processed</p>
                  <p className="text-2xl font-bold text-primary">{systemStats.casesProcessed.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-accent/50 rounded-full">
                  <Activity className="w-6 h-6 text-accent-foreground" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <Clock className="w-4 h-4 text-blue-500 mr-1" />
                <span className="text-blue-500">235 today</span>
              </div>
            </CardContent>
          </Card>

          <Card className="soft-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">System Uptime</p>
                  <p className="text-2xl font-bold text-primary">{systemStats.systemUptime}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-500">All systems operational</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="system">System Health</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* User Management */}
          <TabsContent value="users">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="soft-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <UserPlus className="w-5 h-5 text-primary" />
                    <span>Recent User Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/20 medical-transition">
                      <div className="space-y-1">
                        <p className="font-semibold text-sm">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.type} • Joined {user.joinDate}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                          {user.status}
                        </Badge>
                        {user.status === 'pending' && (
                          <div className="flex space-x-1">
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="soft-shadow">
                <CardHeader>
                  <CardTitle>User Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Patients</span>
                        <span>92%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: '92%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Doctors</span>
                        <span>7%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-secondary-foreground h-2 rounded-full" style={{ width: '7%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Admins</span>
                        <span>1%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-accent-foreground h-2 rounded-full" style={{ width: '1%' }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* System Health */}
          <TabsContent value="system">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="soft-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-primary" />
                    <span>System Alerts</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {systemAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{alert.message}</p>
                        <p className="text-xs text-muted-foreground">{alert.time}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="soft-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Database className="w-5 h-5 text-primary" />
                    <span>System Resources</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>CPU Usage</span>
                      <span>45%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Memory Usage</span>
                      <span>67%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '67%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Storage</span>
                      <span>23%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '23%' }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics">
            <Card className="soft-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <span>Platform Analytics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="p-4 bg-muted rounded-full w-fit mx-auto mb-4">
                    <BarChart3 className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-2">Advanced Analytics Coming Soon</h3>
                  <p className="clinical-text">
                    Comprehensive analytics dashboard with detailed insights and reporting capabilities
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings">
            <Card className="soft-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-primary" />
                  <span>System Configuration</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="p-4 bg-muted rounded-full w-fit mx-auto mb-4">
                    <Settings className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-2">Configuration Panel</h3>
                  <p className="clinical-text">
                    System settings and configuration options will be available here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;