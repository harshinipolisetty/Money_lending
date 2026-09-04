import React from 'react';

const StatusBadge = ({ status }) => {
    let colorClass = 'bg-gray-100 text-gray-600';
    let displayStatus = status || '';

    switch (status) {
        case 'active':
            colorClass = 'bg-sky-100 text-sky-800';
            break;
        case 'pending_approval':
        case 'pending':
            colorClass = 'bg-orange-100 text-orange-800';
            displayStatus = 'Pending approval';
            break;
        case 'repaid':
        case 'approved':
            colorClass = 'bg-emerald-100 text-emerald-800';
            break;
        case 'rejected':
            colorClass = 'bg-red-100 text-red-700';
            break;
        case 'lent':
            colorClass = 'bg-sky-100 text-sky-800';
            break;
        case 'borrowed':
            colorClass = 'bg-rose-100 text-rose-800';
            break;
        default:
            break;
    }

    const label = String(displayStatus).replace('_', ' ');
    return (
        <span className={`px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full capitalize ${colorClass}`}>
            {label}
        </span>
    );
};

export default StatusBadge;
