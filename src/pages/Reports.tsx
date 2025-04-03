import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, DownloadIcon } from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import ChartComponent from "@/components/ChartComponent";
import ExpenseTable from "@/components/ExpenseTable";
import { Expense } from "@/types/expense";
import { getAllExpenses, filterExpenses, formatCurrency, generateExpenseSummary, exportAsCSV } from "@/utils/expenseUtils";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from "recharts";

const Reports = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [refreshData, setRefreshData] = useState(0);
  
  // Filter states
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [dateRange, setDateRange] = useState({
    from: subMonths(new Date(), 1),
    to: new Date(),
  });
  
  useEffect(() => {
    setExpenses(getAllExpenses());
  }, [refreshData]);
  
  useEffect(() => {
    // Filter expenses for the selected month or custom date range
    if (selectedMonth !== "custom") {
      const [year, month] = selectedMonth.split('-').map(Number);
      const firstDay = startOfMonth(new Date(year, month - 1));
      const lastDay = endOfMonth(new Date(year, month - 1));
      
      setFilteredExpenses(
        filterExpenses(
          {
            startDate: format(firstDay, 'yyyy-MM-dd'),
            endDate: format(lastDay, 'yyyy-MM-dd'),
          }
        )
      );
    } else if (dateRange.from && dateRange.to) {
      setFilteredExpenses(
        filterExpenses(
          {
            startDate: format(dateRange.from, 'yyyy-MM-dd'),
            endDate: format(dateRange.to, 'yyyy-MM-dd'),
          }
        )
      );
    }
  }, [selectedMonth, dateRange, expenses]);
  
  const summary = generateExpenseSummary(filteredExpenses);
  
  const handleDateRangeSelect = (range: { from?: Date; to?: Date }) => {
    setDateRange({
      from: range.from || dateRange.from,
      to: range.to || dateRange.to,
    });
    
    if (range.from && range.to) {
      setSelectedMonth("custom");
    }
  };
  
  const handleMonthSelect = (value: string) => {
    setSelectedMonth(value);
    
    // If not custom, reset the date range picker
    if (value !== "custom") {
      const [year, month] = value.split('-').map(Number);
      const firstDay = startOfMonth(new Date(year, month - 1));
      const lastDay = endOfMonth(new Date(year, month - 1));
      
      setDateRange({
        from: firstDay,
        to: lastDay,
      });
    }
  };
  
  const handleDataChange = () => {
    setRefreshData(prev => prev + 1);
  };
  
  // Generate last 6 months for the dropdown
  const generateLastSixMonths = () => {
    const months = [];
    const today = new Date();
    
    for (let i = 0; i < 6; i++) {
      const date = subMonths(today, i);
      months.push({
        value: format(date, 'yyyy-MM'),
        label: format(date, 'MMMM yyyy'),
      });
    }
    
    return months;
  };
  
  const months = generateLastSixMonths();
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container pt-20 pb-16">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Reports</h1>
            <p className="text-muted-foreground mt-1">Analyze your spending patterns</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button onClick={exportAsCSV} variant="outline">
              <DownloadIcon className="h-4 w-4 mr-2" /> Export Data
            </Button>
          </div>
        </div>
        
        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Filter Options</CardTitle>
              <CardDescription>Select time period to analyze</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Select value={selectedMonth} onValueChange={handleMonthSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a month" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month.value} value={month.value}>
                          {month.label}
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedMonth === "custom" && (
                  <div className="flex-1">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dateRange && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange?.from ? (
                            dateRange.to ? (
                              <>
                                {format(dateRange.from, "LLL dd, y")} -{" "}
                                {format(dateRange.to, "LLL dd, y")}
                              </>
                            ) : (
                              format(dateRange.from, "LLL dd, y")
                            )
                          ) : (
                            <span>Pick a date range</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="range"
                          selected={{
                            from: dateRange.from,
                            to: dateRange.to,
                          }}
                          onSelect={handleDateRangeSelect}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total for Period</CardDescription>
                    <CardTitle>{formatCurrency(summary.total)}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Number of Expenses</CardDescription>
                    <CardTitle>{filteredExpenses.length}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Average per Day</CardDescription>
                    <CardTitle>
                      {dateRange.from && dateRange.to
                        ? formatCurrency(
                            summary.total /
                              Math.max(
                                1,
                                Math.round(
                                  (dateRange.to.getTime() - dateRange.from.getTime()) /
                                    (1000 * 60 * 60 * 24)
                                )
                              )
                          )
                        : formatCurrency(0)}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <ChartComponent 
            expenses={filteredExpenses}
            title="Expense Distribution"
            description="Breakdown by category"
          />
          
          <Card>
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
              <CardDescription>Detailed spending by category</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.entries(summary.categoryTotals)
                .filter(([_, amount]) => amount > 0)
                .sort(([_, a], [__, b]) => b - a)
                .map(([category, amount]) => {
                  const percentage = (amount / summary.total) * 100;
                  return (
                    <div key={category} className="mb-4 last:mb-0">
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center">
                          <span className={`expense-category-badge category-${category.toLowerCase()}`}>
                            {category}
                          </span>
                        </div>
                        <span className="font-medium">{formatCurrency(amount)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full bg-expense-${category.toLowerCase()}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-right mt-1 text-muted-foreground">
                        {percentage.toFixed(1)}%
                      </div>
                    </div>
                  );
                })}
              
              {Object.values(summary.categoryTotals).every(amount => amount === 0) && (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No expense data for selected period</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-6">
          <Tabs defaultValue="table">
            <div className="mb-4">
              <TabsList>
                <TabsTrigger value="table">Expense List</TabsTrigger>
                <TabsTrigger value="chart">Monthly Trend</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="table">
              <ExpenseTable expenses={filteredExpenses} onDataChange={handleDataChange} />
            </TabsContent>
            
            <TabsContent value="chart">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Expense Trend</CardTitle>
                  <CardDescription>
                    Spending over the selected period
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    {filteredExpenses.length === 0 ? (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-muted-foreground">No data available for selected period</p>
                      </div>
                    ) : (
                      <ResponsiveBarChart expenses={filteredExpenses} />
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

// Helper component to create a responsive monthly trend chart
const ResponsiveBarChart = ({ expenses }: { expenses: Expense[] }) => {
  // Group expenses by date to show daily trend
  const expensesByDate = expenses.reduce<Record<string, number>>((acc, expense) => {
    const date = expense.date;
    acc[date] = (acc[date] || 0) + expense.amount;
    return acc;
  }, {});
  
  // Create sorted chart data
  const chartData = Object.entries(expensesByDate)
    .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
    .map(([date, total]) => ({
      date: format(new Date(date), 'MMM dd'),
      total,
    }));
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{
          top: 10,
          right: 30,
          left: 20,
          bottom: 40,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          angle={-45} 
          textAnchor="end" 
          tick={{ fontSize: 12 }}
          height={70}
        />
        <YAxis />
        <RechartsTooltip 
          formatter={(value) => formatCurrency(Number(value))}
          labelFormatter={(label) => `Date: ${label}`}
        />
        <Legend />
        <Bar dataKey="total" name="Amount" fill="#0ea5e9" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default Reports;
