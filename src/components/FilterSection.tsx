
import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar as CalendarIcon, Filter, Search, X } from 'lucide-react';
import { format } from 'date-fns';

// Get unique stations from transactions
const stations = [
  'All Stations',
  'Central Station',
  'North Station',
  'South Gate',
  'East Station',
  'West Terminal',
  'Airport Terminal',
];

interface FilterSectionProps {
  onFilterChange: (filters: {
    station?: string;
    status?: string;
    dateRange?: { from: Date; to: Date };
    query?: string;
  }) => void;
}

const FilterSection = ({ onFilterChange }: FilterSectionProps) => {
  const [selectedStation, setSelectedStation] = useState<string>('All Stations');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setHours(0, 0, 0, 0) - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    to: new Date()
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Apply filters when they change
  useEffect(() => {
    onFilterChange({
      station: selectedStation === 'All Stations' ? undefined : selectedStation,
      status: selectedStatus === 'all' ? undefined : selectedStatus,
      dateRange,
      query: searchQuery || undefined
    });
  }, [selectedStation, selectedStatus, dateRange, searchQuery, onFilterChange]);

  // Format date for display
  const formatDateRange = () => {
    if (!dateRange.from && !dateRange.to) return 'Select dates';
    
    if (dateRange.from && dateRange.to) {
      if (format(dateRange.from, 'PP') === format(dateRange.to, 'PP')) {
        return format(dateRange.from, 'PPP');
      }
      return `${format(dateRange.from, 'PP')} - ${format(dateRange.to, 'PP')}`;
    }
    
    if (dateRange.from) return `From ${format(dateRange.from, 'PP')}`;
    if (dateRange.to) return `Until ${format(dateRange.to, 'PP')}`;
    
    return 'Select dates';
  };

  const resetFilters = () => {
    setSelectedStation('All Stations');
    setSelectedStatus('all');
    setDateRange({
      from: new Date(new Date().setHours(0, 0, 0, 0) - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      to: new Date()
    });
    setSearchQuery('');
  };

  return (
    <Card className="bg-white shadow-sm border-gray-200">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 items-end">
          {/* Search */}
          <div className="w-full md:w-1/3">
            <Label htmlFor="search" className="text-sm font-medium">
              Search Tickets
            </Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                id="search"
                placeholder="Ticket ID or station..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Station Filter */}
          <div className="w-full md:w-1/5">
            <Label htmlFor="station" className="text-sm font-medium">
              Station
            </Label>
            <Select value={selectedStation} onValueChange={setSelectedStation}>
              <SelectTrigger id="station">
                <SelectValue placeholder="All Stations" />
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

          {/* Status Filter */}
          <div className="w-full md:w-1/5">
            <Label htmlFor="status" className="text-sm font-medium">
              Status
            </Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger id="status">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
                <SelectItem value="cleared">Cleared</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Picker */}
          <div className="w-full md:w-1/4">
            <Label htmlFor="date-range" className="text-sm font-medium">
              Date Range
            </Label>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  id="date-range"
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formatDateRange()}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={{
                    from: dateRange.from,
                    to: dateRange.to
                  }}
                  onSelect={(range) => {
                    if (range?.from && range?.to) {
                      setDateRange({ from: range.from, to: range.to });
                      setIsCalendarOpen(false);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Reset Button */}
          <Button 
            onClick={resetFilters} 
            variant="outline" 
            size="sm" 
            className="md:self-end h-10"
          >
            <Filter className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FilterSection;
