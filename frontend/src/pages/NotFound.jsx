import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
    <div className="min-h-screen bg-[#f7fbf9] flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-4xl font-semibold text-gray-950">404</h1>
        <p className="mt-2 text-gray-500">Page not found</p>
        <Link to="/dashboard" className="mt-6 text-emerald-800 font-medium hover:underline">
            Go home
        </Link>
    </div>
);

export default NotFound;
