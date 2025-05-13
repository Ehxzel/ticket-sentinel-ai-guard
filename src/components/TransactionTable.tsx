
import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ChevronLeft, ChevronRight, Check, AlertTriangle, Clock } from 'lucide-react';
import { fraudDetectionService } from '@/services/fraudDetectionService';
import { useToast } from '@/components/ui/use-toast';

// Define transaction type
export type Transaction = {
  id: string;
  ticketId: string;
  timestamp: string;
  station: string;
  amount: number;
  status: 'pending' | 'flagged' | 'cleared';
  fraudScore?: number;
};

interface TransactionTableProps {
  filter?: {
    station?: string;
    status?: string;
    dateRange?: { from: Date; to: Date };
  };
}

const TransactionTable = ({ filter }: TransactionTableProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const { toast } = useToast();
  
  // Fetch transactions on component mount
  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      try {
        const data = await fraudDetectionService.getTransactions(100);
        
        // Convert API format to component format
        const formattedTransactions = data.map(item => ({
          id: item.ticketId, // Using ticketId as the id for now
          ticketId: item.ticketId,
          timestamp: item.timestamp,
          station: item.station,
          amount: item.amount,
          status: item.status,
          fraudScore: item.fraudScore
        }));
        
        setTransactions(formattedTransactions);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
        toast({
          title: "Error",
          description: "Failed to load transactions. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [toast]);

  // Handle resolving/updating transaction status
  const handleUpdateStatus = async (ticketId: string, newStatus: 'pending' | 'flagged' | 'cleared') => {
    const success = await fraudDetectionService.updateTransactionStatus(ticketId, newStatus);
    if (success) {
      // Update local state to reflect the change
      setTransactions(prevTransactions => 
        prevTransactions.map(tx => 
          tx.ticketId === ticketId ? { ...tx, status: newStatus } : tx
        )
      );
    }
  };
  
  // Format date string to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Get status badge
  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'flagged':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <AlertTriangle className="h-3.5 w-3.5 mr-1" />
            Flagged
          </Badge>
        );
      case 'cleared':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Check className="h-3.5 w-3.5 mr-1" />
            Cleared
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="h-3.5 w-3.5 mr-1" />
            Pending
          </Badge>
        );
      default:
        return null;
    }
  };

  // Filter transactions based on props
  const filteredTransactions = transactions.filter(transaction => {
    if (!filter) return true;
    
    let matches = true;
    
    if (filter.station && filter.station !== 'All Stations') {
      matches = matches && transaction.station === filter.station;
    }
    
    if (filter.status && filter.status !== 'all') {
      matches = matches && transaction.status === filter.status;
    }
    
    if (filter.dateRange) {
      const txDate = new Date(transaction.timestamp);
      const from = filter.dateRange.from;
      const to = filter.dateRange.to;
      
      if (from) matches = matches && txDate >= from;
      if (to) matches = matches && txDate <= to;
    }
    
    return matches;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket ID</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Station</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Risk Score</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-6 w-6 text-purple-500 animate-spin" />
                    <span className="ml-2">Loading transactions...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-gray-500">
                  No transactions found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedTransactions.map((transaction) => (
                <TableRow key={transaction.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{transaction.ticketId}</TableCell>
                  <TableCell>{formatDate(transaction.timestamp)}</TableCell>
                  <TableCell>{transaction.station}</TableCell>
                  <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                  <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                  <TableCell>
                    {transaction.fraudScore !== undefined && (
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                          <div 
                            className={`h-2.5 rounded-full ${
                              transaction.fraudScore > 0.7 
                                ? 'bg-red-500' 
                                : transaction.fraudScore > 0.4 
                                  ? 'bg-yellow-500' 
                                  : 'bg-green-500'
                            }`}
                            style={{ width: `${transaction.fraudScore * 100}%` }}
                          ></div>
                        </div>
                        <span className={`text-xs font-medium ${
                          transaction.fraudScore > 0.7 
                            ? 'text-red-700' 
                            : transaction.fraudScore > 0.4 
                              ? 'text-yellow-700' 
                              : 'text-green-700'
                        }`}>
                          {(transaction.fraudScore * 100).toFixed(0)}%
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {transaction.status !== 'cleared' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-green-200 hover:bg-green-50 hover:text-green-600 text-green-500 text-xs"
                          onClick={() => handleUpdateStatus(transaction.ticketId, 'cleared')}
                        >
                          <Check className="h-3.5 w-3.5 mr-1.5" />
                          Clear
                        </Button>
                      )}
                      {transaction.status !== 'flagged' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-red-200 hover:bg-red-50 hover:text-red-600 text-red-500 text-xs"
                          onClick={() => handleUpdateStatus(transaction.ticketId, 'flagged')}
                        >
                          <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
                          Flag
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionTable;
