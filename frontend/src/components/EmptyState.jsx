import React from 'react';

const EmptyState = ({ title, message, action }) => (
    <div className="text-center p-12 bg-white rounded-3xl border border-gray-100 shadow-sm">
        <p className="text-lg font-semibold text-gray-900">{title}</p>
        {message && <p className="text-gray-500 mt-2">{message}</p>}
        {action && <div className="mt-5">{action}</div>}
    </div>
);

export default EmptyState;
