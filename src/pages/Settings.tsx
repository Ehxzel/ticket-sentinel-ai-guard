
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AlertCircle, Check, Key, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const SettingsPage = () => {
  const { user, isLoading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Mock state for settings
  const [apiKey, setApiKey] = useState('sk_test_****************************************');
  const [apiEndpoint, setApiEndpoint] = useState('https://ai-fraud-model.example.com/predict');
  const [fraudThreshold, setFraudThreshold] = useState('0.7');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    } else if (!isLoading && user && !isAdmin()) {
      // Redirect operators to dashboard (they shouldn't access settings)
      navigate('/dashboard');
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the settings page.",
        variant: "destructive"
      });
    }
  }, [user, isLoading, navigate, isAdmin, toast]);

  const handleSaveApiSettings = () => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Settings Updated",
        description: "Your API settings have been saved successfully.",
      });
    }, 1500);
  };

  const handleToggleApiKeyVisibility = () => {
    setIsApiKeyVisible(!isApiKeyVisible);
  };

  const handleRefreshApiKey = () => {
    // Simulate API key regeneration
    setApiKey('sk_test_' + Math.random().toString(36).substr(2, 32));
    toast({
      title: "API Key Refreshed",
      description: "Your API key has been regenerated. Make sure to update any services using the old key.",
      variant: "default",
    });
  };

  const handleTestConnection = () => {
    setIsTesting(true);
    setTestResult(null);
    
    // Simulate API test
    setTimeout(() => {
      setIsTesting(false);
      
      // Randomly succeed or fail for demonstration
      const success = Math.random() > 0.3;
      setTestResult(success ? 'success' : 'error');
      
      toast({
        title: success ? "Connection Successful" : "Connection Failed",
        description: success 
          ? "Successfully connected to the AI fraud detection API." 
          : "Could not connect to the API. Please check your settings.",
        variant: success ? "default" : "destructive",
      });
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user || !isAdmin()) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 container py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-gray-500">
            Configure your AI fraud detection system
          </p>
        </div>

        <Tabs defaultValue="api" className="space-y-4">
          <TabsList>
            <TabsTrigger value="api">API Configuration</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="system">System Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="api" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="h-5 w-5 mr-2 text-purple-600" />
                  AI Model API Configuration
                </CardTitle>
                <CardDescription>
                  Configure the connection to your fraud detection AI model
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="api-key">API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      id="api-key"
                      type={isApiKeyVisible ? "text" : "password"}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="font-mono"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleToggleApiKeyVisibility}
                    >
                      {isApiKeyVisible ? "Hide" : "Show"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleRefreshApiKey}
                      className="gap-1"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Refresh
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">
                    This key will be stored securely and used to authenticate with the AI model API.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="api-endpoint">API Endpoint</Label>
                  <Input
                    id="api-endpoint"
                    type="text"
                    value={apiEndpoint}
                    onChange={(e) => setApiEndpoint(e.target.value)}
                  />
                  <p className="text-sm text-gray-500">
                    The URL endpoint for the AI fraud detection model.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fraud-threshold">Fraud Score Threshold</Label>
                  <Input
                    id="fraud-threshold"
                    type="text"
                    value={fraudThreshold}
                    onChange={(e) => setFraudThreshold(e.target.value)}
                  />
                  <p className="text-sm text-gray-500">
                    Transactions with a score above this threshold (0.0-1.0) will be flagged as fraudulent.
                  </p>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={handleTestConnection}
                    variant="outline"
                    disabled={isTesting}
                  >
                    {isTesting ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Testing Connection...
                      </>
                    ) : (
                      "Test Connection"
                    )}
                  </Button>
                  
                  {testResult === 'success' && (
                    <Alert variant="default" className="mt-4 bg-green-50 border-green-200 text-green-800">
                      <Check className="h-4 w-4" />
                      <AlertTitle>Connection Successful</AlertTitle>
                      <AlertDescription>
                        Successfully connected to the AI fraud detection API.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {testResult === 'error' && (
                    <Alert variant="destructive" className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Connection Failed</AlertTitle>
                      <AlertDescription>
                        Could not connect to the API. Please check your endpoint and API key.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleSaveApiSettings}
                  disabled={isSaving}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isSaving ? "Saving..." : "Save API Settings"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure how and when you receive fraud alert notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-gray-500">
                      Receive email alerts for high-priority fraud incidents
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="browser-notifications">Browser Notifications</Label>
                    <p className="text-sm text-gray-500">
                      Receive browser push notifications when you're logged in
                    </p>
                  </div>
                  <Switch
                    id="browser-notifications"
                    defaultChecked
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="daily-digest">Daily Digest</Label>
                    <p className="text-sm text-gray-500">
                      Receive a daily summary of all fraud incidents
                    </p>
                  </div>
                  <Switch
                    id="daily-digest"
                    defaultChecked
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Save Notification Settings
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="system" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>
                  Configure system-wide settings for the fraud detection platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-clear">Auto-Clear Low Risk</Label>
                    <p className="text-sm text-gray-500">
                      Automatically clear low-risk transactions after 24 hours
                    </p>
                  </div>
                  <Switch
                    id="auto-clear"
                    defaultChecked
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="data-retention">Extended Data Retention</Label>
                    <p className="text-sm text-gray-500">
                      Keep transaction data for 90 days instead of the default 30 days
                    </p>
                  </div>
                  <Switch
                    id="data-retention"
                    defaultChecked={false}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="anonymize-data">Anonymize Personal Data</Label>
                    <p className="text-sm text-gray-500">
                      Remove personally identifiable information from logs and reports
                    </p>
                  </div>
                  <Switch
                    id="anonymize-data"
                    defaultChecked
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Save System Settings
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default SettingsPage;
