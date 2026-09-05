import React from 'react';
import { formatCurrency } from '../utils/formatCurrency';

const field = 'input';

export const paidFromProgress = (progress, amount, customPaid) => {
    const principal = Number(amount) || 0;
    if (progress === 'repaid') return principal;
    if (progress === 'half') return Number((principal / 2).toFixed(2));
    if (progress === 'custom') return Number(customPaid) || 0;
    return 0;
};

export const progressFromTransaction = (tx) => {
    if (!tx) return 'outstanding';
    if (tx.status === 'repaid') return 'repaid';
    const paid = Number(tx.amountPaid) || 0;
    const principal = Number(tx.principalAmount || tx.originalAmount || tx.amount) || 0;
    if (paid <= 0) return 'outstanding';
    if (principal && Math.abs(paid - principal / 2) < 0.02) return 'half';
    return 'custom';
};

const PaymentProgressFields = ({
    amount,
    progress,
    onProgressChange,
    customPaid,
    onCustomPaidChange,
    error
}) => {
    const principal = Number(amount) || 0;
    const half = principal ? Number((principal / 2).toFixed(2)) : 0;

    return (
        <div>
            <label className="text-sm font-medium text-gray-800">Payment received</label>
            <p className="text-xs text-gray-500 mt-0.5">
                Mark if this loan is still due, half paid, a custom amount, or fully complete.
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2">
                {[
                    { id: 'outstanding', label: 'Still due' },
                    { id: 'half', label: `Half paid${principal ? ` (${formatCurrency(half)})` : ''}` },
                    { id: 'custom', label: 'Custom amount' },
                    { id: 'repaid', label: 'Fully paid' }
                ].map((option) => (
                    <button
                        key={option.id}
                        type="button"
                        onClick={() => onProgressChange(option.id)}
                        className={`rounded-xl border px-3 py-2.5 text-sm text-left ${
                            progress === option.id
                                ? 'border-moss-800 bg-moss-50 text-moss-900 shadow-sm'
                                : 'border-sand-200 text-moss-800 hover:bg-moss-50'
                        }`}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
            {progress === 'custom' && (
                <div className="mt-3">
                    <label className="text-sm font-medium text-gray-800">Amount already paid (₹)</label>
                    <input
                        type="number"
                        step="any"
                        min="0"
                        className={field}
                        value={customPaid}
                        onChange={(e) => onCustomPaidChange(e.target.value)}
                    />
                </div>
            )}
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
};

export default PaymentProgressFields;
