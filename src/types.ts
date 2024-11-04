export interface Participant {
  id: string;
  name: string;
}

export interface ExpenseItem {
  id: string;
  participantId: string;
  description: string;
  amount: number;
  subgroup?: string[];
  sharedWith?: string[];
}

export interface ExpenseCategory {
  id: string;
  name: string;
  icon: string;
}

export interface Expense {
  id: string;
  category: string;
  date: string;
  title: string;
  participants: Participant[];
  items: ExpenseItem[];
}

export interface Balance {
  participantId: string;
  paid: number;
  owes: number;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  currency: string;
}

export interface AppState {
  expenses: Expense[];
  settings: AppSettings;
  searchQuery: string;
  dateRange: {
    start: string | null;
    end: string | null;
  };
  selectedCategory: string | null;
}

export interface FilterOptions {
  searchQuery: string;
  dateRange: {
    start: string | null;
    end: string | null;
  };
  category: string | null;
}

export type ExpenseStore = {
  state: AppState;
  addExpense: (expense: Expense) => void;
  addParticipantToExpense: (expenseId: string, participant: Participant) => void;
  addItemToExpense: (expenseId: string, item: ExpenseItem) => void;
  updateItemParticipant: (expenseId: string, itemId: string, participantId: string) => void;
  removeExpense: (id: string) => void;
  removeItem: (expenseId: string, itemId: string) => void;
  removeParticipantFromExpense: (expenseId: string, participantId: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setSearchQuery: (query: string) => void;
  setDateRange: (range: { start: string | null; end: string | null }) => void;
  setSelectedCategory: (category: string | null) => void;
  exportData: () => string;
  importData: (data: string) => void;
};