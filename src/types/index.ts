// Base interface for all financial items
export interface BaseFinancialItem {
  id: string;
  title: string;
  currency: string;
  planned: number;
  actual: number;
  createdAt: Date;
  updatedAt: Date;
}

// Fixed Expenses
export interface FixedExpense extends BaseFinancialItem {
  date: string; // Expense date
}

// Daily Expenses
export interface DailyExpense extends BaseFinancialItem {
  remaining: number; // calculated as planned - actual
}

// Debts
export interface Debt extends BaseFinancialItem {
  date: string; // Due date
}

// Income
export interface Income extends BaseFinancialItem {
  // No additional fields needed
}

// Investments
export interface Investment extends BaseFinancialItem {
  date: string; // Investment date
}

// Overview item (aggregated from all categories)
export interface OverviewItem {
  id: string;
  category: 'Fixed' | 'Daily' | 'Debt' | 'Income' | 'Investment';
  title: string;
  planned: number;
  actual: number;
  currency: string;
  date?: string; // Optional date field
  remaining?: number; // For daily expenses
}

// Currency types
export type Currency = 'USD' | 'JOD' | 'EUR' | 'GBP' | 'SAR' | 'AED';

// View types for each screen
export type ViewType = 'table' | 'chart';

// Language types
export type Language = 'en' | 'ar';

// Navigation types
export type RootStackParamList = {
  Main: undefined;
  FixedExpenses: undefined;
  DailyExpenses: undefined;
  Debts: undefined;
  Income: undefined;
  Investments: undefined;
  Overview: undefined;
};

export type TabParamList = {
  FixedExpenses: undefined;
  DailyExpenses: undefined;
  Debts: undefined;
  Income: undefined;
  Investments: undefined;
  Overview: undefined;
};

// Chart data types
export interface ChartDataPoint {
  x: string | number;
  y: number;
  label?: string;
}

export interface ChartData {
  data: ChartDataPoint[];
  color?: string;
  key?: string;
}
