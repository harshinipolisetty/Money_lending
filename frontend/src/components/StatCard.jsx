import React from 'react';

const StatCard = ({ title, value, hint, tone = 'mint' }) => {
    if (tone === 'owe') {
        return (
            <div className="stat-cream p-6">
                <p className="text-sm text-moss-800/60">{title}</p>
                <p className="mt-3 font-display text-3xl font-medium text-coral-600">{value}</p>
                {hint && <p className="mt-1 text-sm text-moss-800/55">{hint}</p>}
            </div>
        );
    }
    return (
        <div className="stat-mint p-6">
            <p className="text-sm text-sand-100/70">{title}</p>
            <p className="mt-3 font-display text-3xl font-medium">{value}</p>
            {hint && <p className="mt-1 text-sm text-sand-100/65">{hint}</p>}
        </div>
    );
};

export default StatCard;
