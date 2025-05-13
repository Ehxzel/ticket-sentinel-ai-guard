
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { PlayCircle, PauseCircle, Settings } from 'lucide-react';
import { fraudDetectionService } from '@/services/fraudDetectionService';
import { useToast } from '@/hooks/use-toast';

const stations = [
  'Central Station',
  'North Station',
  'South Gate',
  'East Station',
  'West Terminal',
  'Airport Terminal',
];

const AutoLogger = ({ onTransactionAdded }: { onTransactionAdded?: () => void }) => {
  const [isActive, setIsActive] = useState(false);
  const [logsPerMinute, setLogsPerMinute] = useState(5);
  const [includeFraud, setIncludeFraud] = useState(true);
  const [lastLog, setLastLog] = useState<string | null>(null);
  const [nextLogIn, setNextLogIn] = useState<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const { toast } = useToast();

  // Calculate interval in milliseconds based on logs per minute
  const interval = Math.floor(60000 / logsPerMinute);

  const generateRandomTransaction = () => {
    // Generate random ticket ID
    const ticketId = `T-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Select random station
    const station = stations[Math.floor(Math.random() * stations.length)];
    
    // Generate random amount between $1 and $15
    const amount = parseFloat((Math.random() * 14 + 1).toFixed(2));
    
    // Calculate fraud likelihood
    let fraudChance = 0.05; // base 5% chance
    
    if (includeFraud) {
      // Increase fraud chance based on some conditions to simulate patterns
      if (amount > 10) fraudChance += 0.1;
      if (station === 'East Station' || station === 'Central Station') fraudChance += 0.15;
      if (ticketId.endsWith('7')) fraudChance += 0.3;
    }
    
    // Decide if this will be a fraudulent transaction
    const isFraud = Math.random() < fraudChance;
    
    // If it's fraud, make the amount more suspicious
    const finalAmount = isFraud ? amount * (Math.random() < 0.5 ? 0.5 : 2) : amount;
    
    return {
      ticketId,
      station,
      amount: parseFloat(finalAmount.toFixed(2)),
      isFraud
    };
  };

  const logRandomTransaction = async () => {
    try {
      const transaction = generateRandomTransaction();
      
      // Log to console for debugging
      console.log('Auto-logging transaction:', transaction);
      
      // Send to API
      const result = await fraudDetectionService.analyzeTransaction({
        ticketId: transaction.ticketId,
        station: transaction.station,
        amount: transaction.amount
      });
      
      // Update UI
      setLastLog(`${transaction.ticketId} (${transaction.amount.toFixed(2)})`);
      
      // Notify parent component
      if (onTransactionAdded) {
        onTransactionAdded();
      }
      
    } catch (error) {
      console.error('Error in auto-logging:', error);
      toast({
        title: 'Auto-logging Error',
        description: 'Failed to log automatic transaction',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (isActive) {
      // Log one immediately
      logRandomTransaction();
      
      // Set up interval
      const intervalId = window.setInterval(() => {
        logRandomTransaction();
      }, interval);
      
      timerRef.current = intervalId as unknown as number;
      
      // Countdown timer for next log
      let countdown = interval;
      const countdownId = window.setInterval(() => {
        countdown -= 1000;
        setNextLogIn(countdown / 1000);
        if (countdown <= 0) {
          countdown = interval;
        }
      }, 1000);
      
      // Cleanup function
      return () => {
        window.clearInterval(intervalId);
        window.clearInterval(countdownId);
        timerRef.current = null;
        setNextLogIn(null);
      };
    }
  }, [isActive, interval, onTransactionAdded]);

  const toggleActive = () => {
    setIsActive(!isActive);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center">
          <Settings className="h-5 w-5 mr-2" /> 
          Auto Transaction Logger
        </CardTitle>
        <CardDescription>
          Automatically generate and log ticket transactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-logger-switch">Auto Logger</Label>
              <p className="text-sm text-gray-500">
                {isActive ? 'Running' : 'Stopped'}
              </p>
            </div>
            <div className="flex items-center">
              <Button 
                variant={isActive ? "destructive" : "default"}
                size="sm" 
                onClick={toggleActive}
                className="mr-2"
              >
                {isActive ? (
                  <>
                    <PauseCircle className="h-4 w-4 mr-1" /> Stop
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-4 w-4 mr-1" /> Start
                  </>
                )}
              </Button>
              <Switch id="auto-logger-switch" checked={isActive} onCheckedChange={toggleActive} />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="logs-per-minute">
                Logs per Minute: {logsPerMinute}
              </Label>
              <span className="text-sm text-gray-500">
                {(60 / logsPerMinute).toFixed(1)}s interval
              </span>
            </div>
            <Slider 
              id="logs-per-minute"
              min={1} 
              max={30} 
              step={1} 
              value={[logsPerMinute]} 
              onValueChange={([value]) => setLogsPerMinute(value)}
              disabled={isActive}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="include-fraud" 
              checked={includeFraud} 
              onCheckedChange={setIncludeFraud}
              disabled={isActive}
            />
            <Label htmlFor="include-fraud">Include simulated fraud patterns</Label>
          </div>
          
          {isActive && (
            <div className="rounded-md bg-slate-50 p-3 text-sm">
              <div className="flex justify-between">
                <span>Last logged:</span>
                <span className="font-medium">{lastLog || 'None'}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span>Next log in:</span>
                <span className="font-medium">{nextLogIn !== null ? `${nextLogIn}s` : '...'}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="bg-slate-50 border-t">
        <p className="text-xs text-gray-500">
          Auto logger will generate realistic transaction data based on your settings.
          {includeFraud && " Fraud patterns are included in the generated data."}
        </p>
      </CardFooter>
    </Card>
  );
};

export default AutoLogger;
