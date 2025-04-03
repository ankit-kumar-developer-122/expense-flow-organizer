
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Expense, ExpenseCategory, ExpenseSummary } from "@/types/expense";
import { generateExpenseSummary, formatCurrency } from "@/utils/expenseUtils";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartComponentProps {
  expenses: Expense[];
  title?: string;
  description?: string;
}

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Food: '#FF6B6B',
  Transport: '#4ECDC4',
  Bills: '#45B7D1',
  Shopping: '#F9CB40',
  Entertainment: '#9D65C9',
  Other: '#5D5C61'
};

const ChartComponent = ({ expenses, title = "Expense Analysis", description = "Breakdown of your expenses" }: ChartComponentProps) => {
  const [chartType, setChartType] = useState<"pie" | "bar">("pie");
  
  const summary = generateExpenseSummary(expenses);
  
  const pieData = Object.entries(summary.categoryTotals).map(([category, amount]) => ({
    name: category,
    value: amount
  })).filter(item => item.value > 0);
  
  const barData = Object.entries(summary.categoryTotals).map(([category, amount]) => ({
    name: category,
    amount: amount
  })).filter(item => item.amount > 0);
  
  // Format for the tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border shadow-sm rounded-md">
          <p className="font-medium">{payload[0].name}</p>
          <p>{formatCurrency(payload[0].value || payload[0].payload.amount)}</p>
        </div>
      );
    }
    return null;
  };
  
  // Format for the pie chart percentage
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return percent > 0.05 ? (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <Tabs defaultValue="pie" className="w-full" onValueChange={(value) => setChartType(value as "pie" | "bar")}>
          <TabsList className="grid w-full max-w-[200px] grid-cols-2">
            <TabsTrigger value="pie">Pie Chart</TabsTrigger>
            <TabsTrigger value="bar">Bar Chart</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">No expense data available</p>
          </div>
        ) : (
          <>
            {chartType === "pie" ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name as ExpenseCategory]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={barData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="amount" name="Amount">
                      {barData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name as ExpenseCategory]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ChartComponent;
