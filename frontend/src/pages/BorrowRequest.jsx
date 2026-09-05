import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import * as userService from '../services/userService';
import * as borrowRequestService from '../services/borrowRequestService';
import { Search } from 'lucide-react';

const schema = z.object({
    amount: z.coerce.number().positive('Amount must be positive'),
    reason: z.string().min(3, 'Reason is required'),
    dueDate: z.string().optional()
});

const BorrowRequest = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(schema)
    });

    useEffect(() => {
        userService.getAllUsers()
            .then((res) => setAllUsers(res.data || []))
            .catch(() => {});
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.length >= 2) {
                try {
                    const res = await userService.searchUsers(searchQuery);
                    setSearchResults(res.data);
                } catch (err) {
                    console.error(err);
                }
            } else {
                setSearchResults([]);
            }
        }, 400);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const onSubmit = async (data) => {
        if (!selectedUser) {
            setError('Please select a user to send the request to.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await borrowRequestService.sendBorrowRequest({
                lenderId: selectedUser._id,
                amount: data.amount,
                reason: data.reason,
                dueDate: data.dueDate || undefined
            });
            navigate('/borrower-dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send request');
        } finally {
            setLoading(false);
        }
    };

    const chooseUser = (user) => {
        setSelectedUser(user);
        setSearchQuery(user.name);
        setSearchResults([]);
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="page-title">Request a loan</h1>
            <p className="page-sub">
                Search or pick a registered lender. They will get an email, and an SMS if they saved a phone number.
            </p>

            <div className="surface p-8">
                {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>}

                <div className="mb-6 relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Find lender</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name or email"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setSelectedUser(null);
                            }}
                            className="block w-full pl-10 pr-3 py-2.5 border border-paper-line rounded-xl bg-white/70 text-sm"
                        />
                    </div>

                    {searchResults.length > 0 && !selectedUser && (
                        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 ring-1 ring-black ring-opacity-5 overflow-auto">
                            {searchResults.map((user) => (
                                <button
                                    type="button"
                                    key={user._id}
                                    onClick={() => chooseUser(user)}
                                    className="w-full text-left py-2 pl-3 pr-9 hover:bg-blue-50"
                                >
                                    <div className="font-medium truncate">{user.name}</div>
                                    <div className="text-gray-500 text-xs truncate">{user.email}</div>
                                </button>
                            ))}
                        </div>
                    )}

                    {selectedUser && (
                        <div className="mt-2 inline-flex items-center bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                            Selected: {selectedUser.name}
                            <button type="button" onClick={() => { setSelectedUser(null); setSearchQuery(''); }} className="ml-2">×</button>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Amount (₹)</label>
                        <input
                            type="number"
                            step="any"
                            {...register('amount')}
                            className="input"
                        />
                        {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Due date (optional)</label>
                        <input type="date" {...register('dueDate')} className="input" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Reason / Note</label>
                        <textarea
                            {...register('reason')}
                            rows={3}
                            className="input"
                        />
                        {errors.reason && <p className="text-red-500 text-xs mt-1">{errors.reason.message}</p>}
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button type="button" onClick={() => navigate('/borrower-dashboard')} className="py-2 px-4 border rounded-md text-sm">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !selectedUser}
                            className={`btn-primary ${loading || !selectedUser ? 'opacity-50' : ''}`}
                        >
                            {loading ? 'Sending...' : 'Send request'}
                        </button>
                    </div>
                </form>
            </div>

            <div>
                <h2 className="text-lg font-semibold mb-3">All registered users</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                    {allUsers.map((user) => (
                        <button
                            type="button"
                            key={user._id}
                            onClick={() => chooseUser(user)}
                            className="text-left surface p-4 hover:shadow-glow transition"
                        >
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            <span className={`mt-2 inline-block text-xs px-2 py-1 rounded-full ${
                                user.availability === 'Currently Borrowing'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-green-100 text-green-800'
                            }`}>
                                {user.availability || 'Available to Lend'}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BorrowRequest;
