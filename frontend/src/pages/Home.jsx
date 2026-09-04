import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Plus, ArrowUpRight, HandCoins, PiggyBank, TrendingUp, Bell
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import * as transactionService from '../services/transactionService';
import * as borrowRequestService from '../services/borrowRequestService';
import * as repaymentService from '../services/repaymentService';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

const firstName = (name = '') => name.split(' ')[0] || 'there';

const Home = () => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [received, setReceived] = useState([]);
    const [pendingRepay, setPendingRepay] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [tx, rec, pend] = await Promise.all([
                    transactionService.getTransactions({ limit: 200 }),
                    borrowRequestService.getReceivedRequests(),
                    repaymentService.getPendingRepayments()
                ]);
                setTransactions(tx.data || []);
                setReceived(rec.data || []);
                setPendingRepay(pend.data || []);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const stats = useMemo(() => {
        const outstandingLent = transactions
            .filter((t) => t.type === 'lent' && t.status !== 'repaid')
            .reduce((s, t) => s + t.amount, 0);
        const youOwe = transactions
            .filter((t) => t.type === 'borrowed' && t.status !== 'repaid')
            .reduce((s, t) => s + t.amount, 0);
        const settled = transactions
            .filter((t) => t.status === 'repaid')
            .reduce((s, t) => s + t.amount, 0);
        const pendingBorrow = (received || []).filter((r) => r.status === 'pending').length;
        const needs = pendingBorrow + (pendingRepay || []).length;
        return { outstandingLent, youOwe, settled, needs, pendingBorrow };
    }, [transactions, received, pendingRepay]);

    if (loading) return <LoadingSpinner />;

    const recent = transactions.slice(0, 5);

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-semibold tracking-tight text-gray-950">
                        Hi, {firstName(user?.name)}
                    </h1>
                    <p className="mt-1 text-gray-500">Here is where your money stands today.</p>
                </div>
                <Link
                    to="/add"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-900 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800"
                >
                    <Plus size={18} />
                    Add transaction
                </Link>
            </div>

            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="rounded-3xl bg-emerald-50 p-5">
                    <div className="flex justify-between items-start">
                        <p className="text-sm text-gray-500">Outstanding lent</p>
                        <HandCoins size={18} className="text-emerald-800" />
                    </div>
                    <p className="mt-3 text-3xl font-semibold text-emerald-900">{formatCurrency(stats.outstandingLent)}</p>
                    <p className="mt-1 text-sm text-gray-500">Money owed to you</p>
                </div>
                <div className="rounded-3xl bg-white border border-gray-100 p-5">
                    <div className="flex justify-between items-start">
                        <p className="text-sm text-gray-500">You owe</p>
                        <PiggyBank size={18} className="text-rose-500" />
                    </div>
                    <p className="mt-3 text-3xl font-semibold text-rose-600">{formatCurrency(stats.youOwe)}</p>
                    <p className="mt-1 text-sm text-gray-500">Active borrowings</p>
                </div>
                <div className="rounded-3xl bg-emerald-50 p-5">
                    <div className="flex justify-between items-start">
                        <p className="text-sm text-gray-500">Settled</p>
                        <TrendingUp size={18} className="text-emerald-800" />
                    </div>
                    <p className="mt-3 text-3xl font-semibold text-emerald-900">{formatCurrency(stats.settled)}</p>
                    <p className="mt-1 text-sm text-gray-500">Fully repaid loans</p>
                </div>
                <div className="rounded-3xl bg-emerald-50/80 p-5">
                    <div className="flex justify-between items-start">
                        <p className="text-sm text-gray-500">Needs your action</p>
                        <Bell size={18} className="text-emerald-800" />
                    </div>
                    <p className="mt-3 text-3xl font-semibold text-gray-950">{stats.needs}</p>
                    <p className="mt-1 text-sm text-gray-500">
                        {stats.pendingBorrow} borrow · {pendingRepay.length} repayment
                    </p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Recent activity</h2>
                        <Link to="/transactions" className="text-sm font-medium text-emerald-800 hover:underline">
                            View all
                        </Link>
                    </div>
                    {recent.length === 0 ? (
                        <p className="text-sm text-gray-500 py-8 text-center">No activity yet.</p>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {recent.map((t) => (
                                <li key={t._id} className="py-4 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="h-11 w-11 rounded-full bg-emerald-50 text-emerald-900 grid place-items-center font-semibold shrink-0">
                                            {(t.friendName || t.otherUser?.name || '?').charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-semibold text-gray-900 truncate">
                                                {t.friendName || t.otherUser?.name}
                                            </p>
                                            <p className="text-sm text-gray-500 truncate">
                                                {formatDate(t.date)}{t.note ? ` · ${t.note}` : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className={`font-semibold ${t.type === 'lent' ? 'text-emerald-800' : 'text-rose-600'}`}>
                                            {t.type === 'lent' ? '+' : '-'}{formatCurrency(t.amount)}
                                        </p>
                                        <div className="mt-1 flex justify-end">
                                            <StatusBadge status={t.status} />
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="rounded-3xl bg-emerald-50 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick actions</h2>
                    <div className="space-y-2">
                        {[
                            { to: '/borrow-request', label: 'Request a loan' },
                            { to: '/lender-dashboard', label: 'Lender dashboard' },
                            { to: '/borrower-dashboard', label: 'Borrower dashboard' },
                            { to: '/summary', label: 'Friend-wise summary' }
                        ].map((item) => (
                            <Link
                                key={item.to}
                                to={item.to}
                                className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm font-medium text-gray-800 hover:bg-white/80"
                            >
                                {item.label}
                                <ArrowUpRight size={16} className="text-gray-400" />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
