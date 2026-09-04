import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import * as transactionService from '../services/transactionService';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

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

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const params = { limit: 50 };
            if (tab === 'lent' || tab === 'borrowed') params.type = tab;
            if (tab === 'repaid') params.status = 'repaid';
            if (friendFilter) params.friendName = friendFilter;
            const data = await transactionService.getTransactions(params);
            setTransactions(data.data || []);
        } catch (err) {
            setError('Failed to fetch transactions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [tab, friendFilter]);

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
                    <h1 className="text-4xl font-semibold tracking-tight text-gray-950">My transactions</h1>
                    <p className="mt-1 text-gray-500">Everything you have recorded, newest first.</p>
                </div>
                <Link
                    to="/add"
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-900 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800"
                >
                    <Plus size={18} /> Add
                </Link>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex gap-1">
                    {tabs.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setTab(item.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium ${
                                tab === item.id ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900'
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
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

            {error && <div className="text-red-600 text-sm">{error}</div>}

            {loading ? (
                <LoadingSpinner />
            ) : transactions.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center text-gray-500">No transactions found.</div>
            ) : (
                <div className="space-y-3">
                    {transactions.map((t) => (
                        <div key={t._id} className="bg-white rounded-3xl border border-gray-100 px-5 py-4 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-900 grid place-items-center font-semibold shrink-0">
                                {(t.friendName || t.otherUser?.name || '?').charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className="font-semibold text-gray-950">
                                        {t.friendName || t.otherUser?.name}
                                    </p>
                                    <StatusBadge status={t.type} />
                                    <StatusBadge status={t.status} />
                                </div>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    {formatDate(t.date)}{t.note ? ` · ${t.note}` : ''}
                                </p>
                            </div>
                            <p className="text-lg font-semibold text-emerald-900">{formatCurrency(t.amount)}</p>
                            {!t.borrowRequest && (
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Link to={`/edit-transaction/${t._id}`} className="hover:text-emerald-800">
                                        <Pencil size={16} />
                                    </Link>
                                    <button onClick={() => handleDelete(t._id)} className="hover:text-rose-600">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Transactions;
