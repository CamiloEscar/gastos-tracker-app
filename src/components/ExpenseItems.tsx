import { useState } from 'react';
import { PlusCircle, Receipt, Trash2 } from 'lucide-react';
import { Expense } from '../types';

interface Props {
  expense: Expense;
  onAddItem: (description: string, amount: number, subgroup?: string[]) => void;
  onRemoveItem: (itemId: string) => void;
  onUpdateItemParticipant: (itemId: string, participantId: string) => void;
}

export function ExpenseItems({
  expense,
  onAddItem,
  onRemoveItem,
  onUpdateItemParticipant,
}: Props) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedSubgroup, setSelectedSubgroup] = useState<string[]>([]);

  const handleAddItem = () => {
    const parsedAmount = parseFloat(amount);
    if (description && !isNaN(parsedAmount) && parsedAmount > 0) {
      onAddItem(description, parsedAmount, selectedSubgroup.length > 0 ? selectedSubgroup : undefined);
      setDescription('');
      setAmount('');
      setSelectedSubgroup([]);
    }
  };

  const toggleSubgroup = (participantId: string) => {
    setSelectedSubgroup((prev) =>
      prev.includes(participantId)
        ? prev.filter(id => id !== participantId)
        : [...prev, participantId]
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <Receipt size={18} /> Items
        </h4>
        <button
          onClick={handleAddItem}
          className="text-emerald-600 hover:text-emerald-700"
          aria-label="Add item"
        >
          <PlusCircle size={20} />
        </button>
      </div>

      <div className="flex flex-col mb-4">
        <input
          type="text"
          placeholder="Descripcion"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border rounded p-2 mb-2 focus:outline-none focus:ring-2 focus:ring-emerald-600 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        <input
          type="number"
          placeholder="Monto"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border rounded p-2 mb-2 focus:outline-none focus:ring-2 focus:ring-emerald-600 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        <div>
          <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Seleccione quienes comparten el gasto:</h5>
          {expense.participants.map((participant) => (
            <div key={participant.id} className="flex items-center mb-1">
              <input
                type="checkbox"
                id={`participant-${participant.id}`}
                checked={selectedSubgroup.includes(participant.id)}
                onChange={() => toggleSubgroup(participant.id)}
                className="mr-2"
              />
              <label htmlFor={`participant-${participant.id}`}>{participant.name}</label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {expense.items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-2 text-sm bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded"
          >
            <select
              value={item.participantId}
              onChange={(e) => onUpdateItemParticipant(item.id, e.target.value)}
              className="text-sm border-0 bg-transparent focus:ring-0 dark:text-white"
            >
              <option value="">Asignado a...</option>
              {expense.participants.map((participant) => (
                <option key={participant.id} value={participant.id}>
                  {participant.name}
                </option>
              ))}
            </select>
            <span className="flex-1 text-gray-600 dark:text-gray-300">{item.description}</span>
            <span className="font-medium">${item.amount.toFixed(2)}</span>
            <button
              onClick={() => onRemoveItem(item.id)}
              className="text-gray-400 hover:text-red-500"
              aria-label={`Remove ${item.description}`}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}