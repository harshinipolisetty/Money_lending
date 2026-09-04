import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as transactionService from '../services/transactionService';
import { formatCurrency } from '../utils/formatCurrency';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const Summary = () => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const res = await transactionService.getFriendSummary();
                setRows(res.data || []);
            } catch (err) {
                setError('Failed to load summary');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return <LoadingSpinner />;

    const outstandingLent = rows.reduce((s, r) => s + (r.outstandingLent || 0), 0);
    const outstandingBorrowed = rows.reduce((s, r) => s + (r.outstandingBorrowed || 0), 0);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-semibold tracking-tight text-gray-950">Summary</h1>
                <p className="mt-1 text-gray-500">Outstanding balances grouped by friend.</p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
                <div className="rounded-3xl bg-emerald-50 p-6">
                    <p className="text-sm text-gray-500">Friends tracked</p>
                    <p className="mt-2 text-4xl font-semibold text-gray-950">{rows.length}</p>
                </div>
                <div className="rounded-3xl bg-emerald-50 p-6">
                    <p className="text-sm text-gray-500">Total outstanding lent</p>
                    <p className="mt-2 text-3xl font-semibold text-emerald-900">{formatCurrency(outstandingLent)}</p>
                </div>
                <div className="rounded-3xl bg-emerald-50 p-6">
                    <p className="text-sm text-gray-500">Total outstanding borrowed</p>
                    <p className="mt-2 text-3xl font-semibold text-rose-600">{formatCurrency(outstandingBorrowed)}</p>
                </div>
            </div>

            {error && <div className="rounded-xl bg-red-50 text-red-700 p-3 text-sm">{error}</div>}

            {rows.length === 0 ? (
                <EmptyState
                    title="No friends tracked yet"
                    message="Add a transaction to see balances here."
                    action={<Link to="/add" className="inline-flex rounded-full bg-emerald-900 px-5 py-2.5 text-sm font-semibold text-white">Add a transaction</Link>}
                />
            ) : (
                <div className="bg-white rounded-3xl border border-gray-100 divide-y divide-gray-100">
                    {rows.map((row) => {
                        const lent = row.outstandingLent || 0;
                        const borrowed = row.outstandingBorrowed || 0;
                        const total = lent + borrowed || 1;
                        const net = lent - borrowed;
                        const status =
                            net > 0 ? `owes you ${formatCurrency(net)}` :
                            net < 0 ? `you owe ${formatCurrency(Math.abs(net))}` :
                            'settled';
                        return (
                            <div key={row.friendName} className="p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="font-semibold text-gray-950">{row.friendName}</p>
                                        <p className="text-sm text-gray-500 mt-0.5">
                                            {row.count} transaction{row.count === 1 ? '' : 's'}
                                        </p>
                                    </div>
                                    <p className={`font-semibold ${net > 0 ? 'text-emerald-900' : net < 0 ? 'text-rose-600' : 'text-gray-500'}`}>
                                        {status}
                                    </p>
                                </div>
                                <div className="mt-4 flex justify-between text-xs text-gray-500">
                                    <span>Lent {formatCurrency(lent)}</span>
                                    <span>Borrowed {formatCurrency(borrowed)}</span>
                                </div>
                                <div className="mt-1 h-2 rounded-full bg-gray-100 overflow-hidden flex">
                                    <div className="h-full bg-emerald-800" style={{ width: `${(lent / total) * 100}%` }} />
                                    <div className="h-full bg-gray-300" style={{ width: `${(borrowed / total) * 100}%` }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Summary;
