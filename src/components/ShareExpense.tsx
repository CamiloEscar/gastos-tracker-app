import React from 'react';
import { Share2 } from 'lucide-react';
import { Expense } from '../types';

interface Props {
  expense: Expense;
}

export function ShareExpense({ expense }: Props) {
  const total = expense.items.reduce((sum, item) => sum + item.amount, 0);
  const perPerson = total / expense.participants.length;

  const balances = expense.participants.map((participant) => {
    const paid = expense.items
      .filter((item) => item.participantId === participant.id)
      .reduce((sum, item) => sum + item.amount, 0);

    return {
      participantId: participant.id,
      name: participant.name,
      paid,
      owes: perPerson - paid,
    };
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const generateMessage = () => {
    const lines = [
      `📋 *${expense.title}*`,
      `📅 Fecha: ${formatDate(expense.date)}`,
      `💶 Total: ${formatCurrency(total)}`,
      `👥 Por persona: ${formatCurrency(perPerson)}`,
      '',
      '💫 *Balances:*',
      ...balances.map((balance) => {
        if (balance.owes > 0) {
          return `• ${balance.name} debe ${formatCurrency(balance.owes)}`;
        } else if (balance.owes < 0) {
          return `• ${balance.name} debe recibir ${formatCurrency(Math.abs(balance.owes))}`;
        }
        return `• ${balance.name} está al día`;
      }),
      '',
      '🧾 *Detalle de gastos:*',
      ...expense.items.map((item) => {
        const participant = expense.participants.find(p => p.id === item.participantId);
        return `• ${item.description}: ${formatCurrency(item.amount)}${participant ? ` (pagado por ${participant.name})` : ''}`;
      }),
      '',
      '✨ Generado con Divipagos'
    ];

    return encodeURIComponent(lines.join('\n'));
  };

  const shareToWhatsApp = () => {
    const message = generateMessage();
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  return (
    <button
      onClick={shareToWhatsApp}
      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
    >
      <Share2 className="w-4 h-4" />
      WhatsApp
    </button>
  );
}