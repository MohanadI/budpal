import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, getDoc, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../../firebase.config';
import { 
  FixedExpense, 
  DailyExpense, 
  Debt, 
  Income, 
  Investment, 
  OverviewItem 
} from '../types';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Firestore collections
const COLLECTIONS = {
  FIXED_EXPENSES: 'fixedExpenses',
  DAILY_EXPENSES: 'dailyExpenses',
  DEBTS: 'debts',
  INCOME: 'income',
  INVESTMENTS: 'investments',
  OVERVIEW: 'overview'
} as const;

// Generic CRUD operations
class FirebaseService {
  // Create
  async createFixedExpense(data: Omit<FixedExpense, 'id' | 'createdAt' | 'updatedAt'>) {
    const docRef = await addDoc(collection(db, COLLECTIONS.FIXED_EXPENSES), {
      ...data,
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date())
    });
    return docRef.id;
  }

  async createDailyExpense(data: Omit<DailyExpense, 'id' | 'createdAt' | 'updatedAt' | 'remaining'>) {
    const remaining = data.planned - data.actual;
    const docRef = await addDoc(collection(db, COLLECTIONS.DAILY_EXPENSES), {
      ...data,
      remaining,
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date())
    });
    return docRef.id;
  }

  async createDebt(data: Omit<Debt, 'id' | 'createdAt' | 'updatedAt'>) {
    const docRef = await addDoc(collection(db, COLLECTIONS.DEBTS), {
      ...data,
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date())
    });
    return docRef.id;
  }

  async createIncome(data: Omit<Income, 'id' | 'createdAt' | 'updatedAt'>) {
    const docRef = await addDoc(collection(db, COLLECTIONS.INCOME), {
      ...data,
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date())
    });
    return docRef.id;
  }

  async createInvestment(data: Omit<Investment, 'id' | 'createdAt' | 'updatedAt'>) {
    const docRef = await addDoc(collection(db, COLLECTIONS.INVESTMENTS), {
      ...data,
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date())
    });
    return docRef.id;
  }

  // Read
  async getFixedExpenses(): Promise<FixedExpense[]> {
    const snapshot = await getDocs(collection(db, COLLECTIONS.FIXED_EXPENSES));
    return snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as FixedExpense;
    });
  }

  async getDailyExpenses(): Promise<DailyExpense[]> {
    const snapshot = await getDocs(collection(db, COLLECTIONS.DAILY_EXPENSES));
    return snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as DailyExpense;
    });
  }

  async getDebts(): Promise<Debt[]> {
    const snapshot = await getDocs(collection(db, COLLECTIONS.DEBTS));
    return snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as Debt;
    });
  }

  async getIncome(): Promise<Income[]> {
    const snapshot = await getDocs(collection(db, COLLECTIONS.INCOME));
    return snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as Income;
    });
  }

  async getInvestments(): Promise<Investment[]> {
    const snapshot = await getDocs(collection(db, COLLECTIONS.INVESTMENTS));
    return snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as Investment;
    });
  }

  // Update
  async updateFixedExpense(id: string, data: Partial<FixedExpense>) {
    const docRef = doc(db, COLLECTIONS.FIXED_EXPENSES, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.fromDate(new Date())
    });
  }

  async updateDailyExpense(id: string, data: Partial<DailyExpense>) {
    const updateData: any = { ...data, updatedAt: Timestamp.fromDate(new Date()) };
    if (data.planned !== undefined || data.actual !== undefined) {
      const docRef = doc(db, COLLECTIONS.DAILY_EXPENSES, id);
      const currentDoc = await getDoc(docRef);
      const currentData = currentDoc.data();
      const planned = data.planned ?? currentData?.planned ?? 0;
      const actual = data.actual ?? currentData?.actual ?? 0;
      updateData.remaining = planned - actual;
    }
    const docRef = doc(db, COLLECTIONS.DAILY_EXPENSES, id);
    await updateDoc(docRef, updateData);
  }

  async updateDebt(id: string, data: Partial<Debt>) {
    const docRef = doc(db, COLLECTIONS.DEBTS, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.fromDate(new Date())
    });
  }

  async updateIncome(id: string, data: Partial<Income>) {
    const docRef = doc(db, COLLECTIONS.INCOME, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.fromDate(new Date())
    });
  }

  async updateInvestment(id: string, data: Partial<Investment>) {
    const docRef = doc(db, COLLECTIONS.INVESTMENTS, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.fromDate(new Date())
    });
  }

  // Delete
  async deleteFixedExpense(id: string) {
    const docRef = doc(db, COLLECTIONS.FIXED_EXPENSES, id);
    await deleteDoc(docRef);
  }

  async deleteDailyExpense(id: string) {
    const docRef = doc(db, COLLECTIONS.DAILY_EXPENSES, id);
    await deleteDoc(docRef);
  }

  async deleteDebt(id: string) {
    const docRef = doc(db, COLLECTIONS.DEBTS, id);
    await deleteDoc(docRef);
  }

  async deleteIncome(id: string) {
    const docRef = doc(db, COLLECTIONS.INCOME, id);
    await deleteDoc(docRef);
  }

  async deleteInvestment(id: string) {
    const docRef = doc(db, COLLECTIONS.INVESTMENTS, id);
    await deleteDoc(docRef);
  }

  // Get overview data (aggregated from all categories)
  async getOverviewData(): Promise<OverviewItem[]> {
    const [fixedExpenses, dailyExpenses, debts, income, investments] = await Promise.all([
      this.getFixedExpenses(),
      this.getDailyExpenses(),
      this.getDebts(),
      this.getIncome(),
      this.getInvestments()
    ]);

    const overviewItems: OverviewItem[] = [
      ...fixedExpenses.map(item => ({
        id: item.id,
        category: 'Fixed' as const,
        title: item.title,
        planned: item.planned,
        actual: item.actual,
        currency: item.currency,
        date: item.date
      })),
      ...dailyExpenses.map(item => ({
        id: item.id,
        category: 'Daily' as const,
        title: item.title,
        planned: item.planned,
        actual: item.actual,
        currency: item.currency,
        remaining: item.remaining
      })),
      ...debts.map(item => ({
        id: item.id,
        category: 'Debt' as const,
        title: item.title,
        planned: item.planned,
        actual: item.actual,
        currency: item.currency,
        date: item.date
      })),
      ...income.map(item => ({
        id: item.id,
        category: 'Income' as const,
        title: item.title,
        planned: item.planned,
        actual: item.actual,
        currency: item.currency
      })),
      ...investments.map(item => ({
        id: item.id,
        category: 'Investment' as const,
        title: item.title,
        planned: item.planned,
        actual: item.actual,
        currency: item.currency,
        date: item.date
      }))
    ];

    return overviewItems;
  }
}

export const firebaseService = new FirebaseService();
export { auth };
export default app;
