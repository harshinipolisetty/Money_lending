import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import useAuth from '../hooks/useAuth';
import AuthLayout from '../components/AuthLayout';
import { getApiBaseUrl } from '../utils/apiBase';

const schema = z.object({
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' })
});

const fieldClass = 'input';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            email: 'lender@test.com',
            password: 'Test@12345'
        }
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        setError('');
        try {
            await login(data.email, data.password);
            navigate('/dashboard');
        } catch (err) {
            const offline = err.request && !err.response;
            const onLocalPage = typeof window !== 'undefined'
                && ['localhost', '127.0.0.1'].includes(window.location.hostname);
            setError(
                err.response?.data?.message
                || (offline
                    ? (onLocalPage
                        ? 'This is the local app, not the shared site. On another laptop open https://money-lending1.vercel.app — do not open localhost:5173.'
                        : `Cannot reach ${getApiBaseUrl()}. Wait up to a minute for Render to wake, then retry. Confirm https://money-lending-1-5xq3.onrender.com/api/health opens.`)
                    : 'Login failed. Please try again.')
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            brandSide="left"
            headline="Money between friends, without the awkward reminders."
            description="Log what you lent, request loans from people you trust, confirm repayments and settle instantly with UPI QR codes."
        >
            <p className="kicker">Welcome</p>
            <h1 className="page-title mt-2">Sign in</h1>
            <p className="page-sub">
                Try lender@test.com or borrower@test.com
            </p>

            {error && (
                <div className="mt-5 alert-error">
                    {error}
                </div>
            )}

            <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
                <div>
                    <label htmlFor="email" className="label">Email</label>
                    <input id="email" type="email" className={fieldClass} {...register('email')} />
                    {errors.email && <p className="mt-1 text-xs text-coral-600">{errors.email.message}</p>}
                </div>
                <div>
                    <label htmlFor="password" className="label">Password</label>
                    <input id="password" type="password" className={fieldClass} {...register('password')} />
                    {errors.password && <p className="mt-1 text-xs text-coral-600">{errors.password.message}</p>}
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary mt-2 w-full rounded-xl"
                >
                    {isLoading ? 'Signing in...' : 'Sign in'}
                </button>
            </form>

            <p className="mt-8 text-center text-sm text-moss-800/60">
                No account?{' '}
                <Link to="/register" className="font-semibold text-moss-800 hover:text-gold-600">
                    Create one
                </Link>
            </p>
        </AuthLayout>
    );
};

export default Login;
