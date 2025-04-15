
import React, { createContext, useContext, useState, useEffect } from 'react';

// Types for our user and auth context
export type User = {
  id: string;
  email: string;
  role: 'admin' | 'operator';
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: () => boolean;
};

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data for demonstration (will be replaced with Supabase)
const mockUsers = [
  { id: '1', email: 'admin@example.com', password: 'password', role: 'admin' as const },
  { id: '2', email: 'operator@example.com', password: 'password', role: 'operator' as const },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check for existing session on mount
  useEffect(() => {
    // Simulate checking for an existing session
    const checkSession = () => {
      setIsLoading(true);
      
      // Check if user is in localStorage (simulating session persistence)
      const storedUser = localStorage.getItem('ticketSentinelUser');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Failed to parse stored user:', error);
          localStorage.removeItem('ticketSentinelUser');
        }
      }
      
      setIsLoading(false);
    };

    checkSession();
  }, []);

  // Mock login function (will be replaced with Supabase)
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = mockUsers.find(u => u.email === email && u.password === password);
    
    if (!foundUser) {
      setIsLoading(false);
      throw new Error('Invalid email or password');
    }
    
    // Omit password from user object
    const { password: _, ...userWithoutPassword } = foundUser;
    setUser(userWithoutPassword);
    localStorage.setItem('ticketSentinelUser', JSON.stringify(userWithoutPassword));
    
    setIsLoading(false);
  };

  // Mock Google login (will be replaced with Supabase)
  const loginWithGoogle = async () => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // For demo, let's just log in as admin
    const adminUser = { id: '1', email: 'admin@example.com', role: 'admin' as const };
    setUser(adminUser);
    localStorage.setItem('ticketSentinelUser', JSON.stringify(adminUser));
    
    setIsLoading(false);
  };

  // Mock logout function (will be replaced with Supabase)
  const logout = async () => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setUser(null);
    localStorage.removeItem('ticketSentinelUser');
    
    setIsLoading(false);
  };

  // Helper function to check if user is admin
  const isAdmin = () => {
    return user?.role === 'admin';
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, loginWithGoogle, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
