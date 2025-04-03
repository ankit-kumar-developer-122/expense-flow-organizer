
export type ExpenseCategory = 
  | 'Food'
  | 'Transport' 
  | 'Bills' 
  | 'Shopping' 
  | 'Entertainment' 
  | 'Other';

export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD format
  category: ExpenseCategory;
  amount: number;
  description: string;
}

export interface ExpenseSummary {
  total: number;
  categoryTotals: Record<ExpenseCategory, number>;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}
