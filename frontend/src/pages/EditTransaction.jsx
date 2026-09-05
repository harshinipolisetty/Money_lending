import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import * as transactionService from '../services/transactionService';
import PaymentProgressFields, {
    paidFromProgress,
    progressFromTransaction
} from '../components/PaymentProgressFields';

const schema = z.object({
    friendName: z.string().min(2, 'Name is required'),
    amount: z.coerce.number().positive('Amount must be positive'),
    type: z.enum(['lent', 'borrowed']),
    date: z.string().nonempty('Date is required'),
    dueDate: z.string().optional(),
    note: z.string().optional()
});

const EditTransaction = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [isLinked, setIsLinked] = useState(false);
    const [progress, setProgress] = useState('outstanding');
    const [customPaid, setCustomPaid] = useState('');

    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
        resolver: zodResolver(schema)
    });

    const amount = watch('amount');

    useEffect(() => {
        const fetchTransaction = async () => {
            try {
                const response = await transactionService.getTransaction(id);
                const tx = response.data;
                setIsLinked(Boolean(tx.borrowRequest));
                const nextProgress = progressFromTransaction(tx);
                setProgress(nextProgress);
                setCustomPaid(String(tx.amountPaid || 0));

                reset({
                    friendName: tx.friendName || tx.otherUser?.name || '',
                    amount: tx.principalAmount || tx.originalAmount || tx.amount,
                    type: tx.type,
                    date: new Date(tx.date).toISOString().split('T')[0],
                    dueDate: tx.dueDate ? new Date(tx.dueDate).toISOString().split('T')[0] : '',
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
            const amountPaid = paidFromProgress(progress, data.amount, customPaid);
            if (amountPaid > data.amount) {
                setError('Amount paid cannot exceed the loan amount');
                setSaving(false);
                return;
            }
            const payload = isLinked
                ? {
                    date: data.date,
                    dueDate: data.dueDate || undefined,
                    note: data.note,
                    amountPaid
                }
                : {
                    ...data,
                    dueDate: data.dueDate || undefined,
                    amountPaid
                };
            await transactionService.updateTransaction(id, payload);
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

    const field = 'input';

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="page-title">Edit transaction</h1>
            <p className="page-sub mb-8">
                {isLinked
                    ? 'This loan is linked to a borrow request. You can still record a half payment or mark it fully paid.'
                    : 'Update the details and how much has been repaid.'}
            </p>
            <div className="surface p-8 md:p-10">
                {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-xl">{error}</div>}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div>
                        <label className="text-sm font-medium text-gray-700">Friend name</label>
                        <input type="text" disabled={isLinked} {...register('friendName')} className={field} />
                        {errors.friendName && <p className="text-red-500 text-xs mt-1">{errors.friendName.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700">Amount (₹)</label>
                            <input type="number" step="any" disabled={isLinked} {...register('amount')} className={field} />
                            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Type</label>
                            <select disabled={isLinked} {...register('type')} className={field}>
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
                        <label className="text-sm font-medium text-gray-700">Due date (optional)</label>
                        <input type="date" {...register('dueDate')} className={field} />
                    </div>

                    <PaymentProgressFields
                        amount={amount}
                        progress={progress}
                        onProgressChange={setProgress}
                        customPaid={customPaid}
                        onCustomPaidChange={setCustomPaid}
                    />

                    <div>
                        <label className="text-sm font-medium text-gray-700">Note (optional)</label>
                        <textarea {...register('note')} rows={3} className={field} />
                    </div>

                    <div className="flex items-center gap-6 pt-2">
                        <button type="submit" disabled={saving} className="btn-primary">
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
