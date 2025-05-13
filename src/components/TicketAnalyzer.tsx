
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, AlertTriangle, ArrowRight } from 'lucide-react';
import { fraudDetectionService } from '@/services/fraudDetectionService';
import { useToast } from '@/components/ui/use-toast';

// Get unique stations from transactions
const stations = [
  'Central Station',
  'North Station',
  'South Gate',
  'East Station',
  'West Terminal',
  'Airport Terminal',
];

const TicketAnalyzer = () => {
  const [ticketId, setTicketId] = useState('');
  const [selectedStation, setSelectedStation] = useState('');
  const [amount, setAmount] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
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
    
    setIsAnalyzing(true);
    setResult(null);
    
    try {
      const amountValue = parseFloat(amount);
      if (isNaN(amountValue)) {
        toast({
          title: "Invalid Amount",
          description: "Please enter a valid amount.",
          variant: "destructive",
        });
        return;
      }
      
      const response = await fraudDetectionService.analyzeTransaction({
        ticketId,
        station: selectedStation,
        amount: amountValue
      });
      
      if (response) {
        setResult(response);
        toast({
          title: "Analysis Complete",
          description: `Ticket ${ticketId} has been analyzed.`,
        });
      }
    } catch (error) {
      console.error("Error analyzing ticket:", error);
      toast({
        title: "Analysis Failed",
        description: "An error occurred while analyzing the ticket. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
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
    setResult(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analyze Ticket</CardTitle>
        <CardDescription>
          Submit a ticket transaction for fraud analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ticket-id">Ticket ID</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="ticket-id"
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
                  <Label htmlFor="station">Station</Label>
                  <Select value={selectedStation} onValueChange={setSelectedStation}>
                    <SelectTrigger id="station">
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
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
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
                  <Button type="submit" disabled={isAnalyzing}>
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        Analyze Ticket
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {result && (
              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Analysis Results</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Ticket ID:</span>
                    <span className="font-medium">{result.ticketId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Station:</span>
                    <span>{result.station}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Amount:</span>
                    <span>${result.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status:</span>
                    <span>
                      {result.status === 'flagged' && (
                        <span className="flex items-center text-red-600">
                          <AlertTriangle className="inline-block mr-1 h-4 w-4" />
                          Flagged
                        </span>
                      )}
                      {result.status === 'cleared' && (
                        <span className="text-green-600">Cleared</span>
                      )}
                      {result.status === 'pending' && (
                        <span className="text-yellow-600">Pending Review</span>
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-1">Fraud Risk Score:</span>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-3 mr-2">
                        <div 
                          className={`h-3 rounded-full ${
                            result.fraudScore > 0.7 
                              ? 'bg-red-500' 
                              : result.fraudScore > 0.4 
                                ? 'bg-yellow-500' 
                                : 'bg-green-500'
                          }`}
                          style={{ width: `${result.fraudScore * 100}%` }}
                        ></div>
                      </div>
                      <span className={`text-sm font-medium ${
                        result.fraudScore > 0.7 
                          ? 'text-red-700' 
                          : result.fraudScore > 0.4 
                            ? 'text-yellow-700' 
                            : 'text-green-700'
                      }`}>
                        {(result.fraudScore * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>
      </CardContent>
      {!result && (
        <CardFooter className="border-t px-6 py-4 bg-slate-50">
          <p className="text-sm text-gray-500">
            Submit a ticket to analyze it for potential fraud. The system will evaluate the ticket 
            and provide a fraud risk score.
          </p>
        </CardFooter>
      )}
    </Card>
  );
};

export default TicketAnalyzer;
