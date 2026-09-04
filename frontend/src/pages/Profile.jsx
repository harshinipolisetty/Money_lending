import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import * as transactionService from '../services/transactionService';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import QRModal from '../components/QRModal';

const Profile = () => {
    const { user, logout, updateUpi, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [phone, setPhone] = useState(user?.phone || '');
    const [upiId, setUpiId] = useState(user?.upiId || '');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [showQr, setShowQr] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                await refreshProfile();
                const res = await transactionService.getTransactions({ limit: 500 });
                setTransactions(res.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        setPhone(user?.phone || '');
        setUpiId(user?.upiId || '');
    }, [user]);

    const stats = useMemo(() => {
        const lent = transactions.filter((t) => t.type === 'lent');
        const borrowed = transactions.filter((t) => t.type === 'borrowed');
        const active = transactions.filter((t) => t.status !== 'repaid');
        return {
            total: transactions.length,
            lent: lent.reduce((sum, t) => sum + t.amount, 0),
            borrowed: borrowed.reduce((sum, t) => sum + t.amount, 0),
            active: active.length
        };
    }, [transactions]);

    const saveUpi = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        try {
            await updateUpi({ phone, upiId });
            setMessage('Payment details updated.');
        } catch (err) {
            setMessage(err.response?.data?.message || 'Failed to update payment details');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-8 max-w-4xl">
            <div>
                <h1 className="text-4xl font-semibold tracking-tight text-gray-950">Profile</h1>
                <p className="mt-1 text-gray-500">Account details and UPI.</p>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 p-6">
                <h2 className="text-lg font-semibold mb-4">Account</h2>
                <dl className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div>
                        <dt className="text-gray-500">Name</dt>
                        <dd className="font-medium">{user?.name}</dd>
                    </div>
                    <div>
                        <dt className="text-gray-500">Email</dt>
                        <dd className="font-medium">{user?.email}</dd>
                    </div>
                    <div>
                        <dt className="text-gray-500">Member since</dt>
                        <dd className="font-medium">{formatDate(user?.createdAt)}</dd>
                    </div>
                </dl>
            </div>

            <div className="grid gap-4 sm:grid-cols-4">
                <StatCard label="Transactions" value={stats.total} />
                <StatCard label="Lent" value={formatCurrency(stats.lent)} />
                <StatCard label="Borrowed" value={formatCurrency(stats.borrowed)} />
                <StatCard label="Open loans" value={stats.active} />
            </div>

            <form onSubmit={saveUpi} className="bg-white rounded-3xl border border-gray-100 p-6 space-y-4">
                <h2 className="text-lg font-semibold">UPI details</h2>
                {message && <p className="text-sm text-blue-700">{message}</p>}
                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <input
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="input"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">UPI ID</label>
                        <input
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            className="input"
                            placeholder="name@upi"
                        />
                    </div>
                </div>
                <div className="flex gap-3">
                    <button type="submit" disabled={saving} className="btn-primary">
                        {saving ? 'Saving...' : 'Save and regenerate QR'}
                    </button>
                    <button type="button" onClick={() => setShowQr(true)} className="btn-ghost">
                        View my QR
                    </button>
                </div>
            </form>

            <div className="bg-white rounded-3xl border border-gray-100 p-6">
                <h2 className="text-lg font-semibold mb-4">Quick actions</h2>
                <div className="flex flex-wrap gap-3">
                    <Link to="/add" className="rounded-full bg-emerald-900 px-5 py-2.5 text-sm font-semibold text-white">Add transaction</Link>
                    <Link to="/borrow-request" className="rounded-full bg-white border border-gray-200 px-5 py-2.5 text-sm font-medium">Request a loan</Link>
                    <Link to="/transactions" className="rounded-full bg-white border border-gray-200 px-5 py-2.5 text-sm font-medium">My transactions</Link>
                    <button
                        onClick={() => {
                            logout();
                            navigate('/login');
                        }}
                        className="rounded-full border border-red-200 text-red-600 px-5 py-2.5 text-sm font-medium"
                    >
                        Logout
                    </button>
                </div>
            </div>

            <QRModal open={showQr} onClose={() => setShowQr(false)} user={user} title="Your UPI QR" />
        </div>
    );
};

export default Profile;
