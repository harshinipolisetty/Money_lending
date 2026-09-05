import React from 'react';

const EmptyState = ({ title, message, action, compact }) => (
    <div className={`text-center surface ${compact ? 'p-6' : 'p-12'}`}>
        <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-moss-100 text-moss-800 grid place-items-center text-lg">✦</div>
        <p className={`font-display text-moss-900 ${compact ? 'text-lg' : 'text-2xl'}`}>{title}</p>
        {message && <p className="text-moss-800/60 mt-2 text-sm">{message}</p>}
        {action && <div className="mt-5">{action}</div>}
    </div>
);

export default EmptyState;
