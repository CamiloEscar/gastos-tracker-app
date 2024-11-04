import { useState, useEffect, useCallback } from "react";
import { Plus, Filter, Layout, Search, Wallet, BarChart2, X } from "lucide-react";
import { ExpenseCard } from "./components/ExpenseCard";
import { NewExpenseModal } from "./components/NewExpenseModal";
import { Sidebar } from "./components/Sidebar";
import { ExpenseStats } from "./components/ExpenseStats";
import { useExpenseStore } from "./store";
import { v4 as uuidv4 } from "uuid";
import { Expense, ExpenseCategory } from "./types";
import { FilterModal } from "./components/FilterModal";

const expenseCategories: ExpenseCategory[] = [
  { id: 'comida', name: 'Comida', icon: '🍕' },
  { id: 'restaurante', name: 'Restaurante', icon: '🍽️' },
  { id: 'super', name: 'Super', icon: '🛒' },
  { id: 'transporte', name: 'Transporte', icon: '🚗' },
  { id: 'entretenimiento', name: 'Entretenimiento', icon: '🎭' },
  { id: 'shopping', name: 'Shopping', icon: '🛍️' },
  { id: 'utilidades', name: 'Utilidades', icon: '💡' },
  { id: 'salud', name: 'Salud', icon: '🏥' },
  { id: 'viajes', name: 'Viajes', icon: '✈️' },
  { id: 'educacion', name: 'Educacion', icon: '📚' },
  { id: 'otros', name: 'Otros', icon: '📌' },
];

export default function App() {
  const [isNewExpenseModalOpen, setIsNewExpenseModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const {
    state,
    addExpense,
    addParticipantToExpense,
    removeItem,
    updateItemParticipant,
    setSearchQuery,
    setDateRange,
    setSelectedCategory,
  } = useExpenseStore();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", state.settings.theme === "dark");
  }, [state.settings.theme]);

  const filteredExpenses = useCallback(() => {
    return state.expenses.filter((expense) => {
      const matchesSearch = expense.title.toLowerCase().includes(state.searchQuery.toLowerCase());
      const matchesCategory = !state.selectedCategory || expense.category === state.selectedCategory;
      const matchesDateRange =
        (!state.dateRange.start || expense.date >= state.dateRange.start) &&
        (!state.dateRange.end || expense.date <= state.dateRange.end);
      return matchesSearch && matchesCategory && matchesDateRange;
    });
  }, [state.expenses, state.searchQuery, state.selectedCategory, state.dateRange]);

  const handleAddParticipant = useCallback((expenseId: string) => {
    const name = prompt("Enter participant name:");
    if (name?.trim()) {
      addParticipantToExpense(expenseId, { id: uuidv4(), name: name.trim() });
    } else if (name !== null) {
      alert("Please enter a valid name.");
    }
  }, [addParticipantToExpense]);

  const handleNewExpense = useCallback((data: Omit<Expense, 'id' | 'participants' | 'items'>) => {
    addExpense({ id: uuidv4(), ...data, participants: [], items: [] });
    setIsNewExpenseModalOpen(false);
  }, [addExpense]);

  const expenses = filteredExpenses();

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar isMobileOpen={isSidebarOpen} onMobileClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-screen">
        {/* Top Navigation */}
        <nav className="sticky top-0 z-30 backdrop-blur-lg bg-white/75 dark:bg-gray-800/75 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <Layout className="w-6 h-6" />
                </button>
                <div className="flex-shrink-0 flex items-center gap-2">
                  <Wallet className="w-8 h-8 text-emerald-600" />
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                    DiviPagos
                  </h1>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsStatsModalOpen(true)}
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  title="Ver estadísticas"
                >
                  <BarChart2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setIsNewExpenseModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 rounded-full
                           bg-emerald-600 hover:bg-emerald-700 
                           text-white shadow-sm transition-colors"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Nuevo Gasto
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Content Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Filter */}
          <div className="mb-8 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar gastos..."
                value={state.searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full
                         text-gray-900 dark:text-gray-100 placeholder-gray-500
                         focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                         transition-colors"
              />
            </div>
            <button
              onClick={() => setIsFilterModalOpen(true)}
              className="inline-flex items-center px-4 py-2 rounded-full
                       bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                       text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700
                       transition-colors"
            >
              <Filter className="w-5 h-5 mr-2" />
              Filtrar
            </button>
          </div>

          {/* Expenses Grid */}
          {expenses.length > 0 ? (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
              {expenses.map((expense) => (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  onAddParticipant={() => handleAddParticipant(expense.id)}
                  onRemoveItem={(itemId) => removeItem(expense.id, itemId)}
                  onUpdateItemParticipant={(itemId, participantId) =>
                    updateItemParticipant(expense.id, itemId, participantId)
                  }
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/50 mb-4">
                <Plus className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No hay gastos encontrados
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Comienza a registrar tus gastos y divide las cuentas fácilmente con tus amigos
              </p>
              <button
                onClick={() => setIsNewExpenseModalOpen(true)}
                className="inline-flex items-center px-6 py-3 rounded-full
                         bg-emerald-600 hover:bg-emerald-700 
                         text-white shadow-sm transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Crear Nuevo Gasto
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Modal */}
      {isStatsModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>

            <div className="relative inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  Estadísticas de Gastos
                </h2>
                <button
                  onClick={() => setIsStatsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <ExpenseStats />
            </div>
          </div>
        </div>
      )}

      {/* Other Modals */}
      <NewExpenseModal
        isOpen={isNewExpenseModalOpen}
        onClose={() => setIsNewExpenseModalOpen(false)}
        onSubmit={handleNewExpense}
        categories={expenseCategories}
      />

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={(filters) => {
          setSearchQuery(filters.searchQuery);
          setDateRange(filters.dateRange);
          setSelectedCategory(filters.category);
          setIsFilterModalOpen(false);
        }}
        initialFilters={{
          searchQuery: state.searchQuery,
          dateRange: state.dateRange,
          category: state.selectedCategory,
        }}
        categories={expenseCategories}
      />
    </div>
  );
}