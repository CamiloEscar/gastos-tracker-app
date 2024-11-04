import { useMemo, useState } from 'react';
import { DollarSign, ChevronDown, ChevronUp, Receipt } from 'lucide-react';
import { Expense } from '../types';

interface DebtCalculation {
  from: string;
  to: string;
  amount: number;
  items: {
    description: string;
    amount: number;
  }[];
}

interface DetailedBalance {
  participantId: string;
  paid: number;
  owes: number;
  debts: DebtCalculation[];
  itemsDetail: {
    itemId: string;
    description: string;
    amount: number;
    isIncluded: boolean;
  }[];
}

interface Props {
  expense: Expense;
}

export function ExpenseBalances({ expense }: Props) {
  const [expandedParticipant, setExpandedParticipant] = useState<string | null>(null);
  const [expandedDebt, setExpandedDebt] = useState<number | null>(null);

  const { balances, detailedDebts } = useMemo(() => {
    const balanceMap = new Map<string, DetailedBalance>(
      expense.participants.map(participant => [
        participant.id,
        {
          participantId: participant.id,
          paid: 0,
          owes: 0,
          debts: [],
          itemsDetail: []
        }
      ])
    );

    // Procesar cada gasto
    expense.items.forEach(item => {
      // Registrar lo que pagó cada persona
      if (item.participantId) {
        const balance = balanceMap.get(item.participantId);
        if (balance) {
          balance.paid += item.amount;
        }
      }

      // Determinar quiénes comparten este gasto
      const participantIds = item.subgroup?.length 
        ? item.subgroup 
        : expense.participants.map(p => p.id);
      
      const splitAmount = item.amount / participantIds.length;
      const payer = item.participantId;

      // Registrar el detalle del item para cada participante
      expense.participants.forEach(participant => {
        const balance = balanceMap.get(participant.id);
        if (balance) {
          const isIncluded = participantIds.includes(participant.id);
          balance.itemsDetail.push({
            itemId: item.id,
            description: item.description,
            amount: isIncluded ? splitAmount : 0, // Solo agregar monto si está incluido
            isIncluded: isIncluded
          });
        }
      });

      // Calcular deudas solo para los participantes incluidos
      participantIds.forEach(participantId => {
        const balance = balanceMap.get(participantId);
        if (balance) {
          balance.owes += splitAmount;
          
          // Si no es quien pagó, registrar la deuda
          if (payer && participantId !== payer) {
            balance.debts.push({
              from: participantId,
              to: payer,
              amount: splitAmount,
              items: [{
                description: item.description,
                amount: splitAmount
              }]
            });
          }
        }
      });
    });

    const detailedDebts = consolidateDebts(Array.from(balanceMap.values()));

    return {
      balances: Array.from(balanceMap.values()),
      detailedDebts
    };
  }, [expense]);

  function consolidateDebts(balances: DetailedBalance[]): DebtCalculation[] {
    const debtMap = new Map<string, DebtCalculation>();
    
    balances.forEach(balance => {
      balance.debts.forEach(debt => {
        const key = `${debt.from}-${debt.to}`;
        const reverseKey = `${debt.to}-${debt.from}`;
        
        if (debtMap.has(reverseKey)) {
          const existingDebt = debtMap.get(reverseKey)!;
          if (existingDebt.amount > debt.amount) {
            existingDebt.amount -= debt.amount;
          } else {
            debtMap.delete(reverseKey);
            if (debt.amount > existingDebt.amount) {
              debtMap.set(key, {
                from: debt.from,
                to: debt.to,
                amount: debt.amount - existingDebt.amount,
                items: [...debt.items]
              });
            }
          }
        } else {
          const existingDebt = debtMap.get(key);
          if (existingDebt) {
            existingDebt.amount += debt.amount;
            existingDebt.items.push(...debt.items);
          } else {
            debtMap.set(key, {
              from: debt.from,
              to: debt.to,
              amount: debt.amount,
              items: [...debt.items]
            });
          }
        }
      });
    });

    return Array.from(debtMap.values()).filter(debt => debt.amount > 0);
  }

  const toggleParticipantExpansion = (participantId: string) => {
    setExpandedParticipant(expandedParticipant === participantId ? null : participantId);
  };

  const toggleDebtExpansion = (index: number) => {
    setExpandedDebt(expandedDebt === index ? null : index);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 space-y-4">
      <h4 className="font-medium text-lg text-gray-800 dark:text-gray-200 flex items-center gap-2">
        <DollarSign size={20} className="text-emerald-600" /> 
        Resumen de Gastos y Pagos
      </h4>
      
      <div className="space-y-4">
        {balances.map((balance) => {
          const participant = expense.participants.find(
            (p) => p.id === balance.participantId
          );
          
          const netBalance = balance.owes - balance.paid;
          const isExpanded = expandedParticipant === balance.participantId;
          
          return (
            <div
              key={balance.participantId}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden"
            >
              <div 
                className="p-3 flex items-center justify-between cursor-pointer"
                onClick={() => toggleParticipantExpansion(balance.participantId)}
              >
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {participant?.name}
                </span>
                <div className="flex items-center gap-2">
                  <div className={`px-2 py-1 rounded text-sm font-medium ${
                    netBalance > 0
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                      : netBalance < 0
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                  }`}>
                    {netBalance > 0 
                      ? `-$${netBalance.toFixed(2)}` 
                      : `+$${Math.abs(netBalance).toFixed(2)}`}
                  </div>
                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>
              
              {isExpanded && (
                <div className="p-3 border-t border-gray-200 dark:border-gray-600 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Pagó: ${balance.paid.toFixed(2)}</span>
                    <span className="text-gray-600 dark:text-gray-400">Debe: ${balance.owes.toFixed(2)}</span>
                  </div>
                  
                  <div className="text-sm space-y-1">
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <Receipt size={14} />
                      <span>Detalle de items:</span>
                    </div>
                    {balance.itemsDetail.map((item, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center justify-between pl-4 text-gray-600 dark:text-gray-400"
                      >
                        <span>{item.description}</span>
                        <div className="flex items-center gap-2">
                          <span className={item.isIncluded ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}>
                            ${item.amount.toFixed(2)}
                          </span>
                          {!item.isIncluded && (
                            <span className="text-xs bg-gray-200 dark:bg-gray-600 px-1 py-0.5 rounded">
                              No incluido
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {detailedDebts.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-3">
            Pagos pendientes
          </h5>
          <div className="space-y-3">
            {detailedDebts.map((debt, index) => {
              const from = expense.participants.find(p => p.id === debt.from)?.name;
              const to = expense.participants.find(p => p.id === debt.to)?.name;
              const isExpanded = expandedDebt === index;

              return (
                <div 
                  key={index}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden"
                >
                  <div 
                    className="p-3 flex items-center justify-between cursor-pointer"
                    onClick={() => toggleDebtExpansion(index)}
                  >
                    <span className="text-gray-800 dark:text-gray-200">
                      <span className="font-medium">{from}</span> debe a <span className="font-medium">{to}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">
                        ${debt.amount.toFixed(2)}
                      </span>
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="p-3 border-t border-gray-200 dark:border-gray-600 space-y-1">
                      {debt.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                          <span>{item.description}</span>
                          <span>${item.amount.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}