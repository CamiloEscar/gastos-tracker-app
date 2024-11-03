import { DollarSign } from 'lucide-react';
import { Expense } from '../types';
import { useMemo } from 'react';

interface Props {
  expense: Expense;
}

export function ExpenseBalances({ expense }: Props) {
  const { total, balances } = useMemo(() => {
    const total = expense.items.reduce((sum, item) => sum + item.amount, 0);
    
    // Initialize balances for all participants
    const balanceMap = new Map(
      expense.participants.map(participant => [
        participant.id,
        {
          participantId: participant.id,
          paid: 0,
          owes: 0,
        }
      ])
    );

    // Calculate what each person paid
    expense.items.forEach(item => {
      if (item.participantId) {
        const balance = balanceMap.get(item.participantId);
        if (balance) {
          balance.paid += item.amount;
        }
      }
    });

    // Calculate what each person owes based on subgroups
    expense.items.forEach(item => {
      // If item has a subgroup, split between subgroup members, otherwise split between all participants
      const participantIds = item.subgroup?.length 
        ? item.subgroup 
        : expense.participants.map(p => p.id);

      const splitAmount = item.amount / participantIds.length;

      participantIds.forEach(participantId => {
        const balance = balanceMap.get(participantId);
        if (balance) {
          balance.owes += splitAmount;
        }
      });
    });

    return {
      total,
      balances: Array.from(balanceMap.values()),
    };
  }, [expense]);

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
      <h4 className="font-medium text-gray-700 flex items-center gap-2">
        <DollarSign size={18} /> Balances
      </h4>
      
      <div className="space-y-2">
        {balances.map((balance) => {
          const participant = expense.participants.find(
            (p) => p.id === balance.participantId
          );
          
          const netBalance = balance.owes - balance.paid;
          
          return (
            <div
              key={balance.participantId}
              className="flex justify-between items-center text-sm p-2 bg-white rounded border border-gray-100"
            >
              <span className="font-medium">{participant?.name}</span>
              <div className="flex gap-4">
                <span className="text-gray-600">
                  Pagó: ${balance.paid.toFixed(2)}
                </span>
                <span
                  className={
                    netBalance > 0
                      ? 'text-red-600'
                      : netBalance < 0
                      ? 'text-green-600'
                      : 'text-gray-600'
                  }
                >
                  {netBalance > 0
                    ? `Debe: $${netBalance.toFixed(2)}`
                    : netBalance < 0
                    ? `Le deben: $${Math.abs(netBalance).toFixed(2)}`
                    : '-'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-2 border-t border-gray-200">
        <div className="flex justify-between text-sm font-medium">
          <span>Total de gastos</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600 mt-1">
          <span>Distribución</span>
          <span className="text-xs">
            {expense.items.map((item) => (
              <div key={item.id}>
                {item.description}: {item.subgroup?.length 
                  ? `${item.subgroup.length} personas` 
                  : `${expense.participants.length} personas`
                }
              </div>
            ))}
          </span>
        </div>
      </div>
    </div>
  );
}