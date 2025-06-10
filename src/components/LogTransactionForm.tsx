
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fraudDetectionService } from '@/services/fraudDetectionService';

// Station options - using the same stations as ManualFraudChecker for consistency
const stations = [
  "London Euston",
  "Liverpool Lime Street", 
  "Manchester Piccadilly",
  "Birmingham New Street",
  "York"
];

const LogTransactionForm = ({ onTransactionAdded }: { onTransactionAdded?: () => void }) => {
  const [ticketId, setTicketId] = useState('');
  const [selectedStation, setSelectedStation] = useState('');
  const [amount, setAmount] = useState('');
  const [isLogging, setIsLogging] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ticketId || !selectedStation || !amount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLogging(true);
    
    try {
      const amountValue = parseFloat(amount);
      if (isNaN(amountValue)) {
        toast({
          title: "Invalid Amount",
          description: "Please enter a valid amount.",
          variant: "destructive",
        });
        setIsLogging(false);
        return;
      }
      
      console.log("Logging transaction with data:", {
        ticketId,
        timestamp: new Date().toISOString(),
        station: selectedStation,
        amount: amountValue
      });
      
      const response = await fraudDetectionService.analyzeTransaction({
        ticketId,
        timestamp: new Date().toISOString(),
        station: selectedStation,
        amount: amountValue
      });
      
      if (response) {
        console.log("Transaction logged successfully:", response);
        toast({
          title: "Transaction Logged",
          description: `Ticket ${ticketId} has been successfully logged and analyzed.`,
        });
        resetForm();
        
        // Call the refresh callback to update the transaction table
        console.log("Transaction added successfully, calling refresh callback");
        if (onTransactionAdded) {
          onTransactionAdded();
        }
      }
    } catch (error) {
      console.error("Error logging transaction:", error);
      toast({
        title: "Logging Failed",
        description: "An error occurred while logging the transaction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLogging(false);
    }
  };

  const generateTicketId = () => {
    const prefix = 'T-';
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setTicketId(prefix + randomNum);
  };

  const resetForm = () => {
    setTicketId('');
    setSelectedStation('');
    setAmount('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log Transaction</CardTitle>
        <CardDescription>
          Manually add a new ticket transaction to the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="log-ticket-id">Ticket ID</Label>
              <div className="flex space-x-2">
                <Input
                  id="log-ticket-id"
                  placeholder="Enter ticket ID"
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value)}
                  className="flex-1"
                />
                <Button type="button" variant="outline" onClick={generateTicketId}>
                  Generate
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="log-station">Station</Label>
              <Select value={selectedStation} onValueChange={setSelectedStation}>
                <SelectTrigger id="log-station">
                  <SelectValue placeholder="Select station" />
                </SelectTrigger>
                <SelectContent>
                  {stations.map((station) => (
                    <SelectItem key={station} value={station}>
                      {station}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="log-amount">Amount (£)</Label>
              <Input
                id="log-amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <Button type="button" variant="outline" onClick={resetForm}>
                Reset
              </Button>
              <Button type="submit" disabled={isLogging}>
                {isLogging ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging...
                  </>
                ) : (
                  <>
                    Log Transaction
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="bg-slate-50 border-t">
        <p className="text-sm text-gray-500">
          Transactions are automatically analyzed for potential fraud when logged.
        </p>
      </CardFooter>
    </Card>
  );
};

export default LogTransactionForm;
