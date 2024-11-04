import { useState } from 'react';
import { Share2, Copy, Check, X, MessageCircle } from 'lucide-react';
import { Expense } from '../types';

interface Props {
  expense: Expense;
}

interface Balance {
  participantId: string;
  name: string;
  paid: number;
  owes: number;
}

interface DebtItem {
  description: string;
  amount: number;
}

interface DetailedDebt {
  from: string;
  to: string;
  amount: number;
  items: DebtItem[];
}

interface Payment {
  from: string;
  to: string;
  amount: number;
}

export function ShareExpense({ expense }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const calculateBalances = () => {
    const balances = new Map(
      expense.participants.map(p => [
        p.id,
        { participantId: p.id, name: p.name, paid: 0, owes: 0 }
      ])
    );

    expense.items.forEach(item => {
      if (item.participantId) {
        const payer = balances.get(item.participantId);
        if (payer) {
          payer.paid += item.amount;
        }
      }

      const participantsForItem = item.subgroup?.length 
        ? item.subgroup 
        : expense.participants.map(p => p.id);

      const perPersonAmount = item.amount / participantsForItem.length;

      participantsForItem.forEach(participantId => {
        const participant = balances.get(participantId);
        if (participant) {
          participant.owes += perPersonAmount;
        }
      });
    });

    return Array.from(balances.values()).map(balance => ({
      ...balance,
      owes: Number((balance.owes - balance.paid).toFixed(2))
    }));
  };

  const calculateOptimalPayments = (balances: Balance[]): Payment[] => {
    // Primero, vamos a obtener todas las deudas detalladas
    const detailedDebts = calculateDetailedDebts(balances);
    
    // Convertir las deudas detalladas a pagos
    const payments: Payment[] = detailedDebts.map(debt => ({
      from: debt.from,
      to: debt.to,
      amount: debt.amount
    }));
  
    // Optimizar los pagos consolidando deudas entre las mismas personas
    const optimizedPayments = new Map<string, Payment>();
    
    payments.forEach(payment => {
      const key = `${payment.from}-${payment.to}`;
      const reverseKey = `${payment.to}-${payment.from}`;
      
      if (optimizedPayments.has(reverseKey)) {
        // Si existe una deuda en dirección opuesta, cancelar la menor
        const existingPayment = optimizedPayments.get(reverseKey)!;
        if (existingPayment.amount > payment.amount) {
          existingPayment.amount -= payment.amount;
        } else {
          optimizedPayments.delete(reverseKey);
          if (payment.amount > existingPayment.amount) {
            optimizedPayments.set(key, {
              from: payment.from,
              to: payment.to,
              amount: Number((payment.amount - existingPayment.amount).toFixed(2))
            });
          }
        }
      } else {
        // Si no existe una deuda en dirección opuesta, agregar o actualizar
        const existingPayment = optimizedPayments.get(key);
        if (existingPayment) {
          existingPayment.amount = Number((existingPayment.amount + payment.amount).toFixed(2));
        } else {
          optimizedPayments.set(key, {
            from: payment.from,
            to: payment.to,
            amount: Number(payment.amount.toFixed(2))
          });
        }
      }
    });
  
    return Array.from(optimizedPayments.values());
  };
  
  const calculateDetailedDebts = (balances: Balance[]): DetailedDebt[] => {
    const detailedDebts: DetailedDebt[] = [];
  
    expense.items.forEach(item => {
      const payer = expense.participants.find(p => p.id === item.participantId);
      if (!payer) return;
  
      const participantsForItem = item.subgroup?.length 
        ? item.subgroup 
        : expense.participants.map(p => p.id);
  
      const perPersonAmount = item.amount / participantsForItem.length;
  
      participantsForItem.forEach(participantId => {
        if (participantId !== payer.id) {
          const debtor = expense.participants.find(p => p.id === participantId);
          if (!debtor) return;
  
          const existingDebt = detailedDebts.find(
            debt => debt.from === debtor.name && debt.to === payer.name
          );
  
          if (existingDebt) {
            existingDebt.amount += perPersonAmount;
            existingDebt.items.push({ 
              description: item.description, 
              amount: Number(perPersonAmount.toFixed(2)) 
            });
          } else {
            detailedDebts.push({
              from: debtor.name,
              to: payer.name,
              amount: Number(perPersonAmount.toFixed(2)),
              items: [{ 
                description: item.description, 
                amount: Number(perPersonAmount.toFixed(2)) 
              }]
            });
          }
        }
      });
    });
  
    return detailedDebts.map(debt => ({
      ...debt,
      amount: Number(debt.amount.toFixed(2))
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    }).format(amount).replace('ARS', '$');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const generateMessage = () => {
    const balances = calculateBalances();
    const detailedDebts = calculateDetailedDebts(balances);
    const payments = calculateOptimalPayments(balances);
    const total = expense.items.reduce((sum, item) => sum + item.amount, 0);

    const lines = [
      `🧾 *${expense.title}*`,
      ``,
      `📅 Fecha: ${formatDate(expense.date)}`,
      `👥 Participantes: ${expense.participants.length}`,
      `💰 Total: ${formatCurrency(total)}`,
      ``,
      `*💸 Resumen de pagos:*`,
      ...detailedDebts.map(debt => 
        `• ${debt.from} debe a ${debt.to}: ${formatCurrency(debt.amount)}`
      ),
      ``,
      `*🧾 Detalle de gastos:*`,
      ...expense.items.map((item) => {
        const participant = expense.participants.find(p => p.id === item.participantId);
        const sharedWithText = item.subgroup?.length
          ? ` (compartido entre: ${item.subgroup
            .map(id => expense.participants.find(p => p.id === id)?.name)
            .filter(Boolean)
            .join(', ')})`
          : '';
        return `• ${item.description}: ${formatCurrency(item.amount)}${participant ? ` (pagado por ${participant.name})` : ''}${sharedWithText}`;
      }),
      ``,
      `*💱 Pagos sugeridos:*`,
      ...payments.map(payment => 
        `• ${payment.from} debe pagarle ${formatCurrency(payment.amount)} a ${payment.to}`
      ),
      ``,
      `✨ Generado con Divipagos`
    ];

    return lines.join('\n');
  };

  const copyMessage = async () => {
    const message = generateMessage();
    await navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToWhatsApp = () => {
    const message = generateMessage();
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
      >
        <Share2 className="w-4 h-4" />
        Compartir Gastos
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
            <div 
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setIsModalOpen(false)}
            />

            <div className="relative z-50 w-full max-w-2xl p-6 mx-auto bg-white rounded-lg shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Compartir Resumen de Gastos
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <div className="mb-2 text-sm font-medium text-gray-700">
                  Vista Previa del Mensaje
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm font-mono text-gray-600">
                    {generateMessage()}
                  </pre>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 justify-end">
                <button
                  onClick={copyMessage}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-500" />
                      ¡Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copiar Mensaje
                    </>
                  )}
                </button>
                
                <button
                  onClick={shareToWhatsApp}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  <MessageCircle className="w-4 h-4" />
                  Compartir por WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}