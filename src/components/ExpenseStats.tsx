import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { useExpenseStore } from '../store';
import { ArrowUpRight, ArrowDownRight, DollarSign, PieChart as PieChartIcon, BarChart as BarChartIcon } from 'lucide-react';

export function ExpenseStats() {
  const { state } = useExpenseStore();
  const [chartType, setChartType] = useState('bar');

  // Calculate category data
  const categoryData = state.expenses.reduce((acc, expense) => {
    const total = expense.items.reduce((sum, item) => sum + item.amount, 0);
    acc[expense.category] = (acc[expense.category] || 0) + total;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(categoryData).map(([name, value]) => ({
    name,
    amount: value,
  }));

  // Calculate total and trends
  const totalExpenses = chartData.reduce((sum, item) => sum + item.amount, 0);
  const previousTotal = totalExpenses * 0.9; // Example trend calculation
  const trend = ((totalExpenses - previousTotal) / previousTotal) * 100;

  const colors = [
    '#10B981', '#3B82F6', '#F59E0B', '#EF4444',
    '#8B5CF6', '#EC4899', '#14B8A6', '#F97316',
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-300">{payload[0].payload.name}</p>
          <p className="font-semibold text-gray-900 dark:text-gray-100">
            ${payload[0].value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Expenses Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center justify-center p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
            <DollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
            trend >= 0 
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' 
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {trend >= 0 ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
            {Math.abs(trend).toFixed(1)}%
          </span>
        </div>
        <p className="mt-4 text-2xl font-semibold text-gray-900 dark:text-gray-100">
          ${totalExpenses.toFixed(2)}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">Total Gastos</p>
      </div>

      {/* Chart Section */}
      <div className="md:col-span-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Distribución de gastos
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setChartType('bar')}
              className={`p-2 rounded-lg transition-colors ${
                chartType === 'bar'
                  ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              <BarChartIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setChartType('pie')}
              className={`p-2 rounded-lg transition-colors ${
                chartType === 'pie'
                  ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              <PieChartIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  axisLine={{ stroke: '#E5E7EB' }}
                  tickLine={{ stroke: '#E5E7EB' }}
                />
                <YAxis
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  axisLine={{ stroke: '#E5E7EB' }}
                  tickLine={{ stroke: '#E5E7EB' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                  {chartData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="amount"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {chartData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default ExpenseStats;