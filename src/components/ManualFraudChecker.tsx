
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Search, AlertTriangle } from 'lucide-react';
import { fraudDetectionService } from '@/services/fraudDetectionService';
import { useToast } from '@/hooks/use-toast';

const ManualFraudChecker = () => {
  const [formData, setFormData] = useState({
    ticket_id: '',
    user_id: '',
    timestamp: new Date().toISOString().slice(0, 16), // datetime-local format
    origin_station: '',
    destination_station: '',
    amount: '',
    device_id: ''
  });
  const [isChecking, setIsChecking] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const { toast } = useToast();

  const stations = [
    "London Euston",
    "Liverpool Lime Street", 
    "Manchester Piccadilly",
    "Birmingham New Street",
    "York"
  ];

  // Auto-generate IDs on component mount
  useEffect(() => {
    const generateIds = () => {
      const ticketId = `TX-${Math.floor(Math.random() * 100000)}`;
      const userId = `USER-${Math.floor(Math.random() * 1000)}`;
      const deviceId = `DEV-${Math.floor(Math.random() * 10000)}`;
      
      setFormData(prev => ({
        ...prev,
        ticket_id: ticketId,
        user_id: userId,
        device_id: deviceId
      }));
    };

    generateIds();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.ticket_id || !formData.amount || !formData.origin_station) {
      toast({
        title: "Missing Information",
        description: "Please fill in at least Ticket ID, Amount, and Origin Station.",
        variant: "destructive",
      });
      return;
    }
    
    setIsChecking(true);
    setResponse(null);
    
    try {
      const amountValue = parseFloat(formData.amount);
      if (isNaN(amountValue)) {
        toast({
          title: "Invalid Amount",
          description: "Please enter a valid amount.",
          variant: "destructive",
        });
        return;
      }
      
      // Convert timestamp to ISO string if needed
      const timestamp = formData.timestamp ? new Date(formData.timestamp).toISOString() : new Date().toISOString();
      
      const result = await fraudDetectionService.analyzeTransaction({
        ticketId: formData.ticket_id,
        timestamp: timestamp,
        station: formData.origin_station, // Using origin_station as the main station for analysis
        amount: amountValue
      });
      
      if (result) {
        // Format response to include additional fields for display
        const enhancedResponse = {
          ...result,
          user_id: formData.user_id,
          origin_station: formData.origin_station,
          destination_station: formData.destination_station,
          device_id: formData.device_id,
          prediction: {
            fraud_score: result.fraudScore,
            status: result.status,
            risk_level: result.fraudScore > 0.7 ? 'HIGH' : result.fraudScore > 0.4 ? 'MEDIUM' : 'LOW'
          }
        };
        
        setResponse(enhancedResponse);
        toast({
          title: "Fraud Check Complete",
          description: `Ticket ${formData.ticket_id} analyzed successfully.`,
        });
      }
    } catch (error) {
      console.error("Error checking fraud:", error);
      toast({
        title: "Check Failed",
        description: "An error occurred while checking for fraud. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  const resetForm = () => {
    // Generate new IDs on reset
    const ticketId = `TX-${Math.floor(Math.random() * 100000)}`;
    const userId = `USER-${Math.floor(Math.random() * 1000)}`;
    const deviceId = `DEV-${Math.floor(Math.random() * 10000)}`;
    
    setFormData({
      ticket_id: ticketId,
      user_id: userId,
      timestamp: new Date().toISOString().slice(0, 16),
      origin_station: '',
      destination_station: '',
      amount: '',
      device_id: deviceId
    });
    setResponse(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ticket Sentinel AI Guard</CardTitle>
        <CardDescription>
          Real-time fraud detection on train tickets using AI.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Section */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ticket_id">Ticket ID</Label>
                <Input
                  id="ticket_id"
                  value={formData.ticket_id}
                  readOnly
                  className="bg-gray-100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="user_id">User ID</Label>
                <Input
                  id="user_id"
                  value={formData.user_id}
                  readOnly
                  className="bg-gray-100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timestamp">Timestamp</Label>
                <Input
                  id="timestamp"
                  type="datetime-local"
                  value={formData.timestamp}
                  onChange={(e) => handleInputChange('timestamp', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="origin_station">Origin Station</Label>
                <Select value={formData.origin_station} onValueChange={(value) => handleInputChange('origin_station', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select origin station" />
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
                <Label htmlFor="destination_station">Destination Station</Label>
                <Select value={formData.destination_station} onValueChange={(value) => handleInputChange('destination_station', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination station" />
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
                <Label htmlFor="amount">Ticket Price (£)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="device_id">Device ID</Label>
                <Input
                  id="device_id"
                  value={formData.device_id}
                  readOnly
                  className="bg-gray-100"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Reset
                </Button>
                <Button type="submit" disabled={isChecking}>
                  {isChecking ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Check Fraud
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Response Section */}
          <div>
            <div className="space-y-2 mb-4">
              <Label>Prediction Results</Label>
            </div>
            
            {response ? (
              <div className="bg-slate-50 rounded-lg p-4 border">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Status:</span>
                    <span className={`flex items-center ${
                      response.status === 'flagged' ? 'text-red-600' :
                      response.status === 'pending' ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {response.status === 'flagged' && <AlertTriangle className="w-4 h-4 mr-1" />}
                      {response.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Risk Level:</span>
                    <span className={`font-bold ${
                      response.prediction.risk_level === 'HIGH' ? 'text-red-600' :
                      response.prediction.risk_level === 'MEDIUM' ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {response.prediction.risk_level}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Fraud Score:</span>
                    <span className="font-mono">{(response.fraudScore * 100).toFixed(1)}%</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <div className="text-sm">
                    <h4 className="font-medium mb-2">Raw Response:</h4>
                    <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                      {JSON.stringify(response, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-100 rounded-lg p-4 border">
                <p className="text-gray-500 text-center">
                  // Result will appear here
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ManualFraudChecker;
