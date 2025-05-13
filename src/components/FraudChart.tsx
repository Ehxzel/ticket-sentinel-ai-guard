
import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useState } from 'react';

// Mock data for the chart
const generateDailyData = () => {
  const data = [];
  const today = new Date();
  
  for (let i = 13; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    // Generate random numbers for various metrics
    const flaggedTransactions = Math.floor(Math.random() * 12) + 1;
    const totalTransactions = flaggedTransactions + Math.floor(Math.random() * 300) + 100;
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      totalTransactions,
      flaggedTransactions,
      fraudRate: (flaggedTransactions / totalTransactions) * 100
    });
  }
  
  return data;
};

const generateWeeklyData = () => {
  const data = [];
  const weeks = ['Apr 1-7', 'Apr 8-14', 'Apr 15-21', 'Apr 22-28', 'Apr 29-May 5', 'May 6-12', 'May 13-19'];
  
  weeks.forEach(week => {
    const flaggedTransactions = Math.floor(Math.random() * 60) + 20;
    const totalTransactions = flaggedTransactions + Math.floor(Math.random() * 1200) + 800;
    
    data.push({
      date: week,
      totalTransactions,
      flaggedTransactions,
      fraudRate: (flaggedTransactions / totalTransactions) * 100
    });
  });
  
  return data;
};

const generateMonthlyData = () => {
  const data = [];
  const months = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];
  
  months.forEach(month => {
    const flaggedTransactions = Math.floor(Math.random() * 200) + 50;
    const totalTransactions = flaggedTransactions + Math.floor(Math.random() * 5000) + 3000;
    
    data.push({
      date: month,
      totalTransactions,
      flaggedTransactions,
      fraudRate: (flaggedTransactions / totalTransactions) * 100
    });
  });
  
  return data;
};

type ChartType = 'bar' | 'line';
type TimeRange = 'daily' | 'weekly' | 'monthly';

const FraudChart = () => {
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [timeRange, setTimeRange] = useState<TimeRange>('daily');
  
  // Choose correct data based on time range
  const data = useMemo(() => {
    switch (timeRange) {
      case 'daily':
        return generateDailyData();
      case 'weekly':
        return generateWeeklyData();
      case 'monthly':
        return generateMonthlyData();
      default:
        return generateDailyData();
    }
  }, [timeRange]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg font-medium">Fraud Incidents</CardTitle>
          <CardDescription>
            Overview of fraudulent transactions over time
          </CardDescription>
        </div>
        <div className="flex space-x-2">
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
          <Select value={chartType} onValueChange={(value) => setChartType(value as ChartType)}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Chart Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bar">Bar</SelectItem>
              <SelectItem value="line">Line</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart
                data={data}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 60,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  angle={-45} 
                  textAnchor="end" 
                  tickMargin={15}
                />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'fraudRate') {
                      return [typeof value === 'number' ? `${value.toFixed(2)}%` : `${value}%`, 'Fraud Rate'];
                    }
                    return [value, name === 'flaggedTransactions' ? 'Flagged Tickets' : 'Total Tickets'];
                  }}
                />
                <Legend />
                <Bar 
                  yAxisId="left"
                  dataKey="flaggedTransactions" 
                  name="Flagged Tickets" 
                  fill="#ef4444" 
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  yAxisId="left"
                  dataKey="totalTransactions" 
                  name="Total Tickets" 
                  fill="#8b60ff" 
                  radius={[4, 4, 0, 0]}
                  stackId="a"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="fraudRate" 
                  name="Fraud Rate (%)" 
                  stroke="#f97316" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </BarChart>
            ) : (
              <LineChart
                data={data}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 60,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  angle={-45} 
                  textAnchor="end" 
                  tickMargin={15}
                />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'fraudRate') {
                      return [typeof value === 'number' ? `${value.toFixed(2)}%` : `${value}%`, 'Fraud Rate'];
                    }
                    return [value, name === 'flaggedTransactions' ? 'Flagged Tickets' : 'Total Tickets'];
                  }}
                />
                <Legend />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="flaggedTransactions" 
                  name="Flagged Tickets" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 8 }}
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="totalTransactions" 
                  name="Total Tickets"
                  stroke="#8b60ff" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="fraudRate" 
                  name="Fraud Rate (%)" 
                  stroke="#f97316" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default FraudChart;
