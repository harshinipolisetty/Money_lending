import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as transactionService from '../services/transactionService';
import { formatCurrency } from '../utils/formatCurrency';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import SharePaySheet from '../components/SharePaySheet';
import LoanPayActions from '../components/LoanPayActions';
import { Undo2 } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { remainingOf } from '../utils/loan';

const sameFriend = (tx, name) =>
    (tx.friendName || tx.otherUser?.name || '').trim().toLowerCase() === String(name || '').trim().toLowerCase();

const firstOpen = (transactions, friendName, type) =>
    transactions.find(
        (tx) =>
            tx.type === type
            && tx.status !== 'repaid'
            && remainingOf(tx) > 0
            && sameFriend(tx, friendName)
    );

const Summary = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [rows, setRows] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [share, setShare] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                const [summary, tx] = await Promise.all([
                    transactionService.getFriendSummary(),
                    transactionService.getTransactions({ limit: 200 })
                ]);
                setRows(summary.data || []);
                setTransactions(tx.data || []);
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
                <h1 className="page-title">Summary</h1>
                <p className="page-sub">Outstanding balances grouped by friend. Settle or ask to pay in one tap.</p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
                <div className="stat-mint p-6">
                    <p className="text-sm text-sand-100/70">Friends tracked</p>
                    <p className="mt-2 font-display text-4xl font-medium">{rows.length}</p>
                </div>
                <div className="stat-cream p-6">
                    <p className="text-sm text-moss-800/60">Total outstanding lent</p>
                    <p className="mt-2 font-display text-3xl font-medium text-moss-900">{formatCurrency(outstandingLent)}</p>
                </div>
                <div className="stat-cream p-6">
                    <p className="text-sm text-moss-800/60">Total outstanding borrowed</p>
                    <p className="mt-2 font-display text-3xl font-medium text-coral-600">{formatCurrency(outstandingBorrowed)}</p>
                </div>
            </div>

            {error && <div className="rounded-xl bg-red-50 text-red-700 p-3 text-sm">{error}</div>}

            {rows.length === 0 ? (
                <EmptyState
                    title="No friends tracked yet"
                    message="Add a transaction to see balances here."
                    action={<Link to="/add" className="btn-primary">Add a transaction</Link>}
                />
            ) : (
                <div className="surface divide-y divide-sand-200">
                    {rows.map((row) => {
                        const lent = row.outstandingLent || 0;
                        const borrowed = row.outstandingBorrowed || 0;
                        const total = lent + borrowed || 1;
                        const net = lent - borrowed;
                        const status =
                            net > 0 ? `owes you ${formatCurrency(net)}` :
                            net < 0 ? `you owe ${formatCurrency(Math.abs(net))}` :
                            'settled';
                        const openLent = firstOpen(transactions, row.friendName, 'lent');
                        const openBorrowed = firstOpen(transactions, row.friendName, 'borrowed');

                        return (
                            <div key={row.friendName} className="p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="font-semibold text-moss-950">{row.friendName}</p>
                                        <p className="text-sm text-moss-800/55 mt-0.5">
                                            {row.count} transaction{row.count === 1 ? '' : 's'}
                                        </p>
                                    </div>
                                    <p className={`font-semibold ${net > 0 ? 'text-moss-800' : net < 0 ? 'text-coral-600' : 'text-moss-800/50'}`}>
                                        {status}
                                    </p>
                                </div>
                                <div className="mt-4 flex justify-between text-xs text-moss-800/55">
                                    <span>Lent {formatCurrency(lent)}</span>
                                    <span>Borrowed {formatCurrency(borrowed)}</span>
                                </div>
                                <div className="mt-1 h-2 rounded-full bg-sand-200 overflow-hidden flex">
                                    <div className="h-full bg-moss-800" style={{ width: `${(lent / total) * 100}%` }} />
                                    <div className="h-full bg-gold-400" style={{ width: `${(borrowed / total) * 100}%` }} />
                                </div>
                                {(openLent || openBorrowed) && (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {openLent && (
                                            <LoanPayActions
                                                editTo={`/edit-transaction/${openLent._id}`}
                                                onAskToPay={() =>
                                                    setShare({
                                                        friendName: row.friendName,
                                                        amount: remainingOf(openLent),
                                                        note: openLent.note || `loan with ${row.friendName}`
                                                    })
                                                }
                                            />
                                        )}
                                        {openBorrowed && (
                                            <button
                                                type="button"
                                                className="btn-compact-gold"
                                                onClick={() => navigate(`/borrower-dashboard?repay=${openBorrowed._id}`)}
                                            >
                                                <Undo2 size={14} strokeWidth={2.25} />
                                                Request repayment
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            <SharePaySheet
                open={!!share}
                onClose={() => setShare(null)}
                user={user}
                friendName={share?.friendName}
                amount={share?.amount}
                note={share?.note}
            />
        </div>
    );
};

export default Summary;
