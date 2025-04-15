
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { Bell, Settings, LogOut, Menu, Activity, Home } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [alertCount, setAlertCount] = useState(3); // Mock alert count

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  // Show active state for current route
  const isActive = (path: string) => location.pathname === path;

  const NavItem = ({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) => (
    <Link
      to={href}
      className={`flex items-center px-4 py-2 rounded-md transition-colors ${
        isActive(href)
          ? 'bg-purple-100 text-purple-800 font-medium'
          : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'
      }`}
    >
      <Icon className="mr-2 h-5 w-5" />
      <span>{label}</span>
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        {/* Mobile menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <nav className="flex flex-col gap-4 mt-8">
              <NavItem href="/dashboard" icon={Home} label="Dashboard" />
              <NavItem href="/transactions" icon={Activity} label="Transactions" />
              {isAdmin() && (
                <NavItem href="/settings" icon={Settings} label="Settings" />
              )}
              <div className="pt-4 border-t border-gray-200">
                <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
                  <LogOut className="mr-2 h-5 w-5" />
                  <span>Log out</span>
                </Button>
              </div>
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <div className="flex items-center">
          <Link to="/dashboard" className="flex items-center">
            <div className="bg-purple-500 text-white p-1.5 rounded-md mr-2">
              <Activity className="h-5 w-5" />
            </div>
            <span className="font-bold text-xl text-purple-900">TicketSentinel</span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-4">
          <NavItem href="/dashboard" icon={Home} label="Dashboard" />
          <NavItem href="/transactions" icon={Activity} label="Transactions" />
          {isAdmin() && (
            <NavItem href="/settings" icon={Settings} label="Settings" />
          )}
        </nav>

        {/* Right side: alerts & profile */}
        <div className="flex items-center space-x-4">
          {/* Alerts */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {alertCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-red-500 text-white text-xs">
                    {alertCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Fraud Alerts</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-64 overflow-auto">
                <DropdownMenuItem className="cursor-pointer">
                  <div className="flex flex-col gap-1">
                    <div className="font-medium">Ticket #4587 Flagged</div>
                    <div className="text-sm text-gray-500">High probability (0.92) of fraud detected</div>
                    <div className="text-xs text-gray-400">5 mins ago</div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <div className="flex flex-col gap-1">
                    <div className="font-medium">Unusual Activity at Central Station</div>
                    <div className="text-sm text-gray-500">Multiple tickets with similar patterns</div>
                    <div className="text-xs text-gray-400">25 mins ago</div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <div className="flex flex-col gap-1">
                    <div className="font-medium">Ticket #4490 Flagged</div>
                    <div className="text-sm text-gray-500">Medium probability (0.76) of fraud detected</div>
                    <div className="text-xs text-gray-400">1 hour ago</div>
                  </div>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/alerts" className="w-full text-center text-purple-600 hover:text-purple-700 cursor-pointer">
                  View all alerts
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative rounded-full h-8 w-8 border border-gray-200">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-purple-100 text-purple-800">
                    {user && getInitials(user.email)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.email}</p>
                  <p className="text-xs leading-none text-gray-500">
                    {user?.role.charAt(0).toUpperCase() + user?.role.slice(1)}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="cursor-pointer">
                  Profile
                </Link>
              </DropdownMenuItem>
              {isAdmin() && (
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer">
                    Settings
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <button onClick={handleLogout} className="w-full text-left cursor-pointer text-red-600 hover:text-red-700">
                  Log out
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
