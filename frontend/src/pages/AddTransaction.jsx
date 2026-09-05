import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import * as transactionService from '../services/transactionService';

const schema = z.object({
    friendName: z.string().min(2, 'Name is required'),
    amount: z.coerce.number().positive('Amount must be positive'),
    type: z.enum(['lent', 'borrowed']),
    date: z.string().nonempty('Date is required'),
    dueDate: z.string().optional(),
    note: z.string().optional()
});

const field = 'input';

const AddTransaction = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { register, handleSubmit, watch, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            type: 'lent',
            date: new Date().toISOString().split('T')[0]
        }
    });

    const type = watch('type');

    const onSubmit = async (data) => {
        setLoading(true);
        setError('');
        try {
            await transactionService.createTransaction({
                ...data,
                dueDate: data.dueDate || undefined
            });
            navigate('/transactions');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add transaction');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl">
            <h1 className="page-title">Add transaction</h1>
            <p className="page-sub">
                {type === 'borrowed' ? 'Log money you borrowed outside the app.' : 'Log money you lent outside the app.'}
            </p>

            <div className="mt-8 surface p-8">
                {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-xl">{error}</div>}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div>
                        <label className="text-sm font-medium text-gray-800">Type</label>
                        <select className={field} {...register('type')}>
                            <option value="lent">Lent</option>
                            <option value="borrowed">Borrowed</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-800">Friend name</label>
                        <input className={field} placeholder="e.g. Rahul" {...register('friendName')} />
                        {errors.friendName && <p className="text-red-500 text-xs mt-1">{errors.friendName.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-800">Amount (₹)</label>
                            <input type="number" step="any" className={field} {...register('amount')} />
                            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-800">Date</label>
                            <input type="date" className={field} {...register('date')} />
                            {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-800">Due date (optional)</label>
                            <input type="date" className={field} {...register('dueDate')} />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-800">Note (optional)</label>
                        <textarea rows={3} className={field} placeholder="e.g. Dinner split" {...register('note')} />
                    </div>

                    <div className="flex items-center gap-4 pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary"
                        >
                            {loading ? 'Saving...' : 'Save transaction'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/transactions')}
                            className="text-sm font-medium text-gray-500 hover:text-gray-900"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddTransaction;
