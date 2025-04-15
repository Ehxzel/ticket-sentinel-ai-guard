
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ChevronLeft, ChevronRight, Check, AlertTriangle, Clock } from 'lucide-react';

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

// Mock transaction data
const mockTransactions: Transaction[] = [
  {
    id: '1',
    ticketId: 'T-4587',
    timestamp: '2025-04-14T09:15:00Z',
    station: 'Central Station',
    amount: 5.50,
    status: 'flagged',
    fraudScore: 0.92
  },
  {
    id: '2',
    ticketId: 'T-4588',
    timestamp: '2025-04-14T09:20:00Z',
    station: 'North Station',
    amount: 3.75,
    status: 'cleared',
    fraudScore: 0.15
  },
  {
    id: '3',
    ticketId: 'T-4589',
    timestamp: '2025-04-14T09:30:00Z',
    station: 'West Terminal',
    amount: 4.50,
    status: 'pending',
    fraudScore: 0.45
  },
  {
    id: '4',
    ticketId: 'T-4590',
    timestamp: '2025-04-14T09:45:00Z',
    station: 'South Gate',
    amount: 2.25,
    status: 'cleared',
    fraudScore: 0.08
  },
  {
    id: '5',
    ticketId: 'T-4591',
    timestamp: '2025-04-14T10:00:00Z',
    station: 'East Station',
    amount: 6.00,
    status: 'flagged',
    fraudScore: 0.85
  },
  {
    id: '6',
    ticketId: 'T-4592',
    timestamp: '2025-04-14T10:15:00Z',
    station: 'Central Station',
    amount: 5.50,
    status: 'cleared',
    fraudScore: 0.22
  },
  {
    id: '7',
    ticketId: 'T-4593',
    timestamp: '2025-04-14T10:30:00Z',
    station: 'North Station',
    amount: 3.75,
    status: 'pending',
    fraudScore: 0.55
  },
  {
    id: '8',
    ticketId: 'T-4594',
    timestamp: '2025-04-14T10:45:00Z',
    station: 'Airport Terminal',
    amount: 8.50,
    status: 'cleared',
    fraudScore: 0.12
  },
];

interface TransactionTableProps {
  filter?: {
    station?: string;
    status?: string;
    dateRange?: { from: Date; to: Date };
  };
}

const TransactionTable = ({ filter }: TransactionTableProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
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
  const filteredTransactions = mockTransactions.filter(transaction => {
    if (!filter) return true;
    
    let matches = true;
    
    if (filter.station && filter.station !== 'all') {
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-6 w-6 text-purple-500 animate-spin" />
                    <span className="ml-2">Loading transactions...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-gray-500">
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
