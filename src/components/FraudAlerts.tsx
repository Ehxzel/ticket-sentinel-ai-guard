
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Check, Bell, ChevronRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

type Alert = {
  id: string;
  transactionId: string;
  ticketId: string;
  timestamp: string;
  fraudScore: number;
  message: string;
  isResolved: boolean;
};

// Mock alerts data
const mockAlerts: Alert[] = [
  {
    id: '1',
    transactionId: 'tx-12345',
    ticketId: 'T-4587',
    timestamp: '2025-04-14T09:15:00Z',
    fraudScore: 0.92,
    message: 'High probability of fraudulent ticket detected at Central Station. Multiple usage attempts.',
    isResolved: false
  },
  {
    id: '2',
    transactionId: 'tx-12346',
    ticketId: 'T-4591',
    timestamp: '2025-04-14T10:00:00Z',
    fraudScore: 0.85,
    message: 'Unusual ticket redemption pattern at East Station. Potential ticket cloning.',
    isResolved: false
  },
  {
    id: '3',
    transactionId: 'tx-12347',
    ticketId: 'T-4490',
    timestamp: '2025-04-14T08:30:00Z',
    fraudScore: 0.76,
    message: 'Suspicious activity detected. Ticket used in different stations within short timeframe.',
    isResolved: true
  }
];

const FraudAlerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const { toast } = useToast();

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

  // Handle resolving an alert
  const handleResolve = (alertId: string) => {
    setAlerts(prevAlerts => 
      prevAlerts.map(alert => 
        alert.id === alertId 
          ? { ...alert, isResolved: true } 
          : alert
      )
    );
    
    toast({
      title: "Alert Resolved",
      description: "The fraud alert has been marked as resolved.",
      variant: "default",
    });
  };

  // Get unresolved alerts
  const unresolvedAlerts = alerts.filter(alert => !alert.isResolved);
  
  // If there are no unresolved alerts, show a message
  if (unresolvedAlerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center">
            <Bell className="mr-2 h-5 w-5 text-gray-500" />
            Fraud Alerts
          </CardTitle>
          <CardDescription>
            No active fraud alerts at the moment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-6 text-center text-sm text-gray-500">
            <div>
              <Check className="h-10 w-10 text-green-500 mx-auto mb-2" />
              <p>All clear! There are no active fraud alerts.</p>
              <p className="mt-1">The system will notify you when new alerts are detected.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-red-100">
      <CardHeader className="pb-3 border-b border-red-100">
        <CardTitle className="text-lg font-medium flex items-center">
          <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
          Active Fraud Alerts ({unresolvedAlerts.length})
        </CardTitle>
        <CardDescription>
          Recent fraud alerts that require your attention
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-red-100">
          {unresolvedAlerts.map((alert) => (
            <div key={alert.id} className="p-4 fraud-alert">
              <div className="flex justify-between mb-1">
                <div className="flex items-center">
                  <span className="font-medium">{alert.ticketId}</span>
                  <Badge className="ml-2 bg-red-500 hover:bg-red-600">
                    {(alert.fraudScore * 100).toFixed(0)}% Risk
                  </Badge>
                </div>
                <span className="text-xs text-gray-500">{formatDate(alert.timestamp)}</span>
              </div>
              <p className="text-sm mb-3">{alert.message}</p>
              <div className="flex justify-between items-center">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-red-200 hover:bg-red-50 hover:text-red-600 text-red-500 text-xs"
                  onClick={() => handleResolve(alert.id)}
                >
                  <Check className="h-3.5 w-3.5 mr-1.5" />
                  Resolve
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-red-200 hover:bg-red-50 text-xs"
                >
                  View Details
                  <ChevronRight className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FraudAlerts;
