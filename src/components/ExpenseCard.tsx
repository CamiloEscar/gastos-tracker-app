import { PlusCircle, Users, Trash2 } from 'lucide-react';
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
    restaurante: '🍽️',
    'food-delivery': '🛵',
    evento: '🎉',
    Otro: '📝',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{categoryIcons[expense.category]}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{expense.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{expense.date}</p>
          </div>
        </div>
        <div className="flex items-center">
          <ShareExpense expense={expense} />
          <button
            onClick={() => removeExpense(expense.id)}
            className="text-red-600 hover:text-red-700 ml-4"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Users size={18} /> Participantes
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

        <ExpenseItems
          expense={expense}
          onAddItem={handleAddItem}
          onRemoveItem={onRemoveItem}
          onUpdateItemParticipant={onUpdateItemParticipant}
        />

        {expense.participants.length > 0 && <ExpenseBalances expense={expense} />}
      </div>
    </div>
  );
}