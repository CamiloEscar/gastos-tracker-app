import { useState } from 'react';
import {
  Download,
  Upload,
  Moon,
  Sun,
  Search,
  Calendar,
  DollarSign,
  ChevronDown,
  X} from 'lucide-react';
import { useExpenseStore } from '../store';

export function Sidebar({ isMobileOpen, onMobileClose }: any) {
  const { state, setTheme, setDateRange, setSearchQuery, exportData, importData } = useExpenseStore();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const totalExpenses = state.expenses.reduce(
    (sum, expense) =>
      sum + expense.items.reduce((itemSum, item) => itemSum + item.amount, 0),
    0
  );

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          importData(content);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'expenses.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`
      fixed inset-y-0 left-0 z-40 w-72 bg-white dark:bg-gray-800 
      transform transition-transform duration-300 ease-in-out
      border-r border-gray-200 dark:border-gray-700
      lg:translate-x-0 lg:static lg:w-72
      ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      {/* Mobile Close Button */}
      <button
        onClick={onMobileClose}
        className="lg:hidden absolute right-4 top-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <X size={20} className="text-gray-500 dark:text-gray-400" />
      </button>

      {/* Sidebar Header */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            DiviPagos
          </h2>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar gastos..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg 
                     bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-emerald-500 
                     text-gray-900 dark:text-gray-100 placeholder-gray-500
                     transition-colors"
            onChange={(e) => setSearchQuery(e.target.value)}
            value={state.searchQuery}
          />
        </div>
      </div>

      {/* Sidebar Content */}
      <div className="px-6 pb-6 space-y-6 overflow-y-auto h-[calc(100vh-200px)] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
        {/* Overview Card */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-emerald-100">Total Gastos</span>
            <DollarSign size={20} className="text-emerald-100" />
          </div>
          <div className="text-2xl font-bold mb-1">${totalExpenses.toFixed(2)}</div>
          <div className="text-sm text-emerald-100">
            {state.expenses.length} transacciones
          </div>
        </div>

        {/* Date Range Section */}
        <div className="space-y-3">
          <button
            onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
            className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 
                     rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-gray-500 dark:text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300">Rango de Fechas</span>
            </div>
            <ChevronDown
              size={18}
              className={`text-gray-500 transform transition-transform ${
                isDatePickerOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isDatePickerOpen && (
            <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="space-y-1">
                <label className="text-sm text-gray-500 dark:text-gray-400">Desde</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 
                         rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                         focus:ring-2 focus:ring-emerald-500"
                  onChange={(e) => setDateRange({ ...state.dateRange, start: e.target.value })}
                  value={state.dateRange.start || ''}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-500 dark:text-gray-400">Hasta</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 
                         rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                         focus:ring-2 focus:ring-emerald-500"
                  onChange={(e) => setDateRange({ ...state.dateRange, end: e.target.value })}
                  value={state.dateRange.end || ''}
                />
              </div>
            </div>
          )}
        </div>

        {/* Actions Section */}
        <div className="space-y-2">
          <button
            onClick={handleExport}
            className="w-full flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-900 
                     rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
                     text-gray-700 dark:text-gray-300"
          >
            <Download size={18} />
            <span>Exportar Data</span>
          </button>
          <button
            onClick={handleImport}
            className="w-full flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-900 
                     rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
                     text-gray-700 dark:text-gray-300"
          >
            <Upload size={18} />
            <span>Importar Data</span>
          </button>
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <button
          onClick={() => setTheme(state.settings.theme === 'light' ? 'dark' : 'light')}
          className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-gray-900 
                   rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
                   text-gray-700 dark:text-gray-300"
        >
          <span>{state.settings.theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
          {state.settings.theme === 'light' ? (
            <Moon size={18} className="text-gray-500 dark:text-gray-400" />
          ) : (
            <Sun size={18} className="text-gray-500 dark:text-gray-400" />
          )}
        </button>
      </div>
    </div>
  );
}