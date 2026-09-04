import React from 'react';

const StatCard = ({ title, value, hint, tone = 'mint' }) => {
    const bg = tone === 'owe' ? 'bg-white border border-gray-100' : 'bg-emerald-50';
    const valueColor = tone === 'owe' ? 'text-rose-600' : 'text-emerald-900';
    return (
        <div className={`rounded-3xl p-6 ${bg}`}>
            <p className="text-sm text-gray-500">{title}</p>
            <p className={`mt-3 text-3xl font-semibold ${valueColor}`}>{value}</p>
            {hint && <p className="mt-1 text-sm text-gray-500">{hint}</p>}
        </div>
    );
};

export default StatCard;
