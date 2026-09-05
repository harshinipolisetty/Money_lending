import React from 'react';

const StatusBadge = ({ status, amountPaid }) => {
    let colorClass = 'bg-moss-50 text-moss-800';
    let displayStatus = status || '';

    if (status === 'active' && Number(amountPaid) > 0) {
        return (
            <span className="px-2.5 py-0.5 inline-flex text-[11px] font-semibold rounded-full bg-gold-400/25 text-gold-600">
                Partial
            </span>
        );
    }

    switch (status) {
        case 'active':
            colorClass = 'bg-moss-100 text-moss-800';
            break;
        case 'pending_approval':
        case 'pending':
            colorClass = 'bg-amber-100 text-amber-800';
            displayStatus = 'Pending approval';
            break;
        case 'repaid':
        case 'approved':
            colorClass = 'bg-moss-100 text-moss-800';
            break;
        case 'rejected':
            colorClass = 'bg-red-50 text-coral-600';
            break;
        case 'lent':
            colorClass = 'bg-moss-100 text-moss-800';
            break;
        case 'borrowed':
            colorClass = 'bg-red-50 text-coral-600';
            break;
        default:
            break;
    }

    const label = String(displayStatus).replace('_', ' ');
    return (
        <span className={`px-2.5 py-0.5 inline-flex text-[11px] font-semibold rounded-full capitalize ${colorClass}`}>
            {label}
        </span>
    );
};

export default StatusBadge;
