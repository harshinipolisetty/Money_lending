import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import * as transactionService from '../services/transactionService';

const schema = z.object({
    friendName: z.string().min(2, 'Name is required'),
    amount: z.coerce.number().positive('Amount must be positive'),
    type: z.enum(['lent', 'borrowed']),
    date: z.string().nonempty('Date is required'),
    note: z.string().optional()
});

const EditTransaction = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [isLinked, setIsLinked] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(schema)
    });

    useEffect(() => {
        const fetchTransaction = async () => {
            try {
                const response = await transactionService.getTransaction(id);
                const tx = response.data;
                
                if (tx.borrowRequest) {
                    setIsLinked(true);
                }

                reset({
                    friendName: tx.friendName || tx.otherUser?.name || '',
                    amount: tx.amount,
                    type: tx.type,
                    date: new Date(tx.date).toISOString().split('T')[0],
                    note: tx.note || ''
                });
            } catch (err) {
                setError('Failed to fetch transaction details');
            } finally {
                setLoading(false);
            }
        };

        fetchTransaction();
    }, [id, reset]);

    const onSubmit = async (data) => {
        setSaving(true);
        setError('');
        try {
            await transactionService.updateTransaction(id, data);
            navigate('/transactions');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update transaction');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="h-10 w-10 rounded-full border-2 border-gray-200 border-t-emerald-800 animate-spin" />
            </div>
        );
    }

    if (isLinked) {
        return (
            <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-gray-100 p-8 text-center">
                <h2 className="text-2xl font-semibold text-gray-950 mb-2">Linked transaction</h2>
                <p className="text-gray-500 mb-6">This transaction was created from a borrow request and cannot be edited.</p>
                <button onClick={() => navigate('/transactions')} className="text-emerald-800 font-medium hover:underline">
                    Back to transactions
                </button>
            </div>
        );
    }

    const field =
        'mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] text-gray-900 outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/10';

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl font-semibold tracking-tight text-gray-950">Edit transaction</h1>
            <p className="mt-1 mb-8 text-gray-500">Update the details you logged.</p>
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 md:p-10">
                {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-xl">{error}</div>}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div>
                        <label className="text-sm font-medium text-gray-700">Friend name</label>
                        <input type="text" {...register('friendName')} className={field} />
                        {errors.friendName && <p className="text-red-500 text-xs mt-1">{errors.friendName.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700">Amount (₹)</label>
                            <input type="number" step="any" {...register('amount')} className={field} />
                            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Type</label>
                            <select {...register('type')} className={field}>
                                <option value="lent">Lent</option>
                                <option value="borrowed">Borrowed</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700">Date</label>
                        <input type="date" {...register('date')} className={field} />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700">Note (optional)</label>
                        <textarea {...register('note')} rows={3} className={field} />
                    </div>

                    <div className="flex items-center gap-6 pt-2">
                        <button type="submit" disabled={saving} className="rounded-lg bg-emerald-900 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">
                            {saving ? 'Saving...' : 'Save transaction'}
                        </button>
                        <button type="button" onClick={() => navigate('/transactions')} className="text-sm font-medium text-gray-600">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditTransaction;
