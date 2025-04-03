
import { Expense, ExpenseCategory, ExpenseSummary, DateRange } from '../types/expense';
import { toast } from 'sonner';

// Mock data for initial development
const mockExpenses: Expense[] = [
  {
    id: '1',
    date: '2025-03-28',
    category: 'Food',
    amount: 25.50,
    description: 'Lunch at Italian restaurant'
  },
  {
    id: '2',
    date: '2025-03-27',
    category: 'Transport',
    amount: 35.00,
    description: 'Uber ride to airport'
  },
  {
    id: '3',
    date: '2025-03-25',
    category: 'Bills',
    amount: 120.75,
    description: 'Electricity bill'
  },
  {
    id: '4',
    date: '2025-03-22',
    category: 'Shopping',
    amount: 89.99,
    description: 'New shoes'
  },
  {
    id: '5',
    date: '2025-03-20',
    category: 'Entertainment',
    amount: 15.00,
    description: 'Movie tickets'
  },
  {
    id: '6',
    date: '2025-03-18',
    category: 'Food',
    amount: 12.30,
    description: 'Coffee and pastries'
  },
  {
    id: '7',
    date: '2025-03-15',
    category: 'Bills',
    amount: 45.00,
    description: 'Internet subscription'
  },
  {
    id: '8',
    date: '2025-03-10',
    category: 'Shopping',
    amount: 65.25,
    description: 'Books from Amazon'
  },
  {
    id: '9',
    date: '2025-03-05',
    category: 'Other',
    amount: 30.00,
    description: 'Charity donation'
  },
  {
    id: '10',
    date: '2025-03-01',
    category: 'Entertainment',
    amount: 50.00,
    description: 'Concert tickets'
  }
];

// In a real app, we would use local storage or an API
let expenses: Expense[] = [...mockExpenses];

// Load expenses from local storage if available
const loadExpenses = (): Expense[] => {
  const storedExpenses = localStorage.getItem('expenses');
  if (storedExpenses) {
    try {
      return JSON.parse(storedExpenses);
    } catch (error) {
      console.error('Failed to parse expenses from local storage:', error);
      return [...mockExpenses];
    }
  }
  return [...mockExpenses];
};

// Save expenses to local storage
const saveExpenses = (expensesToSave: Expense[]): void => {
  try {
    localStorage.setItem('expenses', JSON.stringify(expensesToSave));
  } catch (error) {
    console.error('Failed to save expenses to local storage:', error);
    toast.error('Failed to save expenses');
  }
};

// Initialize expenses from local storage
expenses = loadExpenses();

// Get all expenses
export const getAllExpenses = (): Expense[] => {
  return [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Add a new expense
export const addExpense = (expense: Omit<Expense, 'id'>): Expense => {
  const newExpense = {
    ...expense,
    id: Date.now().toString(),
  };
  
  expenses = [newExpense, ...expenses];
  saveExpenses(expenses);
  toast.success('Expense added successfully');
  return newExpense;
};

// Update an existing expense
export const updateExpense = (expense: Expense): Expense | null => {
  const index = expenses.findIndex(e => e.id === expense.id);
  if (index === -1) {
    toast.error('Expense not found');
    return null;
  }
  
  expenses[index] = expense;
  saveExpenses(expenses);
  toast.success('Expense updated successfully');
  return expense;
};

// Delete an expense
export const deleteExpense = (id: string): boolean => {
  const initialLength = expenses.length;
  expenses = expenses.filter(e => e.id !== id);
  
  if (expenses.length === initialLength) {
    toast.error('Expense not found');
    return false;
  }
  
  saveExpenses(expenses);
  toast.success('Expense deleted successfully');
  return true;
};

// Filter expenses by date range and/or category
export const filterExpenses = (
  dateRange?: DateRange,
  category?: ExpenseCategory
): Expense[] => {
  return getAllExpenses().filter(expense => {
    let includeExpense = true;
    
    if (dateRange) {
      const expenseDate = new Date(expense.date);
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      
      includeExpense = expenseDate >= startDate && expenseDate <= endDate;
    }
    
    if (includeExpense && category && expense.category !== category) {
      includeExpense = false;
    }
    
    return includeExpense;
  });
};

// Generate expense summary
export const generateExpenseSummary = (expenses: Expense[]): ExpenseSummary => {
  const categoryTotals = {
    Food: 0,
    Transport: 0,
    Bills: 0,
    Shopping: 0,
    Entertainment: 0,
    Other: 0
  };
  
  let total = 0;
  
  expenses.forEach(expense => {
    categoryTotals[expense.category] += expense.amount;
    total += expense.amount;
  });
  
  return {
    total,
    categoryTotals
  };
};

// Get expenses for a specific month
export const getExpensesByMonth = (month: number, year: number): Expense[] => {
  return getAllExpenses().filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === month && expenseDate.getFullYear() === year;
  });
};

// Get last 30 days expenses
export const getLastThirtyDaysExpenses = (): Expense[] => {
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);
  
  return getAllExpenses().filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= thirtyDaysAgo && expenseDate <= today;
  });
};

// Format amount as currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Export expenses as CSV
export const exportAsCSV = (): void => {
  const headers = ['Date', 'Category', 'Amount', 'Description'];
  const csvRows = [headers.join(',')];
  
  expenses.forEach(expense => {
    const values = [
      expense.date,
      expense.category,
      expense.amount,
      `"${expense.description.replace(/"/g, '""')}"`
    ];
    csvRows.push(values.join(','));
  });
  
  const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
  const encodedUri = encodeURI(csvContent);
  
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `expenses_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  toast.success('Expenses exported successfully');
};
