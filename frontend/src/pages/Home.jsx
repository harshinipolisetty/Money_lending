import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Plus, ArrowUpRight, HandCoins, PiggyBank, TrendingUp, Bell, Sparkles
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import * as transactionService from '../services/transactionService';
import * as borrowRequestService from '../services/borrowRequestService';
import * as repaymentService from '../services/repaymentService';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { remainingOf } from '../utils/loan';

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
            .reduce((s, t) => s + remainingOf(t), 0);
        const youOwe = transactions
            .filter((t) => t.type === 'borrowed' && t.status !== 'repaid')
            .reduce((s, t) => s + remainingOf(t), 0);
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
            <div className="relative overflow-hidden rounded-[2rem] stat-mint p-7 sm:p-9">
                <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-gold-400/20 blur-2xl" />
                <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-5">
                    <div>
                        <p className="kicker text-gold-400">Welcome back</p>
                        <h1 className="mt-2 font-display text-4xl sm:text-5xl font-medium text-sand-50">
                            Hi, {firstName(user?.name)}
                        </h1>
                        <p className="mt-2 text-sand-100/75 max-w-xl">
                            A calm view of what you lent, what you owe, and what needs a gentle nudge today.
                        </p>
                    </div>
                    <Link to="/add" className="btn-primary relative z-10 shrink-0 hover:text-sand-50">
                        <Plus size={18} />
                        Add transaction
                    </Link>
                </div>
            </div>

            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="stat-mint p-5">
                    <div className="flex justify-between items-start">
                        <p className="text-sm text-sand-100/70">Outstanding lent</p>
                        <HandCoins size={18} className="text-gold-400" />
                    </div>
                    <p className="mt-3 font-display text-3xl font-medium">{formatCurrency(stats.outstandingLent)}</p>
                    <p className="mt-1 text-sm text-sand-100/65">Money owed to you</p>
                </div>
                <div className="stat-cream p-5">
                    <div className="flex justify-between items-start">
                        <p className="text-sm text-moss-800/60">You owe</p>
                        <PiggyBank size={18} className="text-coral-500" />
                    </div>
                    <p className="mt-3 font-display text-3xl font-medium text-coral-600">{formatCurrency(stats.youOwe)}</p>
                    <p className="mt-1 text-sm text-moss-800/55">Active borrowings</p>
                </div>
                <div className="stat-cream p-5">
                    <div className="flex justify-between items-start">
                        <p className="text-sm text-moss-800/60">Settled</p>
                        <TrendingUp size={18} className="text-moss-700" />
                    </div>
                    <p className="mt-3 font-display text-3xl font-medium text-moss-900">{formatCurrency(stats.settled)}</p>
                    <p className="mt-1 text-sm text-moss-800/55">Fully repaid loans</p>
                </div>
                <div className="stat-cream p-5">
                    <div className="flex justify-between items-start">
                        <p className="text-sm text-moss-800/60">Needs your action</p>
                        <Bell size={18} className="text-gold-600" />
                    </div>
                    <p className="mt-3 font-display text-3xl font-medium text-moss-900">{stats.needs}</p>
                    <p className="mt-1 text-sm text-moss-800/55">
                        {stats.pendingBorrow} borrow · {pendingRepay.length} repayment
                    </p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 surface p-6 sm:p-7">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="font-display text-2xl text-moss-900">Recent loans</h2>
                        <Link to="/transactions" className="text-sm font-semibold text-moss-800 hover:text-gold-600">
                            View all
                        </Link>
                    </div>
                    {recent.length === 0 ? (
                        <p className="text-sm text-moss-800/60 py-10 text-center">No loans yet — add your first one.</p>
                    ) : (
                        <ul className="divide-y divide-sand-200">
                            {recent.map((t) => (
                                <li key={t._id} className="py-4 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="h-11 w-11 rounded-2xl bg-moss-100 text-moss-900 grid place-items-center font-semibold shrink-0">
                                            {(t.friendName || t.otherUser?.name || '?').charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-semibold text-moss-950 truncate">
                                                {t.friendName || t.otherUser?.name}
                                            </p>
                                            <p className="text-sm text-moss-800/55 truncate">
                                                {formatDate(t.date)}{t.note ? ` · ${t.note}` : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className={`font-semibold ${t.type === 'lent' ? 'text-moss-800' : 'text-coral-600'}`}>
                                            {t.type === 'lent' ? '+' : '-'}{formatCurrency(t.amount)}
                                        </p>
                                        <div className="mt-1 flex justify-end">
                                            <StatusBadge status={t.status} amountPaid={t.amountPaid} />
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="surface p-6 sm:p-7">
                    <div className="flex items-center gap-2 mb-4">
                        <Sparkles size={16} className="text-gold-600" />
                        <h2 className="font-display text-2xl text-moss-900">Quick actions</h2>
                    </div>
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
                                className="flex items-center justify-between rounded-2xl bg-moss-50 px-4 py-3.5 text-sm font-semibold text-moss-900 hover:bg-gold-400/20 transition"
                            >
                                {item.label}
                                <ArrowUpRight size={16} className="text-gold-600" />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
