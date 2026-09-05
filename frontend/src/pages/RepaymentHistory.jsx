import React, { useEffect, useState } from 'react';
import * as repaymentService from '../services/repaymentService';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import useAuth from '../hooks/useAuth';

const RepaymentHistory = () => {
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await repaymentService.getRepaymentHistory();
                setItems(res.data || []);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-6">
            <h1 className="page-title">Repayment history</h1>
            <p className="page-sub">Requests where you are the borrower or the lender.</p>
            {items.length === 0 ? (
                <EmptyState title="No repayment history yet" />
            ) : (
                <div className="table-wrap overflow-hidden">
                    <table className="data-table">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs uppercase text-gray-500">Role</th>
                                <th className="px-4 py-3 text-left text-xs uppercase text-gray-500">Counterparty</th>
                                <th className="px-4 py-3 text-left text-xs uppercase text-gray-500">Amount</th>
                                <th className="px-4 py-3 text-left text-xs uppercase text-gray-500">Status</th>
                                <th className="px-4 py-3 text-left text-xs uppercase text-gray-500">Requested</th>
                                <th className="px-4 py-3 text-left text-xs uppercase text-gray-500">Responded</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {items.map((item) => {
                                const isBorrower = item.borrower?._id === user?._id;
                                const other = isBorrower ? item.lender : item.borrower;
                                return (
                                    <tr key={item._id}>
                                        <td className="px-4 py-3">{isBorrower ? 'Borrower' : 'Lender'}</td>
                                        <td className="px-4 py-3">{other?.name}</td>
                                        <td className="px-4 py-3">{formatCurrency(item.amount)}</td>
                                        <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                                        <td className="px-4 py-3 text-sm text-gray-500">{formatDate(item.requestDate)}</td>
                                        <td className="px-4 py-3 text-sm text-gray-500">{formatDate(item.responseDate)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default RepaymentHistory;
