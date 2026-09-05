import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, Clock, CheckCircle, XCircle, QrCode } from 'lucide-react';
import * as borrowRequestService from '../services/borrowRequestService';
import * as transactionService from '../services/transactionService';
import * as repaymentService from '../services/repaymentService';
import * as authService from '../services/authService';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import QRModal from '../components/QRModal';
import { remainingOf, isOverdue } from '../utils/loan';

const BorrowerDashboard = () => {
    const [requests, setRequests] = useState([]);
    const [borrowed, setBorrowed] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [note, setNote] = useState('');
    const [selectedTx, setSelectedTx] = useState(null);
    const [repayAmount, setRepayAmount] = useState('');
    const [qrUser, setQrUser] = useState(null);
    const [busy, setBusy] = useState(false);

    const load = async () => {
        try {
            const [sent, tx] = await Promise.allSettled([
                borrowRequestService.getSentRequests(),
                transactionService.getTransactions({ type: 'borrowed', limit: 200 })
            ]);
            setRequests(sent.status === 'fulfilled' ? sent.value.data || [] : []);
            setBorrowed(tx.status === 'fulfilled' ? tx.value.data || [] : []);
        } catch (err) {
            setError('Failed to fetch borrower dashboard');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'accepted':
                return <CheckCircle className="text-green-500" size={20} />;
            case 'rejected':
                return <XCircle className="text-red-500" size={20} />;
            default:
                return <Clock className="text-yellow-500" size={20} />;
        }
    };

    const showLenderQr = async (userId, fallback) => {
        try {
            const res = await authService.getUserQr(userId);
            setQrUser(res.data);
        } catch {
            setQrUser(fallback);
        }
    };

    const submitRepayment = async (e) => {
        e.preventDefault();
        if (!selectedTx) return;
        setBusy(true);
        try {
            await repaymentService.requestRepayment({
                transactionId: selectedTx._id,
                note,
                amount: Number(repayAmount)
            });
            setSelectedTx(null);
            setNote('');
            await load();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to request repayment');
        } finally {
            setBusy(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="page-title">Borrower</h1>
                    <p className="mt-1 text-gray-500">Sent requests, borrowed money, and UPI QR codes.</p>
                    <Link to="/repayment-history" className="text-sm font-medium text-emerald-800 hover:underline">
                        View repayment history
                    </Link>
                </div>
                <Link
                    to="/borrow-request"
                    className="btn-primary"
                >
                    <Send className="-ml-1 mr-2 h-5 w-5" />
                    Send request
                </Link>
            </div>

            {error && <div className="text-red-600 bg-red-50 p-3 rounded">{error}</div>}

            <section className="space-y-4">
                <h2 className="text-lg font-semibold">Borrowed money</h2>
                {borrowed.length === 0 ? (
                    <EmptyState compact title="No borrowed transactions" />
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {borrowed.map((t) => (
                            <div key={t._id} className="bg-white rounded-3xl border border-gray-100 p-5">
                                <div className="flex justify-between">
                                    <h3 className="font-semibold">{t.friendName || t.otherUser?.name}</h3>
                                    <StatusBadge status={t.status} />
                                </div>
                                <p className="text-3xl font-semibold text-rose-600 my-2">{formatCurrency(remainingOf(t) || t.amount)}</p>
                                {remainingOf(t) !== Number(t.amount) && t.status !== 'repaid' && (
                                    <p className="text-sm text-gray-500">Original {formatCurrency(t.amount)}</p>
                                )}
                                {t.dueDate && (
                                    <p className={`text-sm ${isOverdue(t) ? 'text-rose-600' : 'text-gray-500'}`}>
                                        Due {formatDate(t.dueDate)}{isOverdue(t) ? ' (overdue)' : ''}
                                    </p>
                                )}
                                {t.repaymentDate && (
                                    <p className="text-sm text-gray-500">Repaid on {formatDate(t.repaymentDate)}</p>
                                )}
                                {t.status === 'pending_approval' && (
                                    <p className="mt-3 text-sm text-yellow-700 bg-yellow-50 p-2 rounded">
                                        Waiting for the lender to approve this repayment.
                                    </p>
                                )}
                                <div className="flex gap-2 mt-4">
                                    {t.otherUser && (
                                        <button
                                            onClick={() => showLenderQr(t.otherUser._id, t.otherUser)}
                                            className="px-3 py-2 border rounded-md text-sm inline-flex items-center"
                                        >
                                            <QrCode size={16} className="mr-1" /> Pay via UPI
                                        </button>
                                    )}
                                    {t.status === 'active' && t.otherUser && (
                                        <button
                                            onClick={() => {
                                                setSelectedTx(t);
                                                setRepayAmount(String(remainingOf(t)));
                                            }}
                                            className="btn-primary text-sm py-2"
                                        >
                                            Mark as paid
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className="space-y-4">
                <h2 className="text-lg font-semibold">Sent borrow requests</h2>
                {requests.length === 0 ? (
                    <EmptyState
                        title="You haven't sent any borrow requests."
                        action={
                            <Link to="/borrow-request" className="btn-primary mt-4">
                                Send one now
                            </Link>
                        }
                    />
                ) : (
                    <div className="table-wrap overflow-hidden">
                        <table className="data-table">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lender</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {requests.map((req) => (
                                    <tr key={req._id}>
                                        <td className="px-6 py-4">
                                            <div className="font-medium">{req.lender?.name}</div>
                                            <div className="text-sm text-gray-500">{req.lender?.email}</div>
                                        </td>
                                        <td className="px-6 py-4 font-bold">{formatCurrency(req.amount)}</td>
                                        <td className="px-6 py-4 text-sm max-w-xs truncate">{req.reason}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                {getStatusIcon(req.status)}
                                                <span className="capitalize text-sm">{req.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {formatDate(req.createdAt)}
                                            {req.respondedAt && <div>Responded {formatDate(req.respondedAt)}</div>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {selectedTx && (
                <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-4">
                    <form onSubmit={submitRepayment} className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl">
                        <h3 className="text-lg font-bold">Mark as paid</h3>
                        <p className="text-sm text-gray-600">
                            Remaining {formatCurrency(remainingOf(selectedTx))} to {selectedTx.friendName || selectedTx.otherUser?.name}.
                        </p>
                        <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={repayAmount}
                            onChange={(e) => setRepayAmount(e.target.value)}
                            className="w-full border rounded-md px-3 py-2 text-sm"
                        />
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={3}
                            placeholder="Optional repayment note"
                            className="w-full border rounded-md px-3 py-2 text-sm"
                        />
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setSelectedTx(null)} className="px-4 py-2 border rounded-md text-sm">
                                Cancel
                            </button>
                            <button disabled={busy} className="btn-primary">
                                {busy ? 'Sending...' : 'Submit'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <QRModal open={!!qrUser} onClose={() => setQrUser(null)} user={qrUser} title="Lender UPI QR" />
        </div>
    );
};

export default BorrowerDashboard;
