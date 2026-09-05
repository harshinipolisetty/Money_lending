import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import * as transactionService from '../services/transactionService';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { remainingOf, isOverdue } from '../utils/loan';

const tabs = [
    { id: 'all', label: 'All' },
    { id: 'lent', label: 'Lent' },
    { id: 'borrowed', label: 'Borrowed' },
    { id: 'repaid', label: 'Repaid' }
];

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [tab, setTab] = useState('all');
    const [friendFilter, setFriendFilter] = useState('');
    const [page, setPage] = useState(1);
    const [sort, setSort] = useState('date');
    const [order, setOrder] = useState('desc');
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const params = { limit: 10, page, sort, order };
            if (tab === 'lent' || tab === 'borrowed') params.type = tab;
            if (tab === 'repaid') params.status = 'repaid';
            if (friendFilter) params.friendName = friendFilter;
            const data = await transactionService.getTransactions(params);
            setTransactions(data.data || []);
            setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
        } catch (err) {
            setError('Failed to fetch transactions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [tab, friendFilter, page, sort, order]);

    useEffect(() => {
        setPage(1);
    }, [tab, friendFilter, sort, order]);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this transaction?')) return;
        try {
            await transactionService.deleteTransaction(id);
            fetchTransactions();
        } catch (err) {
            alert(err.response?.data?.message || 'Error deleting transaction');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="page-title">My transactions</h1>
                    <p className="page-sub">Everything you have recorded, newest first.</p>
                </div>
                <Link
                    to="/add"
                    className="btn-primary"
                >
                    <Plus size={18} /> Add
                </Link>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex gap-1 flex-wrap">
                    {tabs.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setTab(item.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium ${
                                    tab === item.id ? 'bg-moss-900 text-sand-50' : 'text-moss-800/70 hover:text-moss-900 hover:bg-white/60'
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                    <select
                        value={`${sort}:${order}`}
                        onChange={(e) => {
                            const [nextSort, nextOrder] = e.target.value.split(':');
                            setSort(nextSort);
                            setOrder(nextOrder);
                        }}
                        className="rounded-full border border-gray-200 bg-white py-2.5 px-3 text-sm"
                    >
                        <option value="date:desc">Newest first</option>
                        <option value="date:asc">Oldest first</option>
                        <option value="amount:desc">Amount high to low</option>
                        <option value="amount:asc">Amount low to high</option>
                        <option value="dueDate:asc">Due date soonest</option>
                    </select>
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            value={friendFilter}
                            onChange={(e) => setFriendFilter(e.target.value)}
                            placeholder="Filter by friend"
                            className="w-full sm:w-64 rounded-full border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-emerald-800"
                        />
                    </div>
                </div>
            </div>

            {error && <div className="text-red-600 text-sm">{error}</div>}

            {loading ? (
                <LoadingSpinner />
            ) : transactions.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center text-gray-500">No transactions found.</div>
            ) : (
                <div className="space-y-3">
                    {transactions.map((t) => (
                        <div key={t._id} className="surface px-5 py-4 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-moss-100 text-moss-900 grid place-items-center font-semibold shrink-0">
                                {(t.friendName || t.otherUser?.name || '?').charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className="font-semibold text-gray-950">
                                        {t.friendName || t.otherUser?.name}
                                    </p>
                                    <StatusBadge status={t.type} />
                                    <StatusBadge status={t.status} amountPaid={t.amountPaid} />
                                </div>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    {formatDate(t.date)}
                                    {t.dueDate ? ` · due ${formatDate(t.dueDate)}` : ''}
                                    {t.note ? ` · ${t.note}` : ''}
                                    {isOverdue(t) ? ' · overdue' : ''}
                                </p>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="text-lg font-semibold text-moss-900">{formatCurrency(t.amount)}</p>
                                {t.status !== 'repaid' && remainingOf(t) !== Number(t.amount) && (
                                    <p className="text-xs text-gray-500">Left {formatCurrency(remainingOf(t))}</p>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-gray-400">
                                <Link to={`/edit-transaction/${t._id}`} className="hover:text-emerald-800" title="Record payment or edit">
                                    <Pencil size={16} />
                                </Link>
                                {!t.borrowRequest && (
                                    <button onClick={() => handleDelete(t._id)} className="hover:text-rose-600">
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 text-sm">
                    <button
                        disabled={page <= 1}
                        onClick={() => setPage((p) => p - 1)}
                        className="px-3 py-1.5 rounded-full border disabled:opacity-40"
                    >
                        Previous
                    </button>
                    <span>Page {pagination.page} of {pagination.totalPages}</span>
                    <button
                        disabled={page >= pagination.totalPages}
                        onClick={() => setPage((p) => p + 1)}
                        className="px-3 py-1.5 rounded-full border disabled:opacity-40"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default Transactions;
