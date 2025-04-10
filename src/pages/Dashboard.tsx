
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { PlusIcon, ChartBarIcon, ArrowUpIcon, ArrowDownIcon, WalletIcon } from "lucide-react";
import Navbar from "@/components/Navbar";
import ExpenseTable from "@/components/ExpenseTable";
import ChartComponent from "@/components/ChartComponent";
import { Expense, ExpenseCategory } from "@/types/expense";
import { 
  getAllExpenses, 
  getLastThirtyDaysExpenses, 
  formatCurrency, 
  generateExpenseSummary, 
  getSalary, 
  updateSalary, 
  getRemainingAmount 
} from "@/utils/expenseUtils";

const Dashboard = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [lastThirtyDaysExpenses, setLastThirtyDaysExpenses] = useState<Expense[]>([]);
  const [salary, setSalary] = useState<number>(0);
  const [remainingAmount, setRemainingAmount] = useState<number>(0);
  const [refreshData, setRefreshData] = useState(0);
  
  useEffect(() => {
    setExpenses(getAllExpenses());
    setLastThirtyDaysExpenses(getLastThirtyDaysExpenses());
    setSalary(getSalary());
    setRemainingAmount(getRemainingAmount());
  }, [refreshData]);
  
  const summary = generateExpenseSummary(expenses);
  const recentSummary = generateExpenseSummary(lastThirtyDaysExpenses);
  
  const getTopExpenseCategory = (): { category: ExpenseCategory; amount: number } => {
    let topCategory: ExpenseCategory = 'Other';
    let topAmount = 0;
    
    Object.entries(summary.categoryTotals).forEach(([category, amount]) => {
      if (amount > topAmount) {
        topAmount = amount;
        topCategory = category as ExpenseCategory;
      }
    });
    
    return { category: topCategory, amount: topAmount };
  };
  
  // Find the most recent 5 expenses
  const recentExpenses = [...expenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  ).slice(0, 5);
  
  const handleDataChange = () => {
    setRefreshData(prev => prev + 1);
  };
  
  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSalary = Number(e.target.value);
    if (!isNaN(newSalary) && newSalary >= 0) {
      updateSalary(newSalary);
      setSalary(newSalary);
      setRemainingAmount(getRemainingAmount());
    }
  };
  
  const topCategory = getTopExpenseCategory();
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="container pt-20 pb-16 flex-grow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Track and manage your expenses</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link to="/expense/new">
              <Button>
                <PlusIcon className="h-4 w-4 mr-2" /> Add New Expense
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Salary Input Card */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Monthly Salary</CardTitle>
            <CardDescription>Enter your total monthly income</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <WalletIcon className="h-5 w-5 text-muted-foreground" />
            <Input
              type="number"
              value={salary}
              onChange={handleSalaryChange}
              min="0"
              step="1000"
              className="max-w-xs"
              placeholder="Enter your salary"
            />
          </CardContent>
        </Card>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Expenses</CardDescription>
              <CardTitle className="text-2xl">{formatCurrency(summary.total)}</CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="text-xs text-muted-foreground">
                All time
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Recent (30 Days)</CardDescription>
              <CardTitle className="text-2xl">{formatCurrency(recentSummary.total)}</CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="text-xs text-muted-foreground flex items-center">
                <ArrowUpIcon className="h-3 w-3 mr-1 text-destructive" />
                <span>Last 30 days</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Top Category</CardDescription>
              <CardTitle className="text-2xl">{topCategory.category}</CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="text-xs text-muted-foreground">
                {formatCurrency(topCategory.amount)}
              </div>
            </CardContent>
          </Card>
          
          {/* Remaining Amount Card */}
          <Card className={remainingAmount < 0 ? "border-destructive" : "border-green-500"}>
            <CardHeader className="pb-2">
              <CardDescription>Remaining Balance</CardDescription>
              <CardTitle className={`text-2xl ${remainingAmount < 0 ? "text-destructive" : "text-green-500"}`}>
                {formatCurrency(remainingAmount)}
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="text-xs text-muted-foreground">
                Salary - Total Expenses
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
          <div className="col-span-2">
            <ChartComponent 
              expenses={lastThirtyDaysExpenses} 
              title="Last 30 Days Expenses" 
              description="Breakdown by category" 
            />
          </div>
          <div>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Recent Expenses</CardTitle>
                <CardDescription>Your latest transactions</CardDescription>
              </CardHeader>
              <CardContent>
                {recentExpenses.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No recent expenses</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentExpenses.map((expense) => (
                      <div key={expense.id} className="flex justify-between items-start">
                        <div>
                          <p className="font-medium truncate max-w-[180px]">
                            {expense.description}
                          </p>
                          <div className="flex items-center mt-1">
                            <span className={`expense-category-badge`}>
                              {expense.category}
                            </span>
                            <span className="text-xs text-muted-foreground ml-2">
                              {new Date(expense.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <p className="font-medium">{formatCurrency(expense.amount)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/reports">
                    <ChartBarIcon className="h-4 w-4 mr-2" /> View Full Report
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
        
        <div className="mt-6">
          <Tabs defaultValue="all">
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="all">All Expenses</TabsTrigger>
                <TabsTrigger value="recent">Recent (30 days)</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="all">
              <ExpenseTable expenses={expenses} onDataChange={handleDataChange} />
            </TabsContent>
            <TabsContent value="recent">
              <ExpenseTable expenses={lastThirtyDaysExpenses} onDataChange={handleDataChange} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Footer Card */}
      <div className="mt-auto w-full py-4 bg-background">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <p className="text-center text-muted-foreground text-sm">
              Year-2025 College Name- Rungta College Of Engineering and Technology, all rights reserved
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
