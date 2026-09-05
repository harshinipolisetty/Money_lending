import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import useAuth from '../hooks/useAuth';
import AuthLayout from '../components/AuthLayout';

const schema = z.object({
    name: z.string().min(2, { message: 'Name is required' }),
    email: z.string().email({ message: 'Invalid email address' }),
    phone: z.string().optional(),
    upiId: z.string().optional(),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' })
});

const fieldClass = 'input';

const Register = () => {
    const { register: registerUser } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(schema)
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        setError('');
        try {
            await registerUser(data);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            brandSide="right"
            headline="One place for every rupee you lent or owe."
            description="Borrow requests, lender approvals, repayment confirmations and shareable UPI QR codes."
        >
            <p className="kicker">Join LendLoop</p>
            <h1 className="page-title mt-2 text-[2.1rem] sm:text-[2.4rem]">
                Create your account
            </h1>
            <p className="page-sub">
                Add UPI details to generate your payment QR code.
            </p>

            {error && (
                <div className="mt-5 alert-error">
                    {error}
                </div>
            )}

            <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <div>
                    <label className="label" htmlFor="name">Full name</label>
                    <input id="name" placeholder="Aarav Mehta" className={fieldClass} {...register('name')} />
                    {errors.name && <p className="mt-1 text-xs text-coral-600">{errors.name.message}</p>}
                </div>
                <div>
                    <label className="label" htmlFor="email">Email</label>
                    <input id="email" type="email" placeholder="you@mail.com" className={fieldClass} {...register('email')} />
                    {errors.email && <p className="mt-1 text-xs text-coral-600">{errors.email.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="label" htmlFor="phone">Phone (optional)</label>
                        <input id="phone" placeholder="98765 43210" className={fieldClass} {...register('phone')} />
                    </div>
                    <div>
                        <label className="label" htmlFor="upiId">UPI ID (optional)</label>
                        <input id="upiId" placeholder="aarav@okaxis" className={fieldClass} {...register('upiId')} />
                    </div>
                </div>
                <div>
                    <label className="label" htmlFor="password">Password</label>
                    <input id="password" type="password" className={fieldClass} {...register('password')} />
                    {errors.password && <p className="mt-1 text-xs text-coral-600">{errors.password.message}</p>}
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary mt-2 w-full rounded-xl"
                >
                    {isLoading ? 'Creating...' : 'Create account'}
                </button>
            </form>

            <p className="mt-7 text-center text-sm text-moss-800/60">
                Already registered?{' '}
                <Link to="/login" className="font-semibold text-moss-800 hover:text-gold-600">
                    Sign in
                </Link>
            </p>
        </AuthLayout>
    );
};

export default Register;
