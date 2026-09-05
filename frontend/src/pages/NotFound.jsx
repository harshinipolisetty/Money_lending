import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
        <p className="kicker">Lost the trail</p>
        <h1 className="page-title mt-3">404</h1>
        <p className="page-sub">This page is not on LendLoop.</p>
        <Link to="/dashboard" className="btn-primary mt-8">
            Go home
        </Link>
    </div>
);

export default NotFound;
