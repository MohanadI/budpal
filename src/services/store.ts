import { create } from 'zustand';
import { 
  FixedExpense, 
  DailyExpense, 
  Debt, 
  Income, 
  Investment, 
  OverviewItem,
  ViewType,
  Language 
} from '../types';
import { firebaseService } from './firebase';

interface AppState {
  // Data
  fixedExpenses: FixedExpense[];
  dailyExpenses: DailyExpense[];
  debts: Debt[];
  income: Income[];
  investments: Investment[];
  overviewItems: OverviewItem[];
  
  // UI State
  currentView: ViewType;
  language: Language;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setCurrentView: (view: ViewType) => void;
  setLanguage: (lang: Language) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Data Actions
  loadFixedExpenses: () => Promise<void>;
  loadDailyExpenses: () => Promise<void>;
  loadDebts: () => Promise<void>;
  loadIncome: () => Promise<void>;
  loadInvestments: () => Promise<void>;
  loadOverviewData: () => Promise<void>;
  loadAllData: () => Promise<void>;
  
  // CRUD Actions
  addFixedExpense: (expense: Omit<FixedExpense, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateFixedExpense: (id: string, expense: Partial<FixedExpense>) => Promise<void>;
  deleteFixedExpense: (id: string) => Promise<void>;
  
  addDailyExpense: (expense: Omit<DailyExpense, 'id' | 'createdAt' | 'updatedAt' | 'remaining'>) => Promise<void>;
  updateDailyExpense: (id: string, expense: Partial<DailyExpense>) => Promise<void>;
  deleteDailyExpense: (id: string) => Promise<void>;
  
  addDebt: (debt: Omit<Debt, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateDebt: (id: string, debt: Partial<Debt>) => Promise<void>;
  deleteDebt: (id: string) => Promise<void>;
  
  addIncome: (income: Omit<Income, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateIncome: (id: string, income: Partial<Income>) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;
  
  addInvestment: (investment: Omit<Investment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateInvestment: (id: string, investment: Partial<Investment>) => Promise<void>;
  deleteInvestment: (id: string) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  fixedExpenses: [],
  dailyExpenses: [],
  debts: [],
  income: [],
  investments: [],
  overviewItems: [],
  currentView: 'table',
  language: 'en',
  isLoading: false,
  error: null,
  
  // UI Actions
  setCurrentView: (view) => set({ currentView: view }),
  setLanguage: (lang) => set({ language: lang }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  
  // Data Loading Actions
  loadFixedExpenses: async () => {
    try {
      set({ isLoading: true, error: null });
      const expenses = await firebaseService.getFixedExpenses();
      set({ fixedExpenses: expenses, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to load fixed expenses', isLoading: false });
    }
  },
  
  loadDailyExpenses: async () => {
    try {
      set({ isLoading: true, error: null });
      const expenses = await firebaseService.getDailyExpenses();
      set({ dailyExpenses: expenses, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to load daily expenses', isLoading: false });
    }
  },
  
  loadDebts: async () => {
    try {
      set({ isLoading: true, error: null });
      const debts = await firebaseService.getDebts();
      set({ debts, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to load debts', isLoading: false });
    }
  },
  
  loadIncome: async () => {
    try {
      set({ isLoading: true, error: null });
      const income = await firebaseService.getIncome();
      set({ income, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to load income', isLoading: false });
    }
  },
  
  loadInvestments: async () => {
    try {
      set({ isLoading: true, error: null });
      const investments = await firebaseService.getInvestments();
      set({ investments, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to load investments', isLoading: false });
    }
  },
  
  loadOverviewData: async () => {
    try {
      set({ isLoading: true, error: null });
      const overviewItems = await firebaseService.getOverviewData();
      set({ overviewItems, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to load overview data', isLoading: false });
    }
  },
  
  loadAllData: async () => {
    const { loadFixedExpenses, loadDailyExpenses, loadDebts, loadIncome, loadInvestments, loadOverviewData } = get();
    await Promise.all([
      loadFixedExpenses(),
      loadDailyExpenses(),
      loadDebts(),
      loadIncome(),
      loadInvestments(),
      loadOverviewData()
    ]);
  },
  
  // Fixed Expenses CRUD
  addFixedExpense: async (expense) => {
    try {
      set({ isLoading: true, error: null });
      await firebaseService.createFixedExpense(expense);
      await get().loadFixedExpenses();
      await get().loadOverviewData();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to add fixed expense', isLoading: false });
    }
  },
  
  updateFixedExpense: async (id, expense) => {
    try {
      set({ isLoading: true, error: null });
      await firebaseService.updateFixedExpense(id, expense);
      await get().loadFixedExpenses();
      await get().loadOverviewData();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update fixed expense', isLoading: false });
    }
  },
  
  deleteFixedExpense: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await firebaseService.deleteFixedExpense(id);
      await get().loadFixedExpenses();
      await get().loadOverviewData();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete fixed expense', isLoading: false });
    }
  },
  
  // Daily Expenses CRUD
  addDailyExpense: async (expense) => {
    try {
      set({ isLoading: true, error: null });
      await firebaseService.createDailyExpense(expense);
      await get().loadDailyExpenses();
      await get().loadOverviewData();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to add daily expense', isLoading: false });
    }
  },
  
  updateDailyExpense: async (id, expense) => {
    try {
      set({ isLoading: true, error: null });
      await firebaseService.updateDailyExpense(id, expense);
      await get().loadDailyExpenses();
      await get().loadOverviewData();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update daily expense', isLoading: false });
    }
  },
  
  deleteDailyExpense: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await firebaseService.deleteDailyExpense(id);
      await get().loadDailyExpenses();
      await get().loadOverviewData();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete daily expense', isLoading: false });
    }
  },
  
  // Debts CRUD
  addDebt: async (debt) => {
    try {
      set({ isLoading: true, error: null });
      await firebaseService.createDebt(debt);
      await get().loadDebts();
      await get().loadOverviewData();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to add debt', isLoading: false });
    }
  },
  
  updateDebt: async (id, debt) => {
    try {
      set({ isLoading: true, error: null });
      await firebaseService.updateDebt(id, debt);
      await get().loadDebts();
      await get().loadOverviewData();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update debt', isLoading: false });
    }
  },
  
  deleteDebt: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await firebaseService.deleteDebt(id);
      await get().loadDebts();
      await get().loadOverviewData();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete debt', isLoading: false });
    }
  },
  
  // Income CRUD
  addIncome: async (income) => {
    try {
      set({ isLoading: true, error: null });
      await firebaseService.createIncome(income);
      await get().loadIncome();
      await get().loadOverviewData();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to add income', isLoading: false });
    }
  },
  
  updateIncome: async (id, income) => {
    try {
      set({ isLoading: true, error: null });
      await firebaseService.updateIncome(id, income);
      await get().loadIncome();
      await get().loadOverviewData();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update income', isLoading: false });
    }
  },
  
  deleteIncome: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await firebaseService.deleteIncome(id);
      await get().loadIncome();
      await get().loadOverviewData();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete income', isLoading: false });
    }
  },
  
  // Investments CRUD
  addInvestment: async (investment) => {
    try {
      set({ isLoading: true, error: null });
      await firebaseService.createInvestment(investment);
      await get().loadInvestments();
      await get().loadOverviewData();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to add investment', isLoading: false });
    }
  },
  
  updateInvestment: async (id, investment) => {
    try {
      set({ isLoading: true, error: null });
      await firebaseService.updateInvestment(id, investment);
      await get().loadInvestments();
      await get().loadOverviewData();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update investment', isLoading: false });
    }
  },
  
  deleteInvestment: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await firebaseService.deleteInvestment(id);
      await get().loadInvestments();
      await get().loadOverviewData();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete investment', isLoading: false });
    }
  }
}));
