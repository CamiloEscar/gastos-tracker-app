import { useState } from 'react';
import { PlusCircle, Users, Trash2, X, ExternalLink } from 'lucide-react';
import { Expense, ExpenseItem } from '../types';
import { ExpenseItems } from './ExpenseItems';
import { ExpenseBalances } from './ExpenseBalances';
import { ShareExpense } from './ShareExpense';
import { useExpenseStore } from '../store';

interface Props {
  expense: Expense;
  onAddParticipant: () => void;
  onRemoveItem: (itemId: string) => void;
  onUpdateItemParticipant: (itemId: string, participantId: string) => void;
}

export function ExpenseCard({
  expense,
  onAddParticipant,
  onRemoveItem,
  onUpdateItemParticipant,
}: Props) {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const { removeExpense, removeParticipantFromExpense, addItemToExpense } = useExpenseStore(state => ({
    removeExpense: state.removeExpense,
    removeParticipantFromExpense: state.removeParticipantFromExpense,
    addItemToExpense: state.addItemToExpense
  }));

  const handleAddItem = (description: string, amount: number, subgroup?: string[]) => {
    const newItem: ExpenseItem = {
      id: `${Date.now()}`,
      description,
      amount,
      participantId: '',
      subgroup,
    };
    addItemToExpense(expense.id, newItem);
  };

  const categoryIcons: { [key: string]: string } = {
    comida: '🍕',
    restaurante: '🍽️',
    super: '🛒',
    shopping: '🛍️',
    utilidades: '💡',
    salud: '🏥',
    transporte: '🚗',
    entretenimiento: '🎉',
    otros: '🤔',
    viajes: '✈️',
    educacion: '📚',
    'food-delivery': '🛵',
    evento: '🎉',
    Otro: '📝',
  };

  const totalAmount = expense.items.reduce((sum, item) => sum + item.amount, 0);
  const shouldShowViewMore = expense.items.length > 3;
  const displayedItems = shouldShowViewMore ? expense.items.slice(0, 3) : expense.items;

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{categoryIcons[expense.category]}</span>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{expense.title}</h3>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">{expense.date}</p>
                  <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    ${totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ShareExpense expense={expense} />
              <button
                onClick={() => removeExpense(expense.id)}
                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>

          {/* Participants */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Users size={18} /> Participantes ({expense.participants.length})
              </h4>
              <button
                onClick={onAddParticipant}
                className="text-emerald-600 hover:text-emerald-700"
              >
                <PlusCircle size={20} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {expense.participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-3 py-1 rounded"
                >
                  {participant.name}
                  <button
                    onClick={() => removeParticipantFromExpense(expense.id, participant.id)}
                    className="text-red-600 hover:text-red-700 ml-2"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Preview of Items */}
          <div className="space-y-4">
            <ExpenseItems
              expense={{...expense, items: displayedItems}}
              onAddItem={handleAddItem}
              onRemoveItem={onRemoveItem}
              onUpdateItemParticipant={onUpdateItemParticipant}
            />
            
            {shouldShowViewMore && (
              <button
                onClick={() => setShowDetailsModal(true)}
                className="w-full py-2 px-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 
                         dark:hover:bg-gray-600 rounded-lg transition-colors flex items-center 
                         justify-center gap-2 text-sm text-gray-600 dark:text-gray-300"
              >
                <ExternalLink size={16} />
                Ver {expense.items.length - 3} items más
              </button>
            )}
          </div>

          {/* Summary Balances */}
          {expense.participants.length > 0 && (
            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
              <ExpenseBalances expense={expense} />
            </div>
          )}
        </div>
      </div>

      {/* Full Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Backdrop */}
            <div className="fixed inset-0 transition-opacity bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75" 
                 onClick={() => setShowDetailsModal(false)} />

            {/* Modal */}
            <div className="inline-block w-full max-w-3xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 rounded-xl shadow-xl">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {expense.title} - Detalles Completos
                </h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              
              <div className="px-6 py-4">
                <ExpenseItems
                  expense={expense}
                  onAddItem={handleAddItem}
                  onRemoveItem={onRemoveItem}
                  onUpdateItemParticipant={onUpdateItemParticipant}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ExpenseCard;