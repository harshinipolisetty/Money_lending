import React from 'react';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import StatusBadge from './StatusBadge';

const TransactionCard = ({ transaction }) => {
    const isLent = transaction.type === 'lent';

    return (
        <div className="card p-4 hover:shadow-lift transition-shadow">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="font-medium text-gray-900">{transaction.friendName || transaction.otherUser?.name}</h3>
                    <p className="text-sm text-gray-500">{formatDate(transaction.date)}</p>
                </div>
                <div className={`font-bold ${isLent ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(transaction.amount)}
                </div>
            </div>
            {transaction.note && (
                <p className="text-sm text-gray-600 mt-2 truncate">{transaction.note}</p>
            )}
            <div className="mt-3 flex justify-between items-center">
                <span className={`text-xs font-medium px-2 py-1 rounded ${isLent ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {transaction.type}
                </span>
                <StatusBadge status={transaction.status} />
            </div>
        </div>
    );
};

export default TransactionCard;
