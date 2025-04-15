
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import TransactionTable, { Transaction } from '@/components/TransactionTable';
import FilterSection from '@/components/FilterSection';
import FraudAlerts from '@/components/FraudAlerts';
import FraudChart from '@/components/FraudChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Users, TrendingUp, Clock } from 'lucide-react';
import { useEffect } from 'react';

const DashboardPage = () => {
  const { user, isLoading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<{
    station?: string;
    status?: string;
    dateRange?: { from: Date; to: Date };
    query?: string;
  }>({});

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  // Mock stats
  const stats = {
    totalTransactions: 1453,
    flaggedTransactions: 27,
    userActivity: 156,
    pendingReview: 15
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 container py-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-gray-500">
              Welcome back, {user.email} ({user.role})
            </p>
          </div>
          {isAdmin() && (
            <Button 
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => navigate('/settings')}
            >
              API Settings
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Transactions</p>
                <h3 className="text-2xl font-bold">{stats.totalTransactions}</h3>
                <p className="text-xs text-green-600 mt-1">
                  +12% from last week
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Flagged Transactions</p>
                <h3 className="text-2xl font-bold">{stats.flaggedTransactions}</h3>
                <p className="text-xs text-red-600 mt-1">
                  +5% from last week
                </p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">User Activity</p>
                <h3 className="text-2xl font-bold">{stats.userActivity}</h3>
                <p className="text-xs text-blue-600 mt-1">
                  Active users today
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Review</p>
                <h3 className="text-2xl font-bold">{stats.pendingReview}</h3>
                <p className="text-xs text-yellow-600 mt-1">
                  5 high priority
                </p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content with Fraud Alerts */}
        <div className="grid gap-6 md:grid-cols-12">
          {/* Fraud Chart - Larger on desktop */}
          <div className="md:col-span-8">
            <FraudChart />
          </div>
          
          {/* Fraud Alerts - Sidebar on desktop */}
          <div className="md:col-span-4">
            <FraudAlerts />
          </div>
        </div>
        
        {/* Transactions */}
        <Tabs defaultValue="transactions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="flagged">Flagged</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
          </TabsList>
          
          <TabsContent value="transactions" className="space-y-4">
            <FilterSection onFilterChange={handleFilterChange} />
            <TransactionTable filter={filters} />
          </TabsContent>
          
          <TabsContent value="flagged" className="space-y-4">
            <FilterSection onFilterChange={handleFilterChange} />
            <TransactionTable filter={{ ...filters, status: 'flagged' }} />
          </TabsContent>
          
          <TabsContent value="pending" className="space-y-4">
            <FilterSection onFilterChange={handleFilterChange} />
            <TransactionTable filter={{ ...filters, status: 'pending' }} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default DashboardPage;
