import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Lock } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, loginWithGoogle, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter both email and password",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await login(email, password);
      toast({
        title: "Success",
        description: "You have successfully logged in.",
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Please check your credentials and try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsSubmitting(true);
      await loginWithGoogle();
      toast({
        title: "Success",
        description: "You have successfully logged in with Google.",
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Google login error:', error);
      toast({
        title: "Login Failed",
        description: "Failed to login with Google. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const loginAsAdmin = () => {
    setEmail('admin@example.com');
    setPassword('password');
  };

  const loginAsOperator = () => {
    setEmail('operator@example.com');
    setPassword('password');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-white p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-purple-500 rounded-full">
              <Lock className="h-6 w-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-purple-900">Ticket Sentinel</h1>
          <p className="text-gray-600 mt-2">AI-Powered Fraud Detection</p>
        </div>
        
        <Card className="border-purple-100 shadow-lg animate-fade-in">
          <CardHeader>
            <CardTitle className="text-center text-purple-800">Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-purple-200 focus:border-purple-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button type="button" className="text-sm text-purple-600 hover:text-purple-800">
                    Forgot password?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-purple-200 focus:border-purple-500"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting ? "Signing in..." : "Sign In"}
              </Button>
            </form>
            
            <div className="mt-4 relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>
            
            <Button
              type="button"
              variant="outline"
              className="w-full mt-4 border-gray-300 hover:bg-gray-50"
              onClick={handleGoogleLogin}
              disabled={isSubmitting || isLoading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 mr-2">
                <path fill="#EA4335" d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z"/>
                <path fill="#34A853" d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2936293 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z"/>
                <path fill="#4A90E2" d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5272727 23.1818182,9.81818182 L12,9.81818182 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801 Z"/>
                <path fill="#FBBC05" d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301709 1.23746264,17.3349879 L5.27698177,14.2678769 Z"/>
              </svg>
              Sign in with Google
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-xs text-center text-gray-500">
              <p>For demo purposes, you can use:</p>
              <div className="flex justify-center space-x-4 mt-2">
                <button 
                  type="button"
                  onClick={loginAsAdmin}
                  className="text-purple-600 hover:underline"
                >
                  Admin Login
                </button>
                <button 
                  type="button"
                  onClick={loginAsOperator}
                  className="text-purple-600 hover:underline"
                >
                  Operator Login
                </button>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
