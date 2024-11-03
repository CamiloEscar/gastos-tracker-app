import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ExpenseStore, AppState, ExpenseItem } from "./types";

const initialState: AppState = {
  expenses: [],
  settings: {
    theme: "light",
    currency: "ARS",
  },
  searchQuery: "",
  dateRange: {
    start: null,
    end: null,
  },
  selectedCategory: null,
};

export const useExpenseStore = create<ExpenseStore>()(
  persist(
    (set, get) => ({
      state: initialState,
      addExpense: (expense) =>
        set((state) => ({
          state: {
            ...state.state,
            expenses: [...state.state.expenses, expense],
          },
        })),
      addParticipantToExpense: (expenseId, participant) =>
        set((state) => ({
          state: {
            ...state.state,
            expenses: state.state.expenses.map((expense) =>
              expense.id === expenseId
                ? {
                    ...expense,
                    participants: [...expense.participants, participant],
                  }
                : expense
            ),
          },
        })),
      addItemToExpense: (expenseId: string, item: ExpenseItem) =>
        set((state) => ({
          state: {
            ...state.state,
            expenses: state.state.expenses.map((expense) =>
              expense.id === expenseId
                ? { ...expense, items: [...expense.items, item] }
                : expense
            ),
          },
        })),
      updateItemParticipant: (expenseId, itemId, participantId) =>
        set((state) => ({
          state: {
            ...state.state,
            expenses: state.state.expenses.map((expense) =>
              expense.id === expenseId
                ? {
                    ...expense,
                    items: expense.items.map((item) =>
                      item.id === itemId ? { ...item, participantId } : item
                    ),
                  }
                : expense
            ),
          },
        })),
      removeExpense: (id) =>
        set((state) => ({
          state: {
            ...state.state,
            expenses: state.state.expenses.filter(
              (expense) => expense.id !== id
            ),
          },
        })),
      removeItem: (expenseId, itemId) =>
        set((state) => ({
          state: {
            ...state.state,
            expenses: state.state.expenses.map((expense) =>
              expense.id === expenseId
                ? {
                    ...expense,
                    items: expense.items.filter((item) => item.id !== itemId),
                  }
                : expense
            ),
          },
        })),
      removeParticipantFromExpense: (expenseId: string, participantId: string) =>
        set((state) => ({
          state: {
            ...state.state,
            expenses: state.state.expenses.map((expense) =>
              expense.id === expenseId
                ? {
                    ...expense,
                    participants: expense.participants.filter(
                      (participant) => participant.id !== participantId
                    ),
                    items: expense.items.map((item) =>
                      item.participantId === participantId
                        ? { ...item, participantId: '' }
                        : item
                    ),
                  }
                : expense
            ),
          },
        })),
      setTheme: (theme) =>
        set((state) => ({
          state: {
            ...state.state,
            settings: { ...state.state.settings, theme },
          },
        })),
      setSearchQuery: (searchQuery) =>
        set((state) => ({
          state: { ...state.state, searchQuery },
        })),
      setDateRange: (dateRange) =>
        set((state) => ({
          state: { ...state.state, dateRange },
        })),
      setSelectedCategory: (selectedCategory) =>
        set((state) => ({
          state: { ...state.state, selectedCategory },
        })),
      exportData: () => JSON.stringify(get().state),
      importData: (data) => {
        try {
          const parsed = JSON.parse(data);
          set({ state: parsed });
        } catch (e) {
          console.error("Failed to import data:", e);
        }
      },
    }),
    {
      name: "expense-store",
    }
  )
);