import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, X, Clock, QrCode } from 'lucide-react';
import * as borrowRequestService from '../services/borrowRequestService';
import * as repaymentService from '../services/repaymentService';
import * as transactionService from '../services/transactionService';
import * as authService from '../services/authService';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import QRModal from '../components/QRModal';
import ConfirmModal from '../components/ConfirmModal';
import SharePaySheet from '../components/SharePaySheet';
import LoanPayActions from '../components/LoanPayActions';
import useAuth from '../hooks/useAuth';
import { remainingOf } from '../utils/loan';

const LenderDashboard = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [pendingRepayments, setPendingRepayments] = useState([]);
    const [lent, setLent] = useState([]);
    const [share, setShare] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    const [qrUser, setQrUser] = useState(null);
    const [confirm, setConfirm] = useState(null);

    const load = async () => {
        try {
            const [received, pending, lentRes] = await Promise.allSettled([
                borrowRequestService.getReceivedRequests(),
                repaymentService.getPendingRepayments(),
                transactionService.getTransactions({ type: 'lent', limit: 200 })
            ]);
            const value = (result) => (result.status === 'fulfilled' ? result.value.data || [] : []);
            setRequests(value(received));
            setPendingRepayments(value(pending));
            setLent(value(lentRes).filter((t) => t.type === 'lent'));
            if ([received, pending, lentRes].some((r) => r.status === 'rejected')) {
                setError('Some lender data could not be loaded. Saved lent transactions still appear below if they loaded.');
            } else {
                setError('');
            }
        } catch (err) {
            setError('Failed to load lender dashboard');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const showBorrowerQr = async (userId, fallback) => {
        try {
            const res = await authService.getUserQr(userId);
            setQrUser(res.data);
        } catch {
            setQrUser(fallback);
        }
    };

    const runConfirm = async () => {
        if (!confirm) return;
        setActionLoading(confirm.id);
        try {
            await confirm.action();
            await load();
        } catch (err) {
            alert(err.response?.data?.message || 'Action failed');
        } finally {
            setActionLoading(null);
            setConfirm(null);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="page-title">Lender</h1>
                <p className="page-sub">Review borrow requests and repayment approvals.</p>
                <Link to="/repayment-history" className="text-sm font-semibold text-gold-600 hover:underline">
                    View repayment history
                </Link>
            </div>

            {error && <div className="text-red-600 bg-red-50 p-3 rounded">{error}</div>}

            <section className="space-y-4">
                <h2 className="text-lg font-semibold">Pending repayment approvals</h2>
                {pendingRepayments.length === 0 ? (
                    <EmptyState compact title="No pending repayments" />
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {pendingRepayments.map((item) => (
                            <div key={item._id} className="bg-white rounded-3xl border border-gray-100 p-5">
                                <p className="font-semibold">{item.borrower?.name}</p>
                                <p className="text-3xl font-semibold text-emerald-900 my-2">{formatCurrency(item.amount)}</p>
                                {item.note && <p className="text-sm text-gray-600 italic">"{item.note}"</p>}
                                <p className="text-xs text-gray-500 mt-2">Requested {formatDate(item.requestDate)}</p>
                                <div className="flex gap-2 mt-4">
                                    <button
                                        className="flex-1 py-2 border border-red-200 text-red-600 rounded-md"
                                        onClick={() =>
                                            setConfirm({
                                                id: item._id,
                                                title: 'Reject repayment',
                                                message: 'This loan will stay active.',
                                                action: () => repaymentService.rejectRepayment(item._id)
                                            })
                                        }
                                    >
                                        Reject
                                    </button>
                                    <button
                                        className="flex-1 py-2 btn-primary rounded-full"
                                        disabled={actionLoading === item._id}
                                        onClick={() =>
                                            setConfirm({
                                                id: item._id,
                                                title: 'Approve repayment',
                                                message: 'Both linked loans will be marked repaid.',
                                                action: () => repaymentService.approveRepayment(item._id)
                                            })
                                        }
                                    >
                                        Approve
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className="space-y-4">
                <h2 className="text-lg font-semibold">Borrow requests</h2>
                {requests.length === 0 ? (
                    <EmptyState compact title="No received requests" />
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {requests.map((req) => (
                            <div key={req._id} className="bg-white rounded-3xl border border-gray-100 p-6 relative overflow-hidden">
                                {req.status === 'pending' && (
                                    <div className="absolute top-0 right-0 bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-bl-lg">
                                        Needs Review
                                    </div>
                                )}
                                <h3 className="text-lg font-bold">{req.borrower?.name}</h3>
                                <p className="text-sm text-gray-500">{req.borrower?.email}</p>
                                <div className="text-3xl font-semibold text-emerald-900 my-3">{formatCurrency(req.amount)}</div>
                                <p className="text-sm italic text-gray-700">"{req.reason}"</p>
                                <p className="text-xs text-gray-500 mt-3 flex items-center">
                                    <Clock size={14} className="mr-1" />
                                    {formatDate(req.createdAt)}
                                    {req.respondedAt && ` · responded ${formatDate(req.respondedAt)}`}
                                </p>
                                {req.status === 'pending' ? (
                                    <div className="flex space-x-3 mt-4">
                                        <button
                                            onClick={() => showBorrowerQr(req.borrower?._id, req.borrower)}
                                            className="px-3 py-2 border rounded-md text-sm inline-flex items-center"
                                        >
                                            <QrCode size={16} className="mr-1" /> QR
                                        </button>
                                        <button
                                            onClick={() =>
                                                setConfirm({
                                                    id: req._id,
                                                    title: 'Reject request',
                                                    message: 'This borrow request will be rejected.',
                                                    action: () => borrowRequestService.rejectRequest(req._id)
                                                })
                                            }
                                            className="flex-1 py-2 border border-red-200 text-red-600 rounded-md inline-flex justify-center items-center"
                                        >
                                            <X size={16} className="mr-1" /> Reject
                                        </button>
                                        <button
                                            disabled={actionLoading === req._id}
                                            onClick={() =>
                                                setConfirm({
                                                    id: req._id,
                                                    title: 'Accept request',
                                                    message: 'This creates linked lent and borrowed transactions.',
                                                    action: () => borrowRequestService.acceptRequest(req._id)
                                                })
                                            }
                                            className="flex-1 py-2 btn-primary rounded-full inline-flex justify-center items-center"
                                        >
                                            <Check size={16} className="mr-1" /> Accept
                                        </button>
                                    </div>
                                ) : (
                                    <div className="mt-4">
                                        <StatusBadge status={req.status} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className="space-y-4">
                <h2 className="text-lg font-semibold">Money you lent</h2>
                {lent.length === 0 ? (
                    <EmptyState compact title="No lent transactions yet" message="Add a lent transaction or accept a borrow request." />
                ) : (
                    <div className="table-wrap overflow-x-auto">
                        <table className="data-table">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs uppercase text-gray-500">Friend</th>
                                    <th className="px-4 py-3 text-left text-xs uppercase text-gray-500">Original</th>
                                    <th className="px-4 py-3 text-left text-xs uppercase text-gray-500">Remaining</th>
                                    <th className="px-4 py-3 text-left text-xs uppercase text-gray-500">Due</th>
                                    <th className="px-4 py-3 text-left text-xs uppercase text-gray-500">Status</th>
                                    <th className="px-4 py-3 text-left text-xs uppercase text-gray-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {lent.map((t) => (
                                    <tr key={t._id}>
                                        <td className="px-4 py-3">{t.friendName || t.otherUser?.name}</td>
                                        <td className="px-4 py-3">{formatCurrency(t.originalAmount || t.amount)}</td>
                                        <td className="px-4 py-3">{formatCurrency(t.status === 'repaid' ? 0 : remainingOf(t))}</td>
                                        <td className="px-4 py-3 text-sm text-gray-500">{formatDate(t.dueDate)}</td>
                                        <td className="px-4 py-3">
                                            <StatusBadge status={t.status} amountPaid={t.amountPaid} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <LoanPayActions
                                                settled={t.status === 'repaid'}
                                                editTo={`/edit-transaction/${t._id}`}
                                                onAskToPay={() =>
                                                    setShare({
                                                        friendName: t.friendName || t.otherUser?.name,
                                                        amount: remainingOf(t),
                                                        note: t.note || `loan with ${t.friendName || 'you'}`
                                                    })
                                                }
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <QRModal open={!!qrUser} onClose={() => setQrUser(null)} user={qrUser} title="Borrower UPI QR" />
            <SharePaySheet
                open={!!share}
                onClose={() => setShare(null)}
                user={user}
                friendName={share?.friendName}
                amount={share?.amount}
                note={share?.note}
            />
            <ConfirmModal
                open={!!confirm}
                title={confirm?.title}
                message={confirm?.message}
                onCancel={() => setConfirm(null)}
                onConfirm={runConfirm}
            />
        </div>
    );
};

export default LenderDashboard;
