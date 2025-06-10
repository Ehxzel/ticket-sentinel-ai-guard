
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import TransactionTable from '@/components/TransactionTable';
import FilterSection from '@/components/FilterSection';
import ManualFraudChecker from '@/components/ManualFraudChecker';
import LogTransactionForm from '@/components/LogTransactionForm';
import AutoLogger from '@/components/AutoLogger';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const TransactionsPage = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<{
    station?: string;
    status?: string;
    dateRange?: { from: Date; to: Date };
    query?: string;
  }>({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  // Handle filter changes
  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  // Refresh data when a new transaction is added
  const handleTransactionAdded = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

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
            <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
            <p className="text-gray-500">
              Manage and analyze ticket transactions
            </p>
          </div>
        </div>

        {/* Manual Fraud Checker */}
        <ManualFraudChecker />
        
        {/* Data Logging Section */}
        <div className="grid gap-6 md:grid-cols-2">
          <LogTransactionForm onTransactionAdded={handleTransactionAdded} />
          <AutoLogger onTransactionAdded={handleTransactionAdded} />
        </div>
        
        {/* Transactions */}
        <Tabs defaultValue="transactions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="transactions">All Transactions</TabsTrigger>
            <TabsTrigger value="flagged">Flagged</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
          </TabsList>
          
          <TabsContent value="transactions" className="space-y-4">
            <FilterSection onFilterChange={handleFilterChange} />
            <TransactionTable filter={filters} key={`transactions-${refreshTrigger}`} />
          </TabsContent>
          
          <TabsContent value="flagged" className="space-y-4">
            <FilterSection onFilterChange={handleFilterChange} />
            <TransactionTable filter={{ ...filters, status: 'flagged' }} key={`flagged-${refreshTrigger}`} />
          </TabsContent>
          
          <TabsContent value="pending" className="space-y-4">
            <FilterSection onFilterChange={handleFilterChange} />
            <TransactionTable filter={{ ...filters, status: 'pending' }} key={`pending-${refreshTrigger}`} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default TransactionsPage;
