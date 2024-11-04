// ExpenseItems.tsx

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
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <Receipt size={18} /> Items
        </h4>
        <button
          onClick={handleAddItem}
          className="text-emerald-600 hover:text-emerald-700"
          aria-label="Agregar item"
        >
          <PlusCircle size={20} />
        </button>
      </div>

      {/* Formulario de nuevo item */}
      <div className="flex flex-col mb-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
        <input
          type="text"
          placeholder="Descripción del gasto"
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
        
        {/* Selección de participantes */}
        <div className="mt-2">
          <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">¿Quiénes comparten este gasto?</h5>
          <div className="grid grid-cols-2 gap-2">
            {expense.participants.map((participant) => (
              <div 
                key={participant.id} 
                className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-700 p-2 rounded"
              >
                <input
                  type="checkbox"
                  id={`participant-${participant.id}`}
                  checked={selectedSubgroup.includes(participant.id)}
                  onChange={() => toggleSubgroup(participant.id)}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label 
                  htmlFor={`participant-${participant.id}`}
                  className="text-sm text-gray-700 dark:text-gray-300"
                >
                  {participant.name}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de items */}
      <div className="space-y-2">
        {expense.items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg"
          >
            <div className="flex-1 space-y-1 w-full sm:w-auto">
              <div className="flex items-center justify-between sm:justify-start gap-2">
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {item.description}
                </span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  ${item.amount.toFixed(2)}
                </span>
              </div>
              
              {/* Información de subgrupo */}
              {item.subgroup && item.subgroup.length < expense.participants.length && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Solo para: {item.subgroup.map(id => 
                    expense.participants.find(p => p.id === id)?.name
                  ).join(', ')}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={item.participantId}
                onChange={(e) => onUpdateItemParticipant(item.id, e.target.value)}
                className="flex-1 sm:flex-none text-sm border rounded p-1 bg-white dark:bg-gray-600 dark:border-gray-500 dark:text-white focus:ring-2 focus:ring-emerald-600"
              >
                <option value="">¿Quién pagó?</option>
                {expense.participants.map((participant) => (
                  <option key={participant.id} value={participant.id}>
                    {participant.name}
                  </option>
                ))}
              </select>

              <button
                onClick={() => onRemoveItem(item.id)}
                className="text-gray-400 hover:text-red-500 p-1"
                aria-label={`Eliminar ${item.description}`}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Mensaje cuando no hay items */}
      {expense.items.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400 py-4">
          No hay items todavía. Agrega el primer gasto.
        </div>
      )}
    </div>
  );
}